import { Phone, Mail } from "lucide-react";
import { COORDINATORS } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function CoreTeam() {
  return (
    <section id="contact" className="section contact-section">
      <SectionHead
        kicker="Reach Out"
        title="Contact & Team"
        sub="Have questions about the Expo? Reach out to our organizing team below."
        centered
      />

      <div className="crew-grid">
        {COORDINATORS.map((member, index) => (
          <Reveal as="article" key={member.name} className="crew-reveal" delay={index * 120}>
            <div className="crew-card card">
              <span className="crew-number">0{index + 1}</span>
              <p className="crew-title">{member.role}</p>
              <h3 className="crew-name">{member.name}</h3>
              
              <a className="btn btn-secondary" href={`tel:+91${member.phone}`}>
                <Phone size={16} aria-hidden="true" />
                +91 {member.phone}
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
