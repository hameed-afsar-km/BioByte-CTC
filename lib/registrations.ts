"use client";

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { PROBLEMS } from "@/data/site";
import { db, storage } from "./firebase";
import { cleanMembers } from "./validation";
import type {
  Member,
  RegistrationDraft,
  RegistrationRecord,
  SlotSummary,
  TrackSlot,
} from "./types";

export const REGISTRATIONS_COLLECTION = "registrations";
export const TRACK_SLOTS_COLLECTION = "trackSlots";

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
 * The slot counter and the registration document are written in a single
 * transaction, so two teams can never claim the last seat on the same track.
 * The PPT upload happens first because Storage cannot join a Firestore
 * transaction; if the transaction rejects, the upload is rolled back.
 */
export async function submitRegistration(input: {
  draft: RegistrationDraft;
  uid: string | null;
}): Promise<{ id: string; passId: string }> {
  const { draft, uid } = input;

  const track = PROBLEMS.find((problem) => problem.id === draft.problemId);
  if (!track) {
    throw new RegistrationError("TRACK_UNKNOWN", "Select a mission file before transforming.");
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
      const uploaded = await uploadBytes(storageRef(storage, pptPath), draft.ppt, {
        contentType: draft.ppt.type || "application/octet-stream",
      });
      pptUrl = await getDownloadURL(uploaded.ref);
    } catch {
      throw new RegistrationError(
        "PPT_UPLOAD_FAILED",
        "The PPT upload was rejected by the server. Check your connection and try again.",
      );
    }
  }

  try {
    await runTransaction(db, async (transaction) => {
      const registrationRef = doc(db, REGISTRATIONS_COLLECTION, id);
      const slotRef = doc(db, TRACK_SLOTS_COLLECTION, track.id);

      /* Every read must happen before any write inside a transaction. */
      const [existing, slotSnapshot] = await Promise.all([
        transaction.get(registrationRef),
        transaction.get(slotRef),
      ]);

      if (existing.exists()) {
        throw new RegistrationError(
          "ALREADY_REGISTERED",
          "This email address is already registered. Only one team per address.",
        );
      }

      const slot = slotSnapshot.data() as TrackSlot | undefined;
      const capacity = slot?.capacity ?? track.capacity;
      const count = slot?.count ?? 0;

      if (count >= capacity) {
        throw new RegistrationError(
          "TRACK_FULL",
          `All ${capacity} slots on the ${track.alien} track are taken. Pick another mission file.`,
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
        round: "round-1",
        status: "registered",
        createdAt: serverTimestamp(),
      });

      transaction.set(
        slotRef,
        {
          trackId: track.id,
          alien: track.alien,
          count: count + 1,
          capacity,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });
  } catch (error) {
    if (pptPath) {
      await deleteObject(storageRef(storage, pptPath)).catch(() => undefined);
    }
    throw error;
  }

  return { id, passId };
}

/** Reads the live slot counters for every track. */
export async function fetchSlots(): Promise<SlotSummary> {
  const snapshot = await getDocs(collection(db, TRACK_SLOTS_COLLECTION));
  const slots: SlotSummary = {};

  snapshot.forEach((entry) => {
    const data = entry.data() as TrackSlot;
    slots[entry.id] = { count: data.count ?? 0, capacity: data.capacity ?? 0 };
  });

  return slots;
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

/** Organiser-only: changes how many teams a track can take. */
export async function updateTrackCapacity(trackId: string, capacity: number) {
  const track = PROBLEMS.find((problem) => problem.id === trackId);
  if (!track) throw new Error("Unknown track.");

  await setDoc(
    doc(db, TRACK_SLOTS_COLLECTION, trackId),
    { trackId, alien: track.alien, capacity: Math.max(0, Math.round(capacity)) },
    { merge: true },
  );
}

/** Organiser-only: moves a team between shortlist states. */
export async function updateRegistrationStatus(
  id: string,
  status: RegistrationRecord["status"],
) {
  await setDoc(doc(db, REGISTRATIONS_COLLECTION, id), { status }, { merge: true });
}

/**
 * Organiser-only: removes a registration entirely.
 *
 * The seat is handed back in the same transaction, otherwise a deleted row
 * would keep occupying a slot forever and the track would slowly fill up with
 * phantom teams. The counter document itself is never deleted - the rules
 * reject that - so the ledger of every seat ever claimed stays auditable.
 */
export async function deleteRegistration(id: string) {
  const pptPath = await runTransaction(db, async (transaction) => {
    const registrationRef = doc(db, REGISTRATIONS_COLLECTION, id);
    const snapshot = await transaction.get(registrationRef);

    if (!snapshot.exists()) return null;

    const record = snapshot.data() as RegistrationRecord;
    const slotRef = doc(db, TRACK_SLOTS_COLLECTION, record.problemId);
    const slotSnapshot = await transaction.get(slotRef);
    const count = (slotSnapshot.data() as TrackSlot | undefined)?.count ?? 0;

    transaction.delete(registrationRef);

    if (slotSnapshot.exists() && count > 0) {
      transaction.set(
        slotRef,
        { count: count - 1, updatedAt: serverTimestamp() },
        { merge: true },
      );
    }

    return record.pptPath ?? null;
  });

  /* Storage is not part of the transaction - Firestore would have to hold a
     write lock open across a file upload. A leftover PPT is harmless; a lost
     seat is not, so the transaction goes first. */
  if (pptPath) {
    await deleteObject(storageRef(storage, pptPath)).catch(() => undefined);
  }
}