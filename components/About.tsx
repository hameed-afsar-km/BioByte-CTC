import { Cpu, Dna, Radar, Sparkles } from "lucide-react";
import { EVENT, PILLARS } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const ICONS = {
  radar: Radar,
  dna: Dna,
  cpu: Cpu,
  spark: Sparkles,
};

export default function About() {
  return (
    <section id="about" className="section about-section">
      <SectionHead
        kicker="About"
        title="Mission Brief"
        sub={`${EVENT.name} is a single-day biotechnology hackathon by ${EVENT.presenter}. Teams of two to four take one real challenge from bioprocess, bio-imaging, environmental sensing or drug discovery — and turn it into software that runs. One day, one track, one working outcome.`}
      />

      <div className="pillars-grid">
        {PILLARS.map((pillar, index) => {
          const Icon = ICONS[pillar.icon];
          return (
            <Reveal
              as="article"
              key={pillar.key}
              className="pillar card bracket card-hover"
              delay={index * 90}
            >
              <span className="pillar-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="pillar-icon" aria-hidden="true">
                <Icon size={26} />
              </span>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-text">{pillar.text}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}