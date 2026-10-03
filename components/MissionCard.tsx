"use client";

import { ArrowUpRight, FileText } from "lucide-react";
import type { Problem } from "@/data/site";
import Reveal from "./Reveal";

/**
 * One project track file. Title, brief description, and CTA.
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
  return (
    <Reveal className="mission-reveal" delay={index * 110}>
      <article className="new-mission-card" style={{ "--hue": problem.hue } as React.CSSProperties}>
        <div className="mission-accent-glow"></div>
        <div className="mission-card-content">
          <div className="mission-header">
            <div className="mission-badge">
               <span className="mission-badge-text">TRK-{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="mission-glyph-container">
              <span className="mission-glyph" aria-hidden="true">{problem.glyph}</span>
            </div>
          </div>
          
          <div className="mission-body">
            <span className="mission-domain-label">{problem.domain}</span>
            <h3 className="mission-title">{problem.title}</h3>
            <p className="mission-brief">{problem.brief}</p>
          </div>
          
          <div className="mission-footer">
            <button type="button" className="mission-action-btn" onClick={() => onOpen(problem.id)}>
              <FileText size={16} className="btn-icon" />
              <span>EXPAND DETAILS</span>
              <ArrowUpRight size={16} className="btn-icon" />
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
