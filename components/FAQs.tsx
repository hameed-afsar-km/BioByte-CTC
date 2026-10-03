"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section section--tight faq-section">
      <SectionHead kicker="FAQ" title="Frequently Asked" centered />

      <div className="faq-list">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <Reveal
              as="article"
              key={faq.q}
              className={`faq-item card ${isOpen ? "is-open" : ""}`.trim()}
            >
              <button
                type="button"
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="faq-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="faq-text">{faq.q}</span>
                <ChevronDown size={18} className="faq-chevron" aria-hidden="true" />
              </button>

              <div id={`faq-answer-${index}`} className="faq-answer" role="region" hidden={!isOpen}>
                <p>{faq.a}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}