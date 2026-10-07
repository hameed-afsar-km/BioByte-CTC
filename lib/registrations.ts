"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { PROBLEMS } from "@/data/site";
import { db, storage } from "./firebase";
import { supabase } from "./supabase";
import { fetchSiteSettings, registrationGate } from "./settings";
import { cleanMembers } from "./validation";
import type {
  Member,
  RegistrationDraft,
  RegistrationRecord,
  AuditLog,
} from "./types";

export const REGISTRATIONS_COLLECTION = "registrations";
const UPLOAD_TIMEOUT_MS = 30_000;

export class RegistrationError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "RegistrationError";
    this.code = code;
  }
}

/**
 * Deterministic document id derived from the email address.
 *
 * Firestore refuses to create a document that already exists, so this id is
 * what actually enforces "one registration per address" — a second attempt
 * from the same person collides instead of silently creating a second row.
 */
export function registrationIdFor(email: string): string {
  const value = email.toLowerCase().trim();
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return `reg-${(hash >>> 0).toString(36)}`;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-readable pass id printed on the confirmation ticket. */
export function generatePassId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);

  const chars = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]);
  return `OMNI-${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}`;
}

/**
 * Writes one registration.
 *
 * Tracks have no seat limit, so the only thing the transaction protects is the
 * "one registration per email address" rule — it reads first to return a
 * friendly error instead of a raw permission failure. The PPT upload happens
 * before the write because Storage cannot join a Firestore transaction; if the
 * transaction rejects, the upload is rolled back.
 */
export async function submitRegistration(input: {
  draft: RegistrationDraft;
  uid: string | null;
  onStatus?: (status: string) => void;
}): Promise<{ id: string; passId: string }> {
  const { draft, uid, onStatus } = input;

  const track = PROBLEMS.find((problem) => problem.id === draft.problemId);
  if (!track) {
    throw new RegistrationError("TRACK_UNKNOWN", "Select a mission file before transforming.");
  }

  /* Fresh read, right before anything is uploaded or written: the deadline
     may have passed while the form was being filled, or an admin may have
     closed registrations from the dashboard. firestore.rules enforces the
     same rule server-side — this check exists so the user gets a clear
     message instead of a raw permission denial. */
  const settings = await fetchSiteSettings();
  const gate = registrationGate(settings);
  if (!gate.open) {
    throw new RegistrationError("REGISTRATION_CLOSED", gate.reason ?? "Registration is closed.");
  }

  const id = registrationIdFor(draft.emailId);
  const passId = generatePassId();

  let pptUrl: string | null = null;
  let pptPath: string | null = null;

  /* passId keeps each attempt on its own path, so a rejected duplicate can
     never overwrite the PPT belonging to the registration that already won. */
  if (draft.ppt) {
    const safeName = draft.ppt.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    pptPath = `ppts/${id}/${passId}-${safeName}`;

    try {
      onStatus?.("Uploading mission data...");
      let contentType = draft.ppt.type;
      const lowerName = draft.ppt.name.toLowerCase();
      if (lowerName.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (lowerName.endsWith(".pptx")) {
        contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      } else if (lowerName.endsWith(".ppt")) {
        contentType = "application/vnd.ms-powerpoint";
      } else {
        contentType = "application/octet-stream";
      }

      try {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 15) + 5;
          if (progress > 95) progress = 95;
          onStatus?.(`Uploading mission data (${progress}%)`);
        }, 500);

        const { data, error } = await supabase.storage
          .from('submissions')
          .upload(pptPath, draft.ppt, {
            cacheControl: '3600',
            upsert: true,
            contentType: contentType,
          });

        clearInterval(interval);
        
        if (error) {
          throw error;
        }

        onStatus?.(`Uploading mission data (100%)`);
      } catch (error) {
        throw new RegistrationError(
          "PPT_UPLOAD_FAILED",
          "The PPT upload was rejected by the server. Check your connection and try again.",
        );
      }
      
      onStatus?.("Mission data secured.");
      const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(pptPath);
      pptUrl = publicUrl;
    } catch (error) {
      if (error instanceof RegistrationError) throw error;
      throw new RegistrationError(
        "PPT_UPLOAD_FAILED",
        "The PPT upload was rejected by the server. Check your connection and try again.",
      );
    }
  }

  try {
    onStatus?.("Encrypting and finalising registration...");
    await runTransaction(db, async (transaction) => {
      const registrationRef = doc(db, REGISTRATIONS_COLLECTION, id);

      const existing = await transaction.get(registrationRef);

      if (existing.exists()) {
        throw new RegistrationError(
          "ALREADY_REGISTERED",
          "This email address is already registered. Only one team per address.",
        );
      }

      const members: Member[] = cleanMembers(draft.members);

      transaction.set(registrationRef, {
        id,
        passId,
        uid,
        teamName: draft.teamName.trim(),
        collegeName: draft.collegeName.trim(),
        teamSize: members.length,
        members,
        emailId: draft.emailId.toLowerCase().trim(),
        problemId: track.id,
        problemTitle: track.title,
        alien: track.alien,
        hue: track.hue,
        abstract: draft.abstract.trim(),
        pptUrl,
        pptPath,
        pptName: draft.ppt?.name ?? null,
        assistanceRequirement: draft.assistanceRequirement,
        round: "round-1",
        status: "registered",
        createdAt: serverTimestamp(),
      });
    });
  } catch (error) {
    if (pptPath) {
      await supabase.storage.from('submissions').remove([pptPath]).catch(() => undefined);
    }
    throw error;
  }

  return { id, passId };
}

