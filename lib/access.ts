/**
 * Access control for the registration flow.
 *
 * Registration is restricted to the @crescent.education domain only.
 *
 * The admin list is the union of:
 *   1. CANONICAL_ADMIN_EMAILS below — must be kept identical to
 *      isAdmin() in firestore.rules and storage.rules.
 *   2. NEXT_PUBLIC_ADMIN_EMAILS env var — an optional extra list managed
 *      via Vercel without a code change. It can only ADD to the canonical
 *      list for the UI; data access still requires the address to be in
 *      the security rules.
 *
 * The real security boundary is Firestore/Storage rules — this module is
 * a client-side pre-check only.
 */

/**
 * Single source of truth for who is an admin, on the client side.
 * MUST match isAdmin() in firestore.rules and storage.rules exactly —
 * an address in the UI list but not in the rules sees no data, and an
 * address in the rules but not here is blocked before it can load.
 */
export const CANONICAL_ADMIN_EMAILS: string[] = [
  "250151601005@crescent.education",
  "240151601011@crescent.education",
  "250151601072@crescent.education",
  "240071601264@crescent.education",
  "240071601263@crescent.education",
  "250071601227@crescent.education",
  "260071601257@crescent.education",
  "240071601217@crescent.education",
  "merfinhanson@gmail.com",
  "hameedafsar@gmail.com",
  "meharbasha@gmail.com",
];

/**
 * Optional extras from the env var NEXT_PUBLIC_ADMIN_EMAILS.
 * Comma-separated, e.g.:
 *   NEXT_PUBLIC_ADMIN_EMAILS=alice@crescent.education,bob@crescent.education
 * Falls back to an empty list if the var is not set.
 */
function loadAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const ADMIN_EMAILS: string[] = [
  ...new Set([...CANONICAL_ADMIN_EMAILS, ...loadAdminEmails()]),
];

/**
 * Only @crescent.education addresses may register as public users.
 * No other domain or individual override is accepted.
 */
const ALLOWED_DOMAIN = "crescent.education";

export function normaliseEmail(email?: string | null): string {
  return (email ?? "").toLowerCase().trim();
}

export function emailDomain(email?: string | null): string {
  return normaliseEmail(email).split("@")[1] ?? "";
}

export function isAllowedEmail(email?: string | null): boolean {
  const value = normaliseEmail(email);
  if (!value) return false;
  return emailDomain(value) === ALLOWED_DOMAIN;
}

export function isAdminEmail(email?: string | null): boolean {
  const value = normaliseEmail(email);
  if (!value) return false;
  return ADMIN_EMAILS.includes(value);
}

export const accessConfig = {
  allowedDomain: ALLOWED_DOMAIN,
  adminEmails: ADMIN_EMAILS,
};