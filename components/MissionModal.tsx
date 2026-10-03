"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Zap } from "lucide-react";
import type { Problem } from "@/data/site";
import { selectTrack } from "@/lib/registerGate";
import OmnitrixMark from "./OmnitrixMark";

/**
 * Secure mission-file panel. Opens one statement at a time, closes on
 * Escape or backdrop click, and hands focus back to the trigger on close.
 */
export default function MissionModal({
  problem,
  onClose,
}: {
  problem: Problem | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      /* Keep Tab inside the panel while it is open */
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || !focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!problem) return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [problem, handleKeyDown]);

  if (!problem) return null;

  const handleSelect = () => {
    selectTrack(problem.id);
    onClose();
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return createPortal(
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="mission-file"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`mission-title-${problem.id}`}
        style={{ "--hue": problem.hue, "--hue-deep": problem.hueDeep } as React.CSSProperties}
      >
        <span className="mission-scan" aria-hidden="true" />

        <header className="file-head">
          <div>
            <p className="file-eyebrow">Mission file opened</p>
            <p className="file-code">
              [{problem.id}] <span style={{ color: problem.hue }}>{problem.alien}</span>
            </p>
            <h2 className="file-title" id={`mission-title-${problem.id}`}>
              {problem.title}
            </h2>
            <p className="file-domain">{problem.domain}</p>
          </div>

          <div className="file-head-side">
            <OmnitrixMark className="file-ring" hue={problem.hue} />
            <button
              ref={closeRef}
              type="button"
              className="file-close"
              onClick={onClose}
              aria-label="Close mission file"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="file-body">
          <h3 className="file-subhead">Mission</h3>
          <p className="file-summary">{problem.summary}</p>

          <h3 className="file-subhead">Expected Output</h3>
          <p className="file-summary">{problem.expectedOutput}</p>

          <h3 className="file-subhead">Build targets</h3>
          <ul className="file-points">
            {problem.points.map((point) => (
              <li key={point}>
                <span className="point-tick" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <footer className="file-foot">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close file
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSelect}>
            <Zap size={14} aria-hidden="true" />
            Select this track
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}