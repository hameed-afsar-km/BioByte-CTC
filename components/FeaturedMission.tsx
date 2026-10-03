"use client";

import { CalendarClock, CalendarRange, Layers, Zap } from "lucide-react";
import { EVENT, PROBLEMS } from "@/data/site";
import { selectTrack } from "@/lib/registerGate";
import Reveal from "./Reveal";

/**
 * The one card the club site leads with: what the event is, when it
 * runs, and three ways in. Sits directly under the hero.
 */
export default function FeaturedMission() {
  const handleRegister = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuick = (problemId: string) => {
    selectTrack(problemId);
    handleRegister();
  };

  return (
    <section className="section section--tight" aria-labelledby="featured-title">
      <Reveal className="featured card bracket">
        <div className="featured-head">
          <span className="kicker">
            <Layers size={13} aria-hidden="true" />
            Featured mission
          </span>
          <span className="featured-meta">
            {PROBLEMS.length} alien tracks · {EVENT.time}
          </span>
        </div>

        <div className="featured-body">
          <div className="featured-copy">
            <h2 className="featured-title" id="featured-title">
              {EVENT.name} <span className="featured-year">{EVENT.year}</span>
            </h2>
            <p className="featured-tagline">{EVENT.tagline}</p>
            <p className="featured-blurb">{EVENT.blurb}</p>
            <p className="featured-venue">
              <CalendarClock size={14} aria-hidden="true" />
              {EVENT.venue}
            </p>
          </div>

          <div className="featured-quick">
            <p className="featured-quick-label">Jump to a track</p>
            <ul>
              {PROBLEMS.map((problem) => (
                <li key={problem.id}>
                  <button
                    type="button"
                    className="quick-btn"
                    style={{ "--hue": problem.hue } as React.CSSProperties}
                    onClick={() => handleQuick(problem.id)}
                  >
                    <span className="quick-glyph" aria-hidden="true">
                      {problem.glyph}
                    </span>
                    {problem.alien}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="featured-actions">
          <a className="btn btn-secondary btn-sm" href="#problems">
            <Layers size={15} aria-hidden="true" />
            View details
          </a>
          <a className="btn btn-secondary btn-sm" href="#timeline">
            <CalendarRange size={15} aria-hidden="true" />
            Full schedule
          </a>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleRegister}>
            <Zap size={15} aria-hidden="true" />
            Register now
          </button>
        </div>
      </Reveal>
    </section>
  );
}