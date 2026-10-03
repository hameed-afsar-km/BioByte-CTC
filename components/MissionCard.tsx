"use client";

import { useCallback, useRef, useState } from "react";
import { FileText } from "lucide-react";
import type { Problem } from "@/data/site";
import OmnitrixMark from "./OmnitrixMark";
import Reveal from "./Reveal";

/**
 * One alien mission file. The card is a sealed brief: track code, alien
 * alias, one-line mission and the tag chips. Everything else lives in the
 * MissionModal, one statement at a time.
 */
export default function MissionCard({
  problem,
  index,
  onOpen,
}: {
  problem: Problem;
  index: number;
  onOpen: (id: string) => void;
}) {
  const [ripple, setRipple] = useState<{ key: number; x: number; y: number } | null>(null);
  const rippleCount = useRef(0);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);

  const handleRipple = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    rippleCount.current += 1;
    setRipple({
      key: rippleCount.current,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  return (
    <Reveal className="mission-reveal" delay={index * 110}>
      <article
        className="mission-card card bracket card-hover"
        style={{ "--hue": problem.hue, "--hue-deep": problem.hueDeep } as React.CSSProperties}
        onPointerMove={handlePointerMove}
        onPointerDown={handleRipple}
      >
        <span className="mission-pulse" aria-hidden="true" />
        <span className="mission-spotlight" aria-hidden="true" />
        {ripple ? (
          <span
            key={ripple.key}
            className="mission-ripple"
            style={{ left: ripple.x, top: ripple.y }}
            aria-hidden="true"
          />
        ) : null}

        <div className="mission-top">
          <span className="hex-tag">[{problem.id}]</span>
          <span className="mission-alien" style={{ color: problem.hue }}>
            {problem.alien}
          </span>
        </div>

        <div className="mission-lead">
          <span className="mission-emblem" style={{ color: problem.hue }} aria-hidden="true">
            {problem.glyph}
          </span>

          <div className="mission-lead-text">
            <h3 className="mission-title">{problem.title}</h3>
            <p className="mission-brief">{problem.brief}</p>
          </div>
        </div>

        <ul className="mission-tags">
          {problem.tags.map((tag) => (
            <li className="tag-chip" key={tag}>
              {tag}
            </li>
          ))}
        </ul>

        <div className="mission-foot">
          <OmnitrixMark className="mission-ring" hue={problem.hue} active={false} />
          <button
            type="button"
            className="btn btn-secondary btn-sm mission-open"
            onClick={() => onOpen(problem.id)}
          >
            <FileText size={14} aria-hidden="true" />
            Open statement
          </button>
        </div>
      </article>
    </Reveal>
  );
}