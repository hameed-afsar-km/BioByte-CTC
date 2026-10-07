"use client";

import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";

import { EVENT } from "@/data/site";
import { db, isFirebaseReady } from "./firebase";

export const SETTINGS_DOC_ID = "site";
export const SETTINGS_COLLECTION = "settings";

export type SiteSettings = {
  /** Master switch an admin can flip from the dashboard. */
  registrationsOpen: boolean;
  /** Registration deadline as an ISO string. `null` = no deadline set. */
  deadline: string | null;
};

export type RegistrationGate = {
  open: boolean;
  reason: string | null;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  registrationsOpen: true,
  deadline: EVENT.deadline,
};

/** The stored deadline is a Firestore Timestamp; the site works in ISO strings. */
function normalizeDeadline(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string" && value.trim() !== "") return value;
  return null;
}

/**
 * Reads `settings/site`, falling back to the build-time defaults so the site
 * still works before the document (or the security rules) exist.
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isFirebaseReady) return DEFAULT_SETTINGS;

  try {
    const snapshot = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
    if (!snapshot.exists()) return DEFAULT_SETTINGS;

    const data = snapshot.data();
    return {
      registrationsOpen:
        typeof data.registrationsOpen === "boolean"
          ? data.registrationsOpen
          : DEFAULT_SETTINGS.registrationsOpen,
      deadline: normalizeDeadline(data.deadline) ?? DEFAULT_SETTINGS.deadline,
    };
  } catch (error) {
    console.warn("[settings] Could not read site settings, using defaults", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Writes the full settings document. Both fields are always written together
 * so the security rules can validate a complete payload.
 */
export async function saveSiteSettings(
  next: SiteSettings,
  adminEmail: string,
  reason: string,
): Promise<void> {
  if (!isFirebaseReady) {
    throw new Error("Firebase is not configured. Settings were not saved.");
  }

  const deadline = next.deadline ? new Date(next.deadline) : null;
  if (deadline && Number.isNaN(deadline.getTime())) {
    throw new Error("The registration deadline is not a valid date.");
  }

  await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), {
    registrationsOpen: next.registrationsOpen,
    deadline: deadline ? Timestamp.fromDate(deadline) : null,
    updatedAt: serverTimestamp(),
    updatedBy: adminEmail,
  });

  const logRef = doc(collection(db, "audit_logs"));
  await setDoc(logRef, {
    action: "SETTINGS",
    teamName: "Registration Settings",
    reason,
    adminEmail,
    timestamp: serverTimestamp(),
  });
}

/**
 * Single source of truth for "may someone register right now?".
 *
 * The same check runs in firestore.rules on every create — this copy exists to
 * tell the user why they are blocked instead of surfacing a raw permission
 * error after they have filled in the whole form.
 */
export function registrationGate(
  settings: SiteSettings,
  now: number = Date.now(),
): RegistrationGate {
  if (!settings.registrationsOpen) {
    return {
      open: false,
      reason: "Registrations are currently closed by the organisers.",
    };
  }

  if (settings.deadline) {
    const end = new Date(settings.deadline).getTime();
    if (Number.isFinite(end) && now > end) {
      return { open: false, reason: "Registration deadline is closed." };
    }
  }

  return { open: true, reason: null };
}
