"use client";

import { useState } from "react";
import { PRIZES } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Prizes() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="prizes" className="section prizes-section">
      <SectionHead
        kicker="Mission Rewards"
        title="Prize Vault"
        sub="Unlock the ultimate rewards. Complete your mission to secure these prizes."
        centered
      />

      <div className="prize-podium-container">
        <div className="prize-podium">
          {[PRIZES[1], PRIZES[0], PRIZES[2]].map((prize, index) => (
            <Reveal
              as="article"
              key={prize.id}
              className={`podium-card ${prize.id === 'p1' ? 'podium-first' : ''}`}
              delay={index * 120}
              style={{ "--hue": prize.hue } as React.CSSProperties}
            >
              <div className="prize-glow" />
              <div className="podium-content">
                <span className="prize-place">{prize.place}</span>
                <h3 className="prize-amount">{prize.amount}</h3>
                <div className="prize-divider" />
                <h4 className="prize-alien">{prize.alien}</h4>
                <p className="prize-text">{prize.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 4th Prize: Best Innovation */}
        {PRIZES[3] && (
          <Reveal as="div" delay={400} className="prize-special-wrapper">
            <article className="podium-card prize-special-card" style={{ "--hue": PRIZES[3].hue } as React.CSSProperties}>
              <div className="prize-glow" />
              <div className="podium-content special-content">
                <div className="special-left">
                  <span className="prize-place">{PRIZES[3].place}</span>
                  <h3 className="prize-amount">{PRIZES[3].amount}</h3>
                </div>
                <div className="special-right">
                  <h4 className="prize-alien">{PRIZES[3].alien}</h4>
                  <p className="prize-text">{PRIZES[3].text}</p>
                </div>
              </div>
            </article>
          </Reveal>
        )}
      </div>
    </section>
  );
}