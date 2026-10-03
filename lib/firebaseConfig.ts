/**
 * Firebase web configuration — PUBLIC values.
 *
 * These are public client identifiers, not secrets. They are compiled into
 * the browser bundle by design and are readable by anyone who views source,
 * which is exactly how the Firebase Web SDK is meant to ship. The real
 * protections are Firebase Auth, Firestore and Storage security rules —
 * never this file.
 *
 * They are checked in so the site always boots: `process.env.NEXT_PUBLIC_*`
 * is inlined at BUILD time, so a deploy with no env vars set would otherwise
 * throw at module scope and take the whole site down with a black screen.
 * With this fallback the marketing site always renders, and registration
 * comes up on its own the moment real env vars are present.
 */
export const FIREBASE_PUBLIC_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

export default FIREBASE_PUBLIC_CONFIG;