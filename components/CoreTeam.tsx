import { Phone } from "lucide-react";
import { CORE_TEAM } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function CoreTeam() {
  return (
    <section id="core-team" className="section core-team-section">
      <SectionHead
        kicker="Command Crew"
        title="Student Core Team"
        sub="The students building OMNICON behind the scenes — tech, operations and event day logistics."
        centered
      />

      <div className="crew-grid">
        {CORE_TEAM.map((member, index) => (
          <Reveal as="article" key={member.handle} className="crew-reveal" delay={index * 120}>
            <div className="crew-card card bracket card-hover" style={{ "--hue": member.hue } as React.CSSProperties}>
              <header className="crew-top">
                <span className="crew-badge">{member.badge}</span>
                <span className="crew-label">{member.alien} DNA</span>
              </header>

              <div className="crew-lead">
                <span className="crew-avatar" aria-hidden="true">
                  <span className="crew-initials">{initials(member.name)}</span>
                </span>

                <div className="crew-ident">
                  <h3 className="crew-name">{member.name}</h3>
                  <p className="crew-title">{member.title}</p>
                  <p className="crew-handle">@{member.handle}</p>
                </div>
              </div>

              <div className="crew-status">
                <span className="crew-status-key">Status</span>
                <span className="crew-status-value">
                  <span className="crew-dot" aria-hidden="true" />
                  {member.status}
                </span>
              </div>

              <a className="crew-link" href={`tel:+91${member.phone}`}>
                <Phone size={14} aria-hidden="true" />
                +91 {member.phone}
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}