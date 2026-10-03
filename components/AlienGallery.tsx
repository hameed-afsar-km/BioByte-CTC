"use client";

import { Lock, Zap } from "lucide-react";
import { CLASSIFIED, PROBLEMS, STAT_KEYS } from "@/data/site";
import { selectTrack } from "@/lib/registerGate";
import OmnitrixMark from "./OmnitrixMark";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

function StatBars({
  stats,
  hue,
}: {
  stats: Record<(typeof STAT_KEYS)[number]["key"], number>;
  hue: string;
}) {
  return (
    <dl className="stat-bars">
      {STAT_KEYS.map((stat) => (
        <div className="stat-row" key={stat.key}>
          <dt>{stat.label}</dt>
          <dd>
            <span
              className="stat-track"
              style={{ "--hue": hue } as React.CSSProperties}
              aria-hidden="true"
            >
              <span className="stat-fill" style={{ width: `${stats[stat.key]}%` }} />
            </span>
            <span className="stat-value">{stats[stat.key]}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function AlienGallery() {
  const handleSelect = (problemId: string) => {
    selectTrack(problemId);
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="aliens" className="section aliens-section">
      <SectionHead
        kicker="Alien Vault"
        title="Choose Your DNA"
        sub="Five aliens are unlocked for OMNICON. Each one carries a different problem statement — pick the power set your team can actually build in a day."
        centered
      />

      <div className="alien-grid">
        {PROBLEMS.map((problem, index) => (
          <Reveal
            as="article"
            key={problem.id}
            className="alien-card card card-hover"
            delay={index * 110}
          >
            <span
              className="alien-aura"
              style={{ background: `radial-gradient(circle at 50% 0%, ${problem.hue}33, transparent 68%)` }}
              aria-hidden="true"
            />

            <header className="alien-top">
              <span className="hex-tag">[{problem.id}]</span>
              <span className="alien-species">{problem.species}</span>
            </header>

            <div className="alien-mark-wrap">
              <OmnitrixMark className="alien-mark" hue={problem.hue} />
              <span className="alien-glyph" style={{ color: problem.hue }} aria-hidden="true">
                {problem.glyph}
              </span>
            </div>

            <h3 className="alien-name" style={{ color: problem.hue }}>
              {problem.alien}
            </h3>
            <p className="alien-title">{problem.title}</p>

            <StatBars stats={problem.stats} hue={problem.hue} />

            <ul className="alien-powers">
              {problem.powers.map((power) => (
                <li key={power}>{power}</li>
              ))}
            </ul>

            <button
              type="button"
              className="btn btn-secondary btn-sm btn-block alien-cta"
              onClick={() => handleSelect(problem.id)}
            >
              <Zap size={14} aria-hidden="true" />
              Select this track
            </button>
          </Reveal>
        ))}
      </div>

      {/* ---- classified, for flavour only ---- */}
      <Reveal className="classified-wrap" delay={120}>
        <p className="classified-label">
          <Lock size={13} aria-hidden="true" />
          Classified — no mission file released
        </p>
        <ul className="classified-row">
          {CLASSIFIED.map((alien) => (
            <li key={alien.name} className="classified-chip" style={{ "--hue": alien.hue } as React.CSSProperties}>
              <span className="classified-glyph" aria-hidden="true">
                {alien.glyph}
              </span>
              <span>
                <b>{alien.name}</b>
                <em>{alien.quote}</em>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}