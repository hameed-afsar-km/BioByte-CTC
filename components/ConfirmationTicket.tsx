"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarPlus,
  Clock,
  Download,
  GraduationCap,
  LoaderCircle,
  Printer,
  TriangleAlert,
  Upload,
  Users,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseReady } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { EVENT, PROBLEMS } from "@/data/site";
import type { RegistrationRecord } from "@/lib/types";
import OmnitrixMark from "./OmnitrixMark";

/** Deterministic barcode strip derived from the pass id. */
function useBarcode(seed: string, bars = 44) {
  return useMemo(() => {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const widths: number[] = [];
    for (let i = 0; i < bars; i += 1) {
      /* xorshift the hash into a small, stable width so the strip looks
         like a barcode but is identical on every render and every device. */
      hash ^= hash << 13;
      hash ^= hash >>> 17;
      hash ^= hash << 5;
      widths.push((hash >>> 0) % 3 === 0 ? 3 : 1);
    }

    return widths;
  }, [seed, bars]);
}

function formatDate(seconds: number | null) {
  if (!seconds) return "—";
  return new Date(seconds * 1000).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConfirmationTicket() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const pass = params.get("pass") ?? "";

  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [denied, setDenied] = useState(false);
  const barcode = useBarcode(pass || id || "OMNICON");

  useEffect(() => {
    if (!isFirebaseReady || !id) return undefined;

    /* The rules only let the owner or an organiser read this document, so
       wait for the session before asking — otherwise a valid owner gets
       bounced by an anonymous first read. */
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setDenied(true);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "registrations", id));
        if (snapshot.exists()) {
          setRecord({ ...(snapshot.data() as RegistrationRecord), id });
        } else {
          setDenied(true);
        }
      } catch {
        setDenied(true);
      } finally {
        setLoading(false);
      }
    });
  }, [id]);

  /* The pass id comes from the URL, so it always renders — even if the
     detailed record cannot be read on this device. */
  const alien = record
    ? PROBLEMS.find((problem) => problem.id === record.problemId)?.alien ?? record.alien
    : "—";
  const hue = record?.hue ?? "var(--color-omni)";
  const trackTitle = record
    ? PROBLEMS.find((problem) => problem.id === record.problemId)?.title ?? record.problemTitle
    : "—";

  const rows: { label: string; value: string }[] = record
    ? [
        { label: "Team", value: record.teamName },
        { label: "College", value: record.collegeName },
        { label: "Operatives", value: `${record.teamSize} member${record.teamSize === 1 ? "" : "s"}` },
        { label: "Alien track", value: `${record.problemId} — ${alien}` },
        { label: "Mission", value: trackTitle },
        { label: "Email", value: record.emailId },
        { label: "Registered", value: formatDate(record.createdAt?.seconds ?? null) },
        { label: "Round", value: "Round 1 — free" },
      ]
    : [];

  return (
    <div className="confirm-page">
      <div className="container confirm-inner">
        <div className="confirm-head">
          <OmnitrixMark className="confirm-mark" />
          <p className="kicker">Transformation successful</p>
          <h1 className="confirm-title">You are registered</h1>
          <p className="confirm-sub">
            Keep this pass. Bring it on event day along with your Round 1 deck.
          </p>
        </div>

        {/* ---------------- the pass ---------------- */}
        <article className="pass" style={{ "--hue": hue } as React.CSSProperties}>
          <div className="pass-scan" aria-hidden="true" />

          <header className="pass-head">
            <div>
              <p className="pass-eyebrow">{EVENT.name} · Registration Pass</p>
              <p className="pass-id">{pass || "OMNI-————-————"}</p>
            </div>
            <span className="pass-status">
              <BadgeCheck size={15} aria-hidden="true" />
              Registered
            </span>
          </header>

          <div className="pass-body">
            <div className="pass-rows">
              {loading ? (
                <p className="pass-loading">
                  <LoaderCircle size={16} className="spin" />
                  Reading your record from the Omnitrix…
                </p>
              ) : rows.length ? (
                <dl className="pass-grid">
                  {rows.map((row) => (
                    <div className="pass-row" key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="alert alert-info">
                  <TriangleAlert size={17} aria-hidden="true" />
                  <span>
                    {denied
                      ? "Sign in with the same Google account you registered with to see the full pass details."
                      : "No registration id was supplied."}
                  </span>
                </div>
              )}

              {record?.members?.length ? (
                <div className="pass-members">
                  <p className="pass-members-label">
                    <Users size={14} aria-hidden="true" />
                    Operatives
                  </p>
                  <ul>
                    {record.members.map((member, index) => (
                      <li key={`${member.name}-${index}`}>
                        <b>{member.name}</b>
                        <span>
                          {member.course} · Year {member.year} · {member.phone}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="pass-side">
              <OmnitrixMark className="pass-omni" hue={hue} />
              <p className="pass-alien">{alien}</p>
              <div className="pass-barcode" aria-hidden="true">
                {barcode.map((width, index) => (
                  <i key={index} style={{ width }} />
                ))}
              </div>
              <p className="pass-barcode-text">{pass}</p>
            </div>
          </div>

          <footer className="pass-foot">
            <span>
              <Clock size={13} aria-hidden="true" /> Event day {EVENT.time}
            </span>
            <span>
              <GraduationCap size={13} aria-hidden="true" /> Round 2 ₹50 per head if shortlisted
            </span>
            <span>
              <Upload size={13} aria-hidden="true" />
              {record?.pptName ? `Deck: ${record.pptName}` : "Deck attached"}
            </span>
          </footer>
        </article>

        {/* ---------------- next steps ---------------- */}
        <ol className="confirm-steps">
          <li className="card bracket" style={{ borderColor: 'var(--color-omni)', boxShadow: '0 0 20px rgba(124,252,0,0.15)' }}>
            <span className="step-index">00</span>
            <h3 style={{ color: 'var(--color-omni)' }}>Join the WhatsApp Group</h3>
            <p>You have successfully registered! All critical updates will be posted here.</p>
            <a href="https://chat.whatsapp.com/DC9S6tcrU4lH2Y5ayqiAlC" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: '1rem', width: 'fit-content' }}>
              Join WhatsApp Group
            </a>
          </li>
          <li className="card bracket">
            <span className="step-index">01</span>
            <h3>Keep the deck ready</h3>
            <p>Your Round 1 PPT is on file with the organisers. Bring a copy on a pen drive.</p>
          </li>
          <li className="card bracket">
            <span className="step-index">02</span>
            <h3>Watch for the shortlist</h3>
            <p>Judges pick the teams advancing to Round 2. Only then does the ₹50 fee apply.</p>
          </li>
          <li className="card bracket">
            <span className="step-index">03</span>
            <h3>Show up and transform</h3>
            <p>Arrive by 9:00 AM on event day with your full team and this pass.</p>
          </li>
        </ol>

        <div className="confirm-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} aria-hidden="true" />
            Print pass
          </button>
          <a className="btn btn-secondary" href="/admin">
            <Download size={16} aria-hidden="true" />
            Open dashboard
          </a>
          <Link className="btn btn-primary" href="/#register">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to registration
          </Link>
        </div>

        <p className="confirm-foot">
          <CalendarPlus size={14} aria-hidden="true" />
          Venue: {EVENT.venue}. A calendar invite is sent once the venue is confirmed.
        </p>

        <Link className="confirm-home" href="/">
          Return to {EVENT.name}
        </Link>
      </div>
    </div>
  );
}
