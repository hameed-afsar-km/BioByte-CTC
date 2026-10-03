"use client";

import { useEffect, useRef } from "react";
import {
  BadgeCheck,
  Clock,
  FileText,
  Gift,
  Globe,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { PROTOCOL, RULES } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const RULE_ICONS = {
  globe: Globe,
  users: Users,
  gift: Gift,
  fileText: FileText,
  advance: BadgeCheck,
  wallet: Wallet,
  clock: Clock,
};

export default function RulesTimeline() {
  const listRef = useRef<HTMLDivElement>(null);

  /* Lights each step as it passes through the middle of the viewport. */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    const steps = Array.from(list.querySelectorAll<HTMLElement>(".flow-step"));
    if (!steps.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const node = entry.target;
          node.classList.toggle("is-active", entry.isIntersecting);
          if (entry.isIntersecting) node.classList.add("is-complete");
        });
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: 0 },
    );

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <>
    <section id="rules" className="section protocol-section">
      <SectionHead
        kicker="Guidelines"
        title="The Rules"
        sub="Seven standing orders to keep the expo fair and competitive."
        centered
      />

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Reveal className="rules-panel card bracket">
          <ul className="rules-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {RULES.map((rule, index) => {
              const Icon = RULE_ICONS[rule.icon as keyof typeof RULE_ICONS];
              return (
                <li className="rule-item" key={rule.text} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px' }}>
                  <span className="rule-mark" aria-hidden="true" style={{ color: 'var(--color-omni)' }}>
                    <Icon size={24} />
                  </span>
                  <span className="rule-text" style={{ flex: 1, fontSize: '1rem', color: '#fff' }}>{rule.text}</span>
                  <span className="rule-index" aria-hidden="true" style={{ opacity: 0.2, fontWeight: 'bold' }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>

    <section id="timeline" className="section timeline-section">
      <SectionHead
        kicker="Schedule"
        title="Event Timeline"
        sub="Follow the sequence from registration to the final demo."
        centered
      />

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="new-timeline" ref={listRef}>
          {PROTOCOL.map((step, index) => (
            <div className="new-timeline-node flow-step" key={step.step}>
              <div className="new-timeline-marker">
                <div className="new-timeline-dot">
                   <ShieldCheck size={18} />
                </div>
                {index !== PROTOCOL.length - 1 && <div className="new-timeline-line"></div>}
              </div>
              <div className="new-timeline-content card">
                <span className="new-timeline-step-id">{step.step}</span>
                <h4 className="new-timeline-title">{step.title}</h4>
                <p className="new-timeline-text">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
