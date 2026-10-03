"use client";

import { useState } from "react";
import { PRIZES } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Prizes() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="prizes" className="section section--tight prizes-section">
      <SectionHead
        kicker="Mission Rewards"
        title="Prize Vault"
        sub="Three reward pods are sealed for Round 2. Open a pod to see what your track is competing for."
        centered
      />

      <div className="pod-grid">
        {PRIZES.map((prize, index) => {
          const open = openId === prize.id;
          return (
            <Reveal
              as="article"
              key={prize.id}
              className="pod card bracket"
              delay={index * 120}
            >
              <button
                type="button"
                className="pod-trigger"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : prize.id)}
                style={{ "--hue": prize.hue } as React.CSSProperties}
              >
                <span className="pod-lid" aria-hidden="true" />
                <span className="pod-place">{prize.place}</span>
                <span className="pod-alien">{prize.alien}</span>
                <span className="pod-state">{open ? "Pod open" : "Tap to open"}</span>
              </button>

              <div className="pod-panel" hidden={!open}>
                <p className="pod-amount">{prize.amount}</p>
                <h3 className="pod-title">{prize.title}</h3>
                <p className="pod-text">{prize.text}</p>
                <p className="pod-podname">Reward pod — {prize.podName}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}