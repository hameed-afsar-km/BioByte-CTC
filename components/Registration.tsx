"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  FileText,
  GraduationCap,
  IndianRupee,
  ListChecks,
  LoaderCircle,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  TriangleAlert,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  reload as reloadUser,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { EVENT, PROBLEMS } from "@/data/site";
import { auth, isFirebaseReady, missingFirebaseKeys } from "@/lib/firebase";
import { isAllowedEmail } from "@/lib/access";
import {
  RegistrationError,
  fetchRegistrations,
  registrationIdFor,
  submitRegistration,
} from "@/lib/registrations";
import {
  ABSTRACT_MAX,
  MAX_PPT_BYTES,
  PPT_ACCEPT,
  TEAM_MAX,
  TEAM_MIN,
  validateDraft,
} from "@/lib/validation";
import { consumePendingTrack, SELECT_TRACK_EVENT } from "@/lib/registerGate";
import type { FieldErrors, Member } from "@/lib/types";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import TrackConfirmModal from "./TrackConfirmModal";

const STAGE = {
  AUTH: "auth",
  VERIFY: "verify",
  FORM: "form",
} as const;

const emptyMember = (): Member => ({
  name: "",
  registrationNo: "",
  year: "",
  semester: "",
  course: "",
  email: "",
  phone: "",
  address: "",
  dob: "",
});

const emptyForm = () => ({
  teamName: "",
  collegeName: "BSA Crescent Institute of Science and Technology",
  teamSize: 0,
  members: [] as Member[],
  problemId: "",
  abstract: "",
  ppt: null as File | null,
});

/** Rejects with a clear message if a promise never settles. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      window.setTimeout(() => reject(new Error(`${label} timed out. Please try again.`)), ms),
    ),
  ]);
}

/** auth.currentUser is nullable; the verify stage already guarantees a session. */
function requireUser() {
  const current = auth.currentUser;
  if (!current) throw new Error("Your session expired. Please sign in again.");
  return current;
}

