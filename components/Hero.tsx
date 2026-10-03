import { ArrowDown, Clock, FileText, Trophy, Users, Zap } from "lucide-react";
import { EVENT } from "@/data/site";
import OmnitrixMark from "./OmnitrixMark";
import Countdown from "./Countdown";

const CHIPS = [
  { icon: Clock, label: "Event Time", value: EVENT.time },
  { icon: Users, label: "Team Size", value: EVENT.teamSize },
  { icon: FileText, label: "Round 1", value: EVENT.roundOne },
  { icon: Trophy, label: "Round 2", value: EVENT.roundTwo },
];

export default function Hero() {
  return (
    <section id="top" className="hero">
      {/*
        Background images:
          Desktop (≥ 768 px): web-hero-bg.png  — landscape, DNA helixes at corners
          Mobile  (<  768 px): android-hero-bg.png — portrait, DNA helixes at edges
        Both set via CSS custom property / background-image on the .hero element
        through media queries in sections.css, so the layout grid and the bg
        are always in sync.
      */}
      <div className="hero-bg" aria-hidden="true" />
      {/* Energy bloom + vignette over the background image */}
      <div className="hero-aura" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-presenter">
            <span className="status-dot" aria-hidden="true" />
            {EVENT.presenter} presents
          </p>

          <p className="hero-franchise">
            <span className="hero-franchise-tag">{EVENT.franchise}</span>
            <span>Alien Tech Challenge</span>
          </p>

          <h1 className="hero-title" data-text={EVENT.name}>
            {EVENT.name}
          </h1>

          <p className="hero-tagline">{EVENT.tagline}</p>
          <p className="hero-blurb">{EVENT.blurb}</p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#register">
              <Zap size={17} aria-hidden="true" />
              Register Now
            </a>
            <a className="btn btn-secondary" href="#problems">
              View Mission Files
            </a>
          </div>

          <ul className="hero-chips">
            {CHIPS.map((chip) => (
              <li key={chip.label} className="hero-chip">
                <chip.icon size={15} aria-hidden="true" />
                <span className="chip-label">{chip.label}</span>
                <span className="chip-value">{chip.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="hero-core" aria-hidden="true">
          <div className="hero-core-glow" />
          <OmnitrixMark className="hero-mark" />
          <span className="hero-core-caption hero-core-caption--top">
            DNA LOCKED · 5 SPECIES
          </span>
          <span className="hero-core-caption hero-core-caption--bottom">
            OMNITRIX ONLINE
          </span>
        </aside>
      </div>

      <div className="hero-foot container">
        <Countdown target={EVENT.date} />
        <a className="hero-scroll" href="#aliens">
          <span className="hero-scroll-track" aria-hidden="true">
            <span className="hero-scroll-thumb" />
          </span>
          <span>Scroll</span>
          <ArrowDown size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}