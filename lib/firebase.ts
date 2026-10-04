"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { FIREBASE_PUBLIC_CONFIG } from "./firebaseConfig";

/**
 * Firebase web app singleton.
 *
 * Resolution order: NEXT_PUBLIC_FIREBASE_* env vars win when present,
 * otherwise the checked-in public config is used.
 *
 * This module deliberately does NOT throw when a value is missing. A missing
 * analytics id must never take the marketing site down — only the
 * registration flow cares, and it checks `isFirebaseReady` first.
 */
const fromEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "biobyte-1e69c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const config = { ...FIREBASE_PUBLIC_CONFIG };
Object.entries(fromEnv).forEach(([key, value]) => {
  if (value) config[key as keyof typeof config] = value;
});

/* Only what the app actually calls is fatal. */
const REQUIRED_KEYS: (keyof typeof config)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "appId",
];

export const missingFirebaseKeys = REQUIRED_KEYS.filter((key) => !config[key]);

export const isFirebaseReady = missingFirebaseKeys.length === 0;

if (!isFirebaseReady) {
  console.warn(
    `[omnicon] Firebase config incomplete: ${missingFirebaseKeys.join(", ")}. ` +
      "Registration will not work until these are provided, via " +
      "NEXT_PUBLIC_FIREBASE_* env vars or lib/firebaseConfig.ts.",
  );
}

/* getApps() guard: Next.js dev-mode re-evaluates modules on every edit, and
   initializeApp() throws on a second call with the same name. */
const app = getApps().length ? getApp() : initializeApp(config);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
