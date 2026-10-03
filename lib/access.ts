/**
 * Access control for the registration flow.
 *
 * Registration is restricted to the @crescent.education domain only.
 * The admin list is loaded from the NEXT_PUBLIC_ADMIN_EMAILS environment
 * variable (comma-separated college mail IDs) so it can be managed via
 * Vercel environment variables without a code change.
 *
 * The real security boundary is Firestore/Storage rules — this module is
 * a client-side pre-check only.
 */

/**
 * Admin emails are loaded from the env var NEXT_PUBLIC_ADMIN_EMAILS.
 * This is a comma-separated list, e.g.:
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

const ADMIN_EMAILS: string[] = loadAdminEmails();

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