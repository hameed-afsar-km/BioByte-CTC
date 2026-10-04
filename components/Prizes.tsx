"use client";

import { useState, useRef, MouseEvent } from "react";
import { PRIZES } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

function InteractivePrizeCard({ prize, index }: { prize: typeof PRIZES[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Reveal
      as="article"
      className="prize-hologram-card group"
      delay={index * 120}
      style={{ 
        "--hue": prize.hue,
        transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        zIndex: isHovered ? 20 : 1,
        transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s"
      } as React.CSSProperties}
    >
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full h-full relative p-8 cursor-crosshair"
      >
        {/* Interactive Spotlight Glow */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, color-mix(in srgb, ${prize.hue} 35%, transparent), transparent 70%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Border highlight effect */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10 rounded-2xl border-2"
          style={{
            borderColor: isHovered ? prize.hue : 'transparent',
            opacity: isHovered ? 0.5 : 0,
            boxShadow: isHovered ? `inset 0 0 20px color-mix(in srgb, ${prize.hue} 20%, transparent)` : 'none'
          }}
        />

        <div className="prize-hologram-content relative z-20 pointer-events-none">
          <div className="prize-header mb-6">
            <span className="prize-place block text-sm font-bold tracking-[0.2em] uppercase text-gray-500 mb-1">{prize.place}</span>
            <h4 className="prize-alien text-2xl font-black uppercase tracking-wider" style={{ color: prize.hue, textShadow: isHovered ? `0 0 15px ${prize.hue}` : "none", transition: "text-shadow 0.3s" }}>{prize.alien}</h4>
          </div>
          
          <h3 className="prize-amount text-4xl font-black text-white tracking-tight mb-4" style={{ textShadow: isHovered ? `0 0 20px color-mix(in srgb, ${prize.hue} 50%, transparent)` : "none", transition: "text-shadow 0.3s" }}>
            {prize.amount}
          </h3>
          
          <div className="prize-divider h-px w-full mb-4" style={{ background: `linear-gradient(90deg, transparent, ${prize.hue}, transparent)`, opacity: isHovered ? 0.8 : 0.2, transition: "opacity 0.3s" }} />
          
          <p className="prize-text text-gray-400 text-sm leading-relaxed max-w-[280px] mx-auto group-hover:text-gray-200 transition-colors duration-300">
            {prize.text}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

export default function Prizes() {
  return (
    <section id="prizes" className="section prizes-section relative overflow-hidden py-24 bg-[#0a0a0a]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900/20 via-[#0a0a0a] to-[#0a0a0a]" />
      
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
        <SectionHead
          kicker="Mission Rewards"
          title="Prize Vault"
          sub="Unlock the ultimate rewards. Complete your mission to secure these prizes."
          centered
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRIZES.map((prize, index) => (
            <InteractivePrizeCard key={prize.id} prize={prize} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}