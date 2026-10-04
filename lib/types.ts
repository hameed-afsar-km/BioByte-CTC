import type { StatKey } from "@/data/site";

export type Year = "1" | "2" | "3" | "4";

export type Member = {
  name: string;
  registrationNo: string;
  year: Year | "";
  semester: string;
  course: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
};

export type FieldErrors = Record<string, string | undefined>;

/** What the form holds before it is written to Firestore. */
export type RegistrationDraft = {
  teamName: string;
  collegeName: string;
  teamSize: number;
  members: Member[];
  emailId: string;
  problemId: string;
  abstract: string;
  ppt: File | null;
  assistanceRequirement: string;
};

/** The shape stored at `registrations/{id}`. */
export type RegistrationRecord = {
  id: string;
  passId: string;
  uid: string | null;
  teamName: string;
  collegeName: string;
  teamSize: number;
  members: Member[];
  emailId: string;
  problemId: string;
  problemTitle: string;
  alien: string;
  hue: string;
  abstract: string;
  pptUrl: string | null;
  pptPath: string | null;
  pptName: string | null;
  assistanceRequirement: string;
  round: string;
  status: "registered" | "shortlisted" | "rejected";
  statusReason?: string;
  createdAt: { seconds: number } | null;
  updatedAt?: { seconds: number } | null;
};

export type AuditLog = {
  id: string;
  adminEmail: string;
  action: string;
  teamName: string;
  reason: string;
  timestamp: { seconds: number } | null;
};

export type AlienPower = StatKey;