export default function Registration() {
  const router = useRouter();

  const [stage, setStage] = useState<(typeof STAGE)[keyof typeof STAGE]>(STAGE.AUTH);
  const [user, setUser] = useState<User | null>(null);
  const [returning, setReturning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [restoringCache, setRestoringCache] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState<string | null>(null);

  const isRestoringRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    try {
      const saved = localStorage.getItem("biobyte_registration_form");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0 && parsed.teamName !== undefined) {
          isRestoringRef.current = true;
          setRestoringCache(true);
          
          setTimeout(() => {
            setForm((current) => ({
              ...current,
              ...parsed,
              collegeName: "BSA Crescent Institute of Science and Technology",
              ppt: null
            }));
            isRestoringRef.current = false;
            setRestoringCache(false);
            setRestoredNotice("Local progress restored successfully.");
            setTimeout(() => setRestoredNotice(null), 5000);
          }, 1500);
        }
      }
    } catch (e) {
      console.warn("Failed to restore local form cache", e);
      isRestoringRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isRestoringRef.current && hasInitializedRef.current) {
      const { ppt, ...toSave } = form;
      localStorage.setItem("biobyte_registration_form", JSON.stringify(toSave));
    }
  }, [form]);

  /* Track picked in the dropdown but not yet confirmed. The select stays on
     the old value until the confirmation modal is accepted. */
  const [pendingTrackId, setPendingTrackId] = useState<string | null>(null);

  const pollRef = useRef<number | null>(null);

  const email = user?.email ?? "";

  /* ---- Restore an existing verified session without prompting ---- */
  useEffect(() => {
    if (!isFirebaseReady) return undefined;

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      const usable = Boolean(nextUser?.emailVerified) && isAllowedEmail(nextUser?.email);
      setReturning(usable);
      if (usable) setStage(STAGE.FORM);
    });
  }, []);

  /* ---- Committing a track, shared by the gallery shortcut and the
         confirmation modal in the form ---- */
  const applyTrack = useCallback((problemId: string) => {
    const track = PROBLEMS.find((problem) => problem.id === problemId);
    if (!track) return;

    setError(null);
    setNotice(`${track.alien} track selected — finish the form below to lock it in.`);
    setForm((current) => ({ ...current, problemId }));
    setFieldErrors((current) => ({ ...current, problemId: undefined }));
  }, []);

  /* ---- Honour a track picked in the aliens gallery ---- */
  useEffect(() => {
    const onSelect = (event: Event) => applyTrack((event as CustomEvent<string>).detail);

    window.addEventListener(SELECT_TRACK_EVENT, onSelect);

    /* A click may have landed before this chunk mounted. Replaying it through
       the listener keeps applyTrack on a single call site. */
    const pending = consumePendingTrack();
    if (pending) {
      window.dispatchEvent(new CustomEvent(SELECT_TRACK_EVENT, { detail: pending }));
    }

    return () => window.removeEventListener(SELECT_TRACK_EVENT, onSelect);
  }, [applyTrack]);

  /* ---- Poll for email confirmation while the verify stage is open ---- */
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    let attempts = 0;
    pollRef.current = window.setInterval(async () => {
      attempts += 1;
      if (attempts > 20) {
        stopPolling();
        return;
      }
      try {
        await reloadUser(requireUser());
        if (auth.currentUser?.emailVerified) {
          stopPolling();
          setStage(STAGE.FORM);
        }
      } catch {
        stopPolling();
      }
    }, 3000);
  }, [stopPolling]);

  /* ---- Google sign-in ---- */
  const handleGoogle = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);

    try {
      const result = await withTimeout(
        signInWithPopup(auth, new GoogleAuthProvider()),
        30000,
        "Google sign-in",
      );

      if (!isAllowedEmail(result.user.email)) {
        /* Stop immediately: this address cannot register for OMNICON. */
        await signOut(auth);
        setError(
          "Access restricted. BioByte registration is limited to @crescent.education college email addresses only. Please sign in with your Crescent college Google account.",
        );
        return;
      }

      setUser(result.user);
      setReturning(false);

      if (result.user.emailVerified) {
        setStage(STAGE.FORM);
      } else {
        setStage(STAGE.VERIFY);
        startPolling();
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("auth/popup-closed-by-user")) {
        setError("Sign-in window was closed before completing.");
      } else {
        setError((err as Error)?.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  /* ---- Verification helpers ---- */
  const handleSendLink = async () => {
    setError(null);
    setBusy(true);
    try {
      await withTimeout(sendEmailVerification(requireUser()), 15000, "Sending verification link");
      setLinkSent(true);
      startPolling();
    } catch (err) {
      setError(
        (err as { code?: string })?.code === "auth/too-many-requests"
          ? "Too many requests. Please try again in a moment."
          : (err as Error)?.message || "Could not send the verification link.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCheckVerified = async () => {
    setError(null);
    setVerifying(true);
    try {
      await withTimeout(reloadUser(requireUser()), 15000, "Verification check");
      if (auth.currentUser?.emailVerified) {
        stopPolling();
        setStage(STAGE.FORM);
      } else {
        setError("Not verified yet. Open the link in your inbox, then check again.");
      }
    } catch (err) {
      setError((err as Error)?.message || "Could not verify right now. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSignOut = async () => {
    stopPolling();
    await signOut(auth);
    setUser(null);
    setStage(STAGE.AUTH);
    setError(null);
    setNotice(null);
    setLinkSent(false);
  };

  /* ---- Form plumbing ---- */
  const update = <K extends "teamName" | "collegeName" | "abstract">(field: K) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    };

  const handleTeamSize = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value) || 0;
    setForm((current) => {
      const members = [...current.members];
      while (members.length < value) members.push(emptyMember());
      members.length = value;
      return { ...current, teamSize: value, members };
    });
    setFieldErrors((current) => ({ ...current, teamSize: undefined }));
  };

  const updateMember = (index: number, field: keyof Member) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((current) => {
        const members = [...current.members];
        members[index] = { ...members[index], [field]: value } as Member;
        return { ...current, members };
      });
      setFieldErrors((current) => ({
        ...current,
        [`member_${index}_${field}`]: undefined,
      }));
    };

  const handlePpt = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setForm((current) => ({ ...current, ppt: file }));
    setFieldErrors((current) => ({ ...current, ppt: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const draft = { ...form, emailId: email };
    const errors = validateDraft(draft);
    setFieldErrors(errors);

    if (Object.keys(errors).length) {
      setError("Some fields need attention before you can transform.");
      setTimeout(() => {
        const errorElement = document.querySelector('.has-error');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const input = errorElement.querySelector('input, select, textarea') as HTMLElement;
          if (input) input.focus();
        }
      }, 50);
      return;
    }

    setError(null);
    setNotice(null);
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const { id, passId } = await submitRegistration({ 
        draft, 
        uid: user?.uid ?? null,
        onStatus: (status) => setSubmitStatus(status)
      });

      localStorage.removeItem("biobyte_registration_form");
      router.push(`/confirmed?id=${encodeURIComponent(id)}&pass=${encodeURIComponent(passId)}`);
    } catch (err) {
      if (err instanceof RegistrationError) {
        setError(err.message);
      } else {
        setError((err as Error)?.message || "Transmission failed. Please try again.");
      }
      setSubmitting(false);
      setSubmitStatus(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ---- Every published track is open to any number of teams ---- */
  const trackOptions = useMemo(() => PROBLEMS, []);

  const selectedTrack = PROBLEMS.find((problem) => problem.id === form.problemId) ?? null;

  /* ---- Awaiting confirmation for a track chosen in the dropdown ---- */
  const pendingTrack = PROBLEMS.find((problem) => problem.id === pendingTrackId) ?? null;

  const confirmTrack = useCallback(() => {
    if (pendingTrackId) applyTrack(pendingTrackId);
    setPendingTrackId(null);
  }, [applyTrack, pendingTrackId]);

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <section id="register" className="section register-section" data-stage={stage}>
      <SectionHead
        kicker="Registration"
        title="Access the Mission"
        sub="Registration is limited to approved college email addresses. Teams of 2 to 4 register for one alien track and submit a Round 1 PPT."
      />

      <Reveal className="hud-panel professional-panel">
        <div className="professional-header">
          <h2 className="professional-title">Team Registration</h2>
          <span className="professional-status">
            <Lock size={14} className="status-icon" />
            {stage === STAGE.FORM ? "Verified Session" : "Secure Form"}
          </span>
        </div>

        <div className="hud-body">
          {error ? (
            <p className="alert alert-error" role="alert">
              <TriangleAlert size={17} aria-hidden="true" />
              <span>{error}</span>
            </p>
          ) : null}

          {notice ? (
            <p className="alert alert-info" role="status">
              <BadgeCheck size={17} aria-hidden="true" />
              <span>{notice}</span>
            </p>
          ) : null}

          {restoredNotice ? (
            <p className="alert alert-info" role="status">
              <BadgeCheck size={17} aria-hidden="true" />
              <span>{restoredNotice}</span>
            </p>
          ) : null}

          {!isFirebaseReady ? (
            <p className="alert alert-error" role="alert">
              <TriangleAlert size={17} aria-hidden="true" />
              <span>
                Registration storage is not configured yet. Missing:{" "}
                {missingFirebaseKeys.join(", ")}. Please contact the organisers.
              </span>
            </p>
          ) : null}

          {/* ============ STAGE 1 — GOOGLE GATE ============ */}
          {stage === STAGE.AUTH && isFirebaseReady && (
            <div className="pane">
              <div className="pane-head">
                <span className="pane-icon" aria-hidden="true">
                  <Lock size={19} />
                </span>
                <h3 className="pane-title">Verify your identity</h3>
              </div>

              <p className="pane-text">
                Registration is limited to Crescent email addresses. Sign in with Google and we
                will take it from there — unapproved addresses are rejected automatically.
              </p>

              <ul className="log-list">
                <li className="log-line">Round 1 entry — free</li>
                <li className="log-line">Team size — {EVENT.teamSize}</li>
                <li className="log-line">Event day — {EVENT.time}</li>
              </ul>

              <div className="pane-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={handleGoogle}
                  disabled={busy}
                >
                  {busy ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <GoogleGlyph />
                  )}
                  {busy ? "Connecting…" : "Continue with Google"}
                </button>
              </div>

              {returning && user ? (
                <p className="pane-hint">
                  Verified session found — {user.displayName || email}.{" "}
                  <button type="button" className="link-btn" onClick={handleSignOut}>
                    Sign out
                  </button>
                </p>
              ) : null}
            </div>
          )}

          {/* ============ STAGE 2 — EMAIL VERIFICATION ============ */}
          {stage === STAGE.VERIFY && (
            <div className="pane">
              <div className="pane-head">
                <span className="pane-icon" aria-hidden="true">
                  <Mail size={19} />
                </span>
                <h3 className="pane-title">Check your email</h3>
              </div>

              <p className="pane-text">
                We sent a verification link to <strong className="pane-strong">{email}</strong>.
                Open it to unlock the registration form.
              </p>

              <div className="pane-actions pane-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCheckVerified}
                  disabled={verifying || busy}
                >
                  {verifying ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <BadgeCheck size={16} />
                  )}
                  {verifying ? "Checking…" : "I have verified"}
                </button>

                <button type="button" className="btn btn-ghost" onClick={handleSendLink} disabled={busy}>
                  <Send size={15} />
                  {linkSent ? "Resend link" : "Send link"}
                </button>
              </div>

              <button type="button" className="btn btn-ghost btn-block" onClick={handleSignOut}>
                <X size={15} />
                Use a different account
              </button>
            </div>
          )}

          {/* ============ STAGE 3 — REGISTRATION FORM ============ */}
          {stage === STAGE.FORM && (
            <form className="pane relative" onSubmit={handleSubmit} noValidate>
              {restoringCache && (
                <div className="absolute inset-0 z-10 bg-[#0a0a0a]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl border border-green-500/30 min-h-[400px]">
                  <LoaderCircle size={40} className="animate-spin text-green-500 mb-4" />
                  <p className="text-green-400 font-bold tracking-widest uppercase text-sm">Restoring Progress...</p>
                </div>
              )}
              <div className="pane-head">
                <span className="pane-icon" aria-hidden="true">
                  <Zap size={19} />
                </span>
                <h3 className="pane-title">Your Team</h3>
                <span className="pane-identity">{email}</span>
              </div>

              {selectedTrack ? (
                <div className="track-banner" style={{ "--hue": selectedTrack.hue } as React.CSSProperties}>
                  <span className="track-banner-glyph" aria-hidden="true">
                    {selectedTrack.glyph}
                  </span>
                  <span>
                    <b>{selectedTrack.alien}</b> — {selectedTrack.title}
                  </span>
                </div>
              ) : null}

              <div className="form-grid">
                <Field
                  id="reg-team"
                  icon={Users}
                  label="Team Name"
                  placeholder="e.g. Alien Force"
                  value={form.teamName}
                  onChange={update("teamName")}
                  error={fieldErrors.teamName}
                />



                <div className={`field ${fieldErrors.teamSize ? "has-error" : ""}`}>
                  <label className="field-label" htmlFor="reg-size">
                    <Users size={15} aria-hidden="true" />
                    Team Members
                  </label>
                  <select
                    id="reg-size"
                    className="input"
                    value={form.teamSize || ""}
                    onChange={handleTeamSize}
                  >
                    <option value="">Select size</option>
                    {Array.from({ length: TEAM_MAX - TEAM_MIN + 1 }, (_, i) => TEAM_MIN + i).map(
                      (size) => (
                        <option key={size} value={size}>
                          {size} members
                        </option>
                      ),
                    )}
                  </select>
                  {fieldErrors.teamSize ? <p className="field-error">{fieldErrors.teamSize}</p> : null}
                </div>

                <div className={`field ${fieldErrors.emailId ? "has-error" : ""}`}>
                  <span className="field-label">
                    <Mail size={15} aria-hidden="true" />
                    Email ID
                  </span>
                  <input className="input" value={email} readOnly aria-readonly="true" />
                  <p className="field-hint">Verified Google account</p>
                </div>

                {form.members.map((member, index) => (
                  <details className="member-block" key={index} open={index < 2}>
                    <summary className="member-legend">
                      {index === 0 ? "Team Head · Operative 01 (Required)" : `Operative 0${index + 1} ${index < 2 ? "(Required)" : "(Optional, but fields required if filled)"}`}
                    </summary>
                    <div className="member-grid">
                      <div className={`field ${fieldErrors[`member_${index}_name`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-name`}>
                          Full name
                        </label>
                        <input
                          id={`m-${index}-name`}
                          className="input"
                          placeholder="Full name"
                          value={member.name}
                          onChange={updateMember(index, "name")}
                        />
                        {fieldErrors[`member_${index}_name`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_name`]}</p>
                        ) : null}
                      </div>

                      <div className={`field ${fieldErrors[`member_${index}_registrationNo`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-reg`}>
                          Registration No
                        </label>
                        <input
                          id={`m-${index}-reg`}
                          className="input"
                          placeholder="e.g. 2311001"
                          value={member.registrationNo}
                          onChange={updateMember(index, "registrationNo")}
                        />
                        {fieldErrors[`member_${index}_registrationNo`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_registrationNo`]}</p>
                        ) : null}
                      </div>

                      <div className={`field ${fieldErrors[`member_${index}_year`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-year`}>
                          Year
                        </label>
                        <select
                          id={`m-${index}-year`}
                          className="input"
                          value={member.year}
                          onChange={updateMember(index, "year")}
                        >
                          <option value="">Select year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                        {fieldErrors[`member_${index}_year`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_year`]}</p>
                        ) : null}
                      </div>

                      <div className={`field ${fieldErrors[`member_${index}_semester`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-sem`}>
                          Semester
                        </label>
                        <select
                          id={`m-${index}-sem`}
                          className="input"
                          value={member.semester}
                          onChange={updateMember(index, "semester")}
                        >
                          <option value="">Select semester</option>
                          {Array.from({ length: 8 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>Semester {i + 1}</option>
                          ))}
                        </select>
                        {fieldErrors[`member_${index}_semester`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_semester`]}</p>
                        ) : null}
                      </div>

                      <div className={`field ${fieldErrors[`member_${index}_course`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-course`}>
                          Course
                        </label>
                        <input
                          id={`m-${index}-course`}
                          className="input"
                          placeholder="e.g. B.Tech IT"
                          value={member.course}
                          onChange={updateMember(index, "course")}
                        />
                        {fieldErrors[`member_${index}_course`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_course`]}</p>
                        ) : null}
                      </div>

                      <div className={`field ${fieldErrors[`member_${index}_email`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-email`}>
                          College Email
                        </label>
                        <input
                          id={`m-${index}-email`}
                          className="input"
                          type="email"
                          placeholder="name@crescent.education"
                          value={member.email}
                          onChange={updateMember(index, "email")}
                        />
                        {fieldErrors[`member_${index}_email`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_email`]}</p>
                        ) : null}
                      </div>

                      <div className={`field ${fieldErrors[`member_${index}_phone`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-phone`}>
                          Mobile Number
                        </label>
                        <input
                          id={`m-${index}-phone`}
                          className="input"
                          type="tel"
                          inputMode="tel"
                          placeholder="10-digit number"
                          value={member.phone}
                          onChange={updateMember(index, "phone")}
                        />
                        {fieldErrors[`member_${index}_phone`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_phone`]}</p>
                        ) : null}
                      </div>

                      <div className={`field ${fieldErrors[`member_${index}_dob`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-dob`}>
                          Date of Birth
                        </label>
                        <input
                          id={`m-${index}-dob`}
                          className="input"
                          type="date"
                          value={member.dob}
                          onChange={updateMember(index, "dob")}
                        />
                        {fieldErrors[`member_${index}_dob`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_dob`]}</p>
                        ) : null}
                      </div>

                      <div className={`field field-wide ${fieldErrors[`member_${index}_address`] ? "has-error" : ""}`}>
                        <label className="field-label" htmlFor={`m-${index}-address`}>
                          Residential Address
                        </label>
                        <input
                          id={`m-${index}-address`}
                          className="input"
                          placeholder="Full residential address"
                          value={member.address}
                          onChange={updateMember(index, "address")}
                        />
                        {fieldErrors[`member_${index}_address`] ? (
                          <p className="field-error">{fieldErrors[`member_${index}_address`]}</p>
                        ) : null}
                      </div>
                    </div>
                  </details>
                ))}

                <div className={`field field-wide ${fieldErrors.problemId ? "has-error" : ""}`}>
                  <label className="field-label" htmlFor="reg-problem">
                    <ListChecks size={15} aria-hidden="true" />
                    Alien Track / Mission File
                  </label>
                  <select
                    id="reg-problem"
                    className="input"
                    value={form.problemId}
                    onChange={(event) => {
                      /* Never commit straight from the dropdown — hold the
                         choice and let the confirmation modal apply it. The
                         select is bound to form.problemId, so it visibly
                         snaps back until the change is confirmed. */
                      const next = event.target.value;
                      if (next) setPendingTrackId(next);
                    }}
                  >
                    <option value="">Select a mission file</option>
                    {trackOptions.map((problem) => (
                      <option key={problem.id} value={problem.id}>
                        {problem.id} — {problem.alien} · {problem.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.problemId ? (
                    <p className="field-error">{fieldErrors.problemId}</p>
                  ) : (
                    <p className="field-hint">
                      Pick a track to review its mission file before you confirm it.{" "}
                      <a
                        href="/PPT-Template.pptx"
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download the required PPT template
                      </a>{" "}
                      and strictly follow it when uploading your Round 1 PPT.
                    </p>
                  )}
                </div>

                <div className={`field field-wide ${fieldErrors.ppt ? "has-error" : ""}`}>
                  <span className="field-label">
                    <Upload size={15} aria-hidden="true" />
                    Round 1 PPT
                  </span>
                  <label className="upload-box">
                    <Upload size={19} aria-hidden="true" />
                    <span className="upload-text">
                      {form.ppt ? form.ppt.name : "Attach your Round 1 PPT"}
                    </span>
                    <span className="upload-hint">
                      .ppt, .pptx or .pdf — max {MAX_PPT_BYTES / (1024 * 1024)} MB. Use the provided template exactly as is.
                    </span>
                    <input
                      type="file"
                      className="upload-input"
                      accept={PPT_ACCEPT}
                      onChange={handlePpt}
                    />
                  </label>
                  {fieldErrors.ppt ? <p className="field-error">{fieldErrors.ppt}</p> : null}
                </div>

                <div className={`field field-wide ${fieldErrors.abstract ? "has-error" : ""}`}>
                  <label className="field-label" htmlFor="reg-abstract">
                    <FileText size={15} aria-hidden="true" />
                    Short Abstract / Description
                  </label>
                  <textarea
                    id="reg-abstract"
                    className="input"
                    rows={5}
                    maxLength={ABSTRACT_MAX}
                    placeholder="Summarise your approach, the data you will use and the outcome you aim to demonstrate."
                    value={form.abstract}
                    onChange={update("abstract")}
                  />
                  <div className="field-foot">
                    {fieldErrors.abstract ? (
                      <p className="field-error">{fieldErrors.abstract}</p>
                    ) : (
                      <span className="field-hint">Minimum 30 characters</span>
                    )}
                    <span className="field-count">
                      {form.abstract.length}/{ABSTRACT_MAX}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-submit">
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  {submitting ? (
                    <LoaderCircle size={17} className="spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting ? (submitStatus || "Transmitting…") : "Submit Registration"}
                </button>

                <div className="submit-notes">
                  <span>
                    <Clock size={13} aria-hidden="true" /> Event day {EVENT.time}
                  </span>
                  <span>
                    <IndianRupee size={13} aria-hidden="true" /> Round 1 free · ₹50 per head if
                    shortlisted
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={handleSignOut}
                  disabled={submitting}
                >
                  <ArrowLeft size={15} />
                  Use a different account
                </button>
              </div>
            </form>
          )}
        </div>
      </Reveal>

      <TrackConfirmModal
        problem={pendingTrack}
        switching={Boolean(form.problemId) && pendingTrackId !== form.problemId}
        onConfirm={confirmTrack}
        onCancel={() => setPendingTrackId(null)}
      />
    </section>
  );
}

/* ---------------------------------------------------------
   Small building blocks
   --------------------------------------------------------- */

function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.2C40.9 35.3 44 30.1 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

function Field({
  id,
  icon: Icon,
  label,
  error,
  ...inputProps
}: {
  id: string;
  icon: typeof Users;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label className="field-label" htmlFor={id}>
        <Icon size={15} aria-hidden="true" />
        {label}
      </label>
      <input id={id} className="input" {...inputProps} />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}