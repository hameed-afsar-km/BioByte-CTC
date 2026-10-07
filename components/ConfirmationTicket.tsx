"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Download,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseReady } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { PROBLEMS } from "@/data/site";
import type { RegistrationRecord } from "@/lib/types";

export default function ConfirmationTicket() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const pass = params.get("pass") ?? "";

  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [showDetails, setShowDetails] = useState(false);

  // Intro sequence: 0 = congrats only, 1 = registered line slides in, 2 = all faded, show content
  const [introStage, setIntroStage] = useState(0);

  useEffect(() => {
    if (!isFirebaseReady || !id) return undefined;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const snapshot = await getDoc(doc(db, "registrations", id));
        if (snapshot.exists()) setRecord({ ...(snapshot.data() as RegistrationRecord), id });
      } catch { /* silent */ } finally { setLoading(false); }
    });
  }, [id]);

  // Drive the intro animation stages
  useEffect(() => {
    if (loading) return;
    const t1 = setTimeout(() => setIntroStage(1), 900);   // slide in 2nd line
    const t2 = setTimeout(() => setIntroStage(2), 2400);  // fade everything out, show content
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

  const trackTitle = record
    ? PROBLEMS.find((p) => p.id === record.problemId)?.title ?? record.problemTitle
    : "—";

  return (
    <div
      className="min-h-[100svh] w-full relative flex flex-col items-center justify-start overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #0d1f0e 0%, #060f06 40%, #000a00 100%)" }}
    >
      <style>{`
        @keyframes sweep-tr-new {
          0%   { opacity: 0; transform: translate(40%, -40%) scale(1.2); }
          20%  { opacity: 1; transform: translate(10%, -10%) scale(1.1); }
          80%  { opacity: 0.8; transform: translate(-10%, 10%) scale(1); }
          100% { opacity: 0; transform: translate(-40%, 40%) scale(0.9); }
        }
        @keyframes sweep-bl-new {
          0%   { opacity: 0; transform: translate(-40%, 40%) scale(1.2); }
          20%  { opacity: 1; transform: translate(-10%, 10%) scale(1.1); }
          80%  { opacity: 0.8; transform: translate(10%, -10%) scale(1); }
          100% { opacity: 0; transform: translate(40%, -40%) scale(0.9); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes intro-line2 {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sweep-tr {
          position: fixed; inset: -50%; z-index: 30; pointer-events: none;
          background: radial-gradient(ellipse 40% 40% at 75% 25%, rgba(124,252,0,0.45) 0%, transparent 60%);
          animation: sweep-tr-new 2.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .sweep-bl {
          position: fixed; inset: -50%; z-index: 30; pointer-events: none;
          background: radial-gradient(ellipse 40% 40% at 25% 75%, rgba(124,252,0,0.35) 0%, transparent 60%);
          animation: sweep-bl-new 2.8s cubic-bezier(0.25, 1, 0.5, 1) 0.2s forwards;
        }
        .fade-up-1 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .fade-up-2 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
        .fade-up-3 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
        .fade-up-4 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.65s both; }
        .fade-up-5 { animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.8s both; }
        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-strong {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .detail-enter { animation: fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      {/* Entrance sweeps - only visible during intro */}
      {introStage < 2 && !loading && (
        <>
          <div className="sweep-tr" />
          <div className="sweep-bl" />
        </>
      )}

      {/* Ambient orbs */}
      <div className="fixed top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,252,0,0.06) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,252,0,0.04) 0%, transparent 70%)" }} />

      {/* ── INTRO OVERLAY ── */}
      {introStage < 2 && !loading && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center text-center px-4 transition-opacity duration-700"
          style={{ opacity: introStage < 2 ? 1 : 0, pointerEvents: introStage < 2 ? "all" : "none" }}
        >
          <p
            className="text-white font-black tracking-tight transition-transform duration-700"
            style={{
              fontSize: "clamp(2rem, 7vw, 3.5rem)",
              transform: introStage >= 1 ? "translateY(-10px)" : "translateY(0)",
              animation: "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s both",
            }}
          >
            Congratulations!
          </p>
          {introStage >= 1 && (
            <p
              className="font-semibold tracking-wide"
              style={{
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
                color: "#7cfc00",
                animation: "intro-line2 0.6s cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              You Have Been Registered!
            </p>
          )}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div
        className="relative z-10 w-full max-w-xl px-4 py-10 flex flex-col items-center gap-3 transition-all duration-700"
        style={{ opacity: introStage >= 2 ? 1 : 0, transform: introStage >= 2 ? "translateY(0)" : "translateY(16px)", pointerEvents: introStage >= 2 ? "all" : "none" }}
      >
        {/* ── LOGOS ── */}
        <div className="fade-up-1 flex items-center justify-center gap-5">
          <img src="/ctc.png" alt="CTC" className="h-10 w-auto object-contain opacity-90"
            style={{ filter: "drop-shadow(0 0 12px rgba(124,252,0,0.25))" }} />
          <div className="w-px h-8 bg-white/10 rounded-full" />
          <img src="/biobyte.png" alt="BioByte" className="h-8 w-auto object-contain opacity-90"
            style={{ filter: "drop-shadow(0 0 12px rgba(124,252,0,0.25))" }} />
        </div>

        {/* ── HERO CARD ── */}
        <div className="fade-up-2 glass-strong rounded-3xl w-full overflow-hidden relative">
          {/* Subtle glowing borders */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#7cfc00] to-transparent opacity-60"></div>
          
          <div className="p-8 w-full flex flex-col">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 w-full">
                <LoaderCircle size={28} className="animate-spin" style={{ color: "#7cfc00" }} />
                <p className="text-white/50 text-sm">Retrieving registration…</p>
              </div>
            ) : !record ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6 w-full text-center">
                <TriangleAlert size={36} className="text-red-400" />
                <p className="text-white font-semibold">Registration not found.</p>
                <p className="text-white/50 text-sm">Please sign in and try again.</p>
                <Link href="/" className="mt-2 text-sm text-white/60 hover:text-white transition-colors underline underline-offset-4">Return Home</Link>
              </div>
            ) : (
              <div className="flex flex-col w-full text-left">
                {/* Header Row: Title on left, Badge on right */}
                <div className="flex items-start justify-between w-full mb-8">
                  <div className="flex flex-col pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#7cfc00]" style={{ boxShadow: "0 0 8px #7cfc00" }} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7cfc00]">Registration Details</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none"
                      style={{ fontFamily: "var(--font-display)", textShadow: "0 4px 20px rgba(124,252,0,0.15)" }}>
                      {record.teamName}
                    </h1>
                  </div>
                  
                  <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(124,252,0,0.1)", border: "1px solid rgba(124,252,0,0.25)", boxShadow: "0 0 20px rgba(124,252,0,0.15)" }}>
                    <BadgeCheck size={28} style={{ color: "#7cfc00" }} strokeWidth={2} />
                  </div>
                </div>

                {/* Dossier Details */}
                <div className="flex flex-col gap-5 border-l border-white/10 pl-5 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-white/20" />
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold mb-0.5">Institute</p>
                    <p className="text-sm text-white/90 font-medium">{record.collegeName}</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-[#7cfc00]" style={{ boxShadow: "0 0 10px rgba(124,252,0,0.5)" }} />
                    <p className="text-[10px] text-[#7cfc00]/60 uppercase tracking-[0.2em] font-semibold mb-0.5">Authorization Code</p>
                    <p className="text-base font-mono text-[#7cfc00] font-bold tracking-wider">{pass || "—"}</p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-white/20" />
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold mb-0.5">Selected Mission</p>
                    <p className="text-sm text-white/90 font-medium leading-snug">{trackTitle}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {record && (
          <>
            {/* ── MOTIVATIONAL + NEXT STEPS ── */}
            <div className="fade-up-3 glass rounded-2xl p-5 w-full space-y-3">
              <blockquote className="text-center">
                <p className="text-white/80 text-sm leading-relaxed italic">
                  "The best way to predict the future is to <span className="text-white font-semibold not-italic">build it</span>."
                </p>
                <cite className="text-white/30 text-xs not-italic mt-1 block">— Abraham Lincoln</cite>
              </blockquote>
              <div className="border-t border-white/5 pt-3 space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "rgba(124,252,0,0.12)", color: "#7cfc00", border: "1px solid rgba(124,252,0,0.25)" }}>1</span>
                  <p className="text-white/70 text-sm leading-relaxed">
                    <span className="text-white font-medium">Start building your prototype.</span> Bring your idea to life — every great innovation begins with the first step.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "rgba(124,252,0,0.12)", color: "#7cfc00", border: "1px solid rgba(124,252,0,0.25)" }}>2</span>
                  <p className="text-white/70 text-sm leading-relaxed">
                    <span className="text-white font-medium">Shortlisting update on 11 Oct 2026.</span> We'll notify shortlisted teams via WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* ── ACTIONS ── */}
            <div className="fade-up-4 flex flex-col gap-2 w-full">
              <a
                href="https://chat.whatsapp.com/DC9S6tcrU4lH2Y5ayqiAlC"
                target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-95"
                style={{ background: "#7cfc00", color: "#050f05", boxShadow: "0 8px 32px rgba(124,252,0,0.25)" }}
              >
                Join WhatsApp Group
              </a>
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium transition-all glass"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {showDetails ? <><ChevronUp size={16} /> Hide Submission Details</> : <><ChevronDown size={16} /> View Submission Details</>}
              </button>
              {record.pptUrl && (
                <a
                  href={record.pptUrl} target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium transition-all glass"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <Download size={16} /> View Submitted PPT
                </a>
              )}
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-medium transition-all"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                <ArrowLeft size={14} /> Return Home
              </Link>
            </div>

            {/* ── EXPANDED TEAM DETAILS ── */}
            {showDetails && (
              <div className="detail-enter fade-up-5 w-full space-y-3">
                <div className="glass rounded-2xl p-5 space-y-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-semibold">Registration Summary</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Team Name</p>
                      <p className="text-sm font-semibold text-white">{record.teamName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Track</p>
                      <p className="text-sm text-white/80 leading-snug">{trackTitle}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Team Size</p>
                      <p className="text-sm text-white/80">{record.teamSize} Members</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Institute</p>
                      <p className="text-sm text-white/80 leading-snug">{record.collegeName}</p>
                    </div>
                  </div>
                  {record.abstract && (
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Abstract</p>
                      <p className="text-sm text-white/60 leading-relaxed">{record.abstract}</p>
                    </div>
                  )}
                </div>

                {record.members?.map((member, i) => (
                  <div key={i} className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: "rgba(124,252,0,0.08)", color: "#7cfc00", border: "1px solid rgba(124,252,0,0.2)" }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{member.name}</p>
                        <p className="text-white/35 text-xs">Member {i + 1}{i === 0 ? " · Team Head" : ""}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {[
                        { label: "Reg. No", val: member.registrationNo },
                        { label: "Course & Year", val: `${member.course}, Yr ${String(member.year).replace(/^0/, "")} (Sem ${member.semester})` },
                        { label: "Email", val: member.email },
                        { label: "Phone", val: member.phone },
                        { label: "Date of Birth", val: member.dob },
                        { label: "Address", val: member.address },
                      ].map(({ label, val }) => (
                        <div key={label} className={label === "Address" || label === "Email" ? "col-span-2" : ""}>
                          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">{label}</p>
                          <p className="text-sm text-white/70 break-words">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
