"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import type { Problem } from "@/data/site";

/**
 * Confirmation shown when the registration form's track picker changes.
 *
 * Switching tracks after you have started filling the form is easy to do by
 * accident, and the choice is locked in once you submit. So the picker never
 * commits directly: it asks first, shows the problem statement you are about
 * to switch to, and only applies the change on confirm.
 */
export default function TrackConfirmModal({
  problem,
  switching,
  onConfirm,
  onCancel,
}: {
  problem: Problem | null;
  /** True when a different track is already chosen, i.e. this is a switch. */
  switching: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;

      /* Keep Tab inside the dialog while it is open */
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1")]',
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
    [onCancel],
  );

  useEffect(() => {
    if (!problem) return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    confirmRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [problem, handleKeyDown]);

  if (!problem) return null;

  return createPortal(
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={panelRef}
        className="mission-file track-confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`track-confirm-title-${problem.id}`}
        style={{ "--hue": problem.hue, "--hue-deep": problem.hueDeep } as React.CSSProperties}
      >
        <span className="mission-scan" aria-hidden="true" />

        <header className="file-head">
          <div>
            <p className="file-eyebrow">Confirm mission file</p>
            <p className="file-code">
              [{problem.id}] <span style={{ color: problem.hue }}>{problem.alien}</span>
            </p>
            <h2 className="file-title" id={`track-confirm-title-${problem.id}`}>
              {problem.title}
            </h2>
            <p className="file-domain">{problem.domain}</p>
          </div>

          <div className="file-head-side">
            <button
              type="button"
              className="file-close"
              onClick={onCancel}
              aria-label="Cancel track change"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="file-body">
          <p className="track-confirm-lead">
            {switching
              ? "You are about to switch your mission file. Your registration stays locked to whichever track you confirm here."
              : "Read this through before locking it in — you cannot change track after you submit."}
          </p>

          <h3 className="file-subhead">Mission</h3>
          <p className="file-summary">{problem.summary}</p>

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
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onConfirm}
          >
            <Check size={14} aria-hidden="true" />
            {switching ? "Switch to this track" : "Confirm this track"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
