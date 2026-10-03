"use client";

import { useState } from "react";
import { PRIZES } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Prizes() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="prizes" className="section prizes-section" style={{ position: "relative", overflow: "hidden" }}>
      {/* Lightweight CSS gradient instead of floating paths */}
      <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(124, 252, 0, 0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
      
      <div style={{ position: "relative", zIndex: 10 }}>
        <SectionHead
          kicker="Mission Rewards"
          title="Prize Vault"
          sub="Unlock the ultimate rewards. Complete your mission to secure these prizes."
          centered
        />

        <div className="prize-grid-container">
          <div className="prize-grid">
            {PRIZES.map((prize, index) => (
              <Reveal
                as="article"
                key={prize.id}
                className="prize-hologram-card"
                delay={index * 120}
                style={{ "--hue": prize.hue } as React.CSSProperties}
              >
                <div className="prize-glow" />
                <div className="prize-hologram-content">
                  <div className="prize-header">
                    <span className="prize-place">{prize.place}</span>
                    <h4 className="prize-alien" style={{ color: prize.hue }}>{prize.alien}</h4>
                  </div>
                  <h3 className="prize-amount">{prize.amount}</h3>
                  <div className="prize-divider" />
                  <p className="prize-text">{prize.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}