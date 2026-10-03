import { Landmark, Phone, Radio, Users } from "lucide-react";
import { CONVENORS, COORDINATORS, EVENT } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <SectionHead
        kicker="Contact"
        title="Command Center"
        sub={`For registration queries, challenge clarification or event-day support, reach the ${EVENT.presenter} core team directly.`}
      />

      <div className="command-grid">
        <div className="command-block">
          <div className="command-head">
            <span className="command-badge">
              <Users size={16} aria-hidden="true" />
              Core Team
            </span>
            <h3 className="command-title">Coordinators</h3>
          </div>

          <div className="people-grid">
            {COORDINATORS.map((person, index) => (
              <Reveal as="article" key={person.name} className="person card bracket card-hover" delay={index * 90}>
                <span className="person-role">{person.role}</span>
                <h4 className="person-name">{person.name}</h4>
                <a className="person-phone" href={`tel:+91${person.phone}`}>
                  <Phone size={14} aria-hidden="true" />
                  +91 {person.phone}
                </a>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="command-block">
          <div className="command-head">
            <span className="command-badge command-badge-amber">
              <Landmark size={16} aria-hidden="true" />
              Faculty
            </span>
            <h3 className="command-title">Convenors</h3>
          </div>

          <div className="people-grid">
            {CONVENORS.map((person, index) => (
              <Reveal as="article" key={person.name} className="person card bracket card-hover" delay={index * 90}>
                <span className="person-role">{person.role}</span>
                <h4 className="person-name">{person.name}</h4>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <p className="command-note">
        <Radio size={14} aria-hidden="true" />
        Comms open {EVENT.time} on event day
      </p>
    </section>
  );
}