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
  const listRef = useRef<HTMLOListElement>(null);

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
    <section id="timeline" className="section protocol-section">
      <SectionHead
        kicker="Rules & Timeline"
        title="How It Works"
        sub="Seven standing orders, then five stages from registration to the final demo. Follow the sequence and you stay eligible all the way through."
      />

      <div className="protocol-grid">
        {/* ---------------- rules of engagement ---------------- */}
        <Reveal className="rules-panel card bracket">
          <div className="rules-head">
            <span className="rules-icon" aria-hidden="true">
              <ShieldCheck size={20} />
            </span>
            <h3 className="rules-title">The Rules</h3>
          </div>

          <ul className="rules-list">
            {RULES.map((rule, index) => {
              const Icon = RULE_ICONS[rule.icon as keyof typeof RULE_ICONS];
              return (
                <li className="rule-item" key={rule.text}>
                  <span className="rule-mark" aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <span className="rule-text">{rule.text}</span>
                  <span className="rule-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* ---------------- protocol flow ---------------- */}
        <div className="flow">
          <h3 className="flow-title">Round by Round</h3>

          <ol className="flow-list" ref={listRef}>
            {PROTOCOL.map((step) => (
              <li className="flow-step" key={step.step}>
                <span className="flow-rail" aria-hidden="true">
                  <span className="flow-rail-fill" />
                </span>

                <span className="flow-node" aria-hidden="true">
                  {step.step}
                </span>

                <div className="flow-body card">
                  <h4 className="flow-step-title">{step.title}</h4>
                  <p className="flow-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}