import { PROBLEMS } from "@/data/site";
import type { FieldErrors, Member, RegistrationDraft } from "./types";

/** Field length caps — mirrored by the Firestore write, never trusted alone. */
export const LIMITS = {
  teamName: 60,
  collegeName: 120,
  memberName: 80,
  phone: 20,
  department: 80,
  abstract: 1200,
} as const;

export const ABSTRACT_MIN = 30;
export const ABSTRACT_MAX = 1200;
export const MAX_PPT_BYTES = 10 * 1024 * 1024;
export const TEAM_MIN = 2;
export const TEAM_MAX = 4;
export const PPT_ACCEPT = ".ppt,.pptx,.pdf";

const PPT_EXTENSIONS = /\.(ppt|pptx|pdf)$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{6,20}$/;

export const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string) {
  return PHONE_RE.test(value.trim());
}

/** Rejects anything that is not a PPT/PDF, or is over the size cap. */
export function validatePptFile(file: File | null): string | null {
  if (!file) return "Upload your Round 1 PPT.";
  if (!PPT_EXTENSIONS.test(file.name)) return "Only .ppt, .pptx or .pdf files are accepted.";
  if (file.size > MAX_PPT_BYTES) return "File must be 10 MB or smaller.";
  return null;
}

/**
 * Full client-side validation of the draft.
 * Returns a map of `fieldKey -> message`; an empty map means the draft is good.
 */
export function validateDraft(draft: RegistrationDraft): FieldErrors {
  const errors: FieldErrors = {};

  if (draft.teamName.trim().length < 2) {
    errors.teamName = "Enter your team name.";
  } else if (draft.teamName.trim().length > LIMITS.teamName) {
    errors.teamName = `Max ${LIMITS.teamName} characters.`;
  }

  if (draft.collegeName.trim().length < 2) {
    errors.collegeName = "Enter your college name.";
  } else if (draft.collegeName.trim().length > LIMITS.collegeName) {
    errors.collegeName = `Max ${LIMITS.collegeName} characters.`;
  }

  if (!Number.isInteger(draft.teamSize) || draft.teamSize < TEAM_MIN || draft.teamSize > TEAM_MAX) {
    errors.teamSize = `Team size must be between ${TEAM_MIN} and ${TEAM_MAX}.`;
  }

  const phones = new Set<string>();

  draft.members.forEach((member: Member, index: number) => {
    if (member.name.trim().length < 2) {
      errors[`member_${index}_name`] = "Required";
    } else if (member.name.trim().length > LIMITS.memberName) {
      errors[`member_${index}_name`] = `Max ${LIMITS.memberName} characters.`;
    }

    const digits = digitsOnly(member.phone);
    if (digits.length < 10 || digits.length > 13) {
      errors[`member_${index}_phone`] = "Invalid number";
    } else if (phones.has(digits)) {
      errors[`member_${index}_phone`] = "Duplicate in team";
    } else {
      phones.add(digits);
    }

    if (member.department.trim().length < 2) {
      errors[`member_${index}_department`] = "Required";
    }

    if (!member.year) {
      errors[`member_${index}_year`] = "Required";
    }
  });

  if (!PROBLEMS.some((problem) => problem.id === draft.problemId)) {
    errors.problemId = "Select a mission file.";
  }

  errors.ppt = validatePptFile(draft.ppt) ?? undefined;

  const abstract = draft.abstract.trim();
  if (abstract.length < ABSTRACT_MIN) {
    errors.abstract = `Abstract must be at least ${ABSTRACT_MIN} characters.`;
  } else if (abstract.length > ABSTRACT_MAX) {
    errors.abstract = `Max ${ABSTRACT_MAX} characters.`;
  }

  return errors;
}

/** Strips empty entries so Firestore never stores blank strings. */
export function cleanMembers(members: Member[]): Member[] {
  return members
    .filter((member) => member.name.trim().length > 0)
    .map((member) => ({
      name: member.name.trim(),
      phone: member.phone.trim(),
      department: member.department.trim(),
      year: member.year,
    }));
}