/** Reads every registration, newest first. */
export async function fetchRegistrations(): Promise<RegistrationRecord[]> {
  const snapshot = await getDocs(
    query(collection(db, REGISTRATIONS_COLLECTION), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return { ...(data as RegistrationRecord), id: entry.id };
  });
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const snapshot = await getDocs(
    query(collection(db, "audit_logs"), orderBy("timestamp", "desc")),
  );

  return snapshot.docs.map((entry) => {
    const data = entry.data();
    return { ...(data as AuditLog), id: entry.id };
  });
}

/** Organiser-only: moves a team between shortlist states. */
export async function updateRegistrationStatus(
  id: string,
  teamName: string,
  adminEmail: string,
  status: RegistrationRecord["status"],
  reason: string
) {
  await setDoc(doc(db, REGISTRATIONS_COLLECTION, id), { 
    status,
    statusReason: reason,
    updatedAt: serverTimestamp()
  }, { merge: true });

  const logRef = doc(collection(db, "audit_logs"));
  await setDoc(logRef, {
    action: status === "shortlisted" ? "SHORTLISTED" : status === "rejected" ? "REJECTED" : "REGISTERED",
    teamName,
    reason,
    adminEmail,
    timestamp: serverTimestamp()
  });
}


export async function updateRegistrationDetails(
  id: string,
  teamName: string,
  adminEmail: string,
  updates: Partial<RegistrationRecord>,
  changesText: string
) {
  await setDoc(doc(db, REGISTRATIONS_COLLECTION, id), { 
    ...updates,
    updatedAt: serverTimestamp()
  }, { merge: true });

  const logRef = doc(collection(db, "audit_logs"));
  await setDoc(logRef, {
    action: "EDITED",
    teamName,
    reason: `Edited team details. Changes: ${changesText}`,
    adminEmail,
    timestamp: serverTimestamp()
  });
}

export async function clearAuditLogs() {
  const { deleteDoc } = await import("firebase/firestore");
  const snapshot = await getDocs(collection(db, "audit_logs"));
  const promises = snapshot.docs.map(docSnap => deleteDoc(doc(db, "audit_logs", docSnap.id)));
  await Promise.all(promises);
}

/**
 * Organiser-only: removes a registration entirely.
 *
 * With no seat limit there is no counter to hand back, so this is a plain
 * read-then-delete. The transaction is kept only so the row cannot change
 * between the read that finds the PPT path and the delete that drops the row.
 */
export async function deleteRegistration(id: string, adminEmail: string, teamDetails: string, teamName: string) {
  const pptPath = await runTransaction(db, async (transaction) => {
    const registrationRef = doc(db, REGISTRATIONS_COLLECTION, id);
    const snapshot = await transaction.get(registrationRef);

    if (!snapshot.exists()) return null;

    const record = snapshot.data() as RegistrationRecord;

    transaction.delete(registrationRef);
    
    const logRef = doc(collection(db, "audit_logs"));
    transaction.set(logRef, {
      action: "DELETED",
      teamName,
      reason: `Deleted team. Details: ${teamDetails}`,
      adminEmail,
      timestamp: serverTimestamp()
    });

    return record.pptPath ?? null;
  });

  /* Storage is not part of the transaction - Firestore would have to hold a
     write lock open across a file upload. A leftover PPT is harmless. */
  if (pptPath) {
    await supabase.storage.from('submissions').remove([pptPath]).catch(() => undefined);
  }
}

export async function checkRegistrationExists(email: string): Promise<{ id: string; passId: string } | null> {
  const id = registrationIdFor(email);
  const registrationRef = doc(db, REGISTRATIONS_COLLECTION, id);
  const snap = await getDoc(registrationRef);
  
  if (snap.exists()) {
    const data = snap.data();
    return { id, passId: data.passId };
  }
  return null;
}
