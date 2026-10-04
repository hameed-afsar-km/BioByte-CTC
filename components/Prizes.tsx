"use client";

import { useState } from "react";
import { PRIZES } from "@/data/site";
import Reveal from "./Reveal";

export default function Prizes() {
  const [hoveredId, setHoveredId] = useState<string | null>(PRIZES[0].id);

  return (
    <section id="prizes" className="section relative h-screen min-h-[700px] flex flex-col justify-center items-center bg-[#050505] overflow-hidden py-24 lg:py-0">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-green-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="z-10 mb-12 lg:mb-20 flex flex-col items-center text-center">
         <Reveal as="h2" delay={100} className="text-[10px] lg:text-xs font-bold tracking-[0.5em] text-green-500 uppercase mb-3 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
           Mission Rewards
         </Reveal>
         <Reveal as="h1" delay={200} className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl mb-6">
           Prize Vault
         </Reveal>
         
         <Reveal as="div" delay={300} className="inline-flex items-center gap-4 px-6 py-2 bg-black/60 border border-green-500/30 rounded-full backdrop-blur-md shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <span className="text-[9px] lg:text-[10px] font-bold tracking-[0.3em] text-green-400 uppercase">Total Pool</span>
            <span className="text-xl lg:text-2xl font-black text-white tracking-tight drop-shadow-md">₹5,000</span>
         </Reveal>
      </div>

      {/* Interactive Accordion */}
      <Reveal as="div" delay={400} className="relative w-full max-w-[1200px] mx-auto px-4 z-10 flex flex-col lg:flex-row h-[70vh] lg:h-[500px] gap-3 lg:gap-4">
        {PRIZES.map((prize, index) => {
           const isActive = hoveredId === prize.id;
           
           return (
             <div 
               key={prize.id}
               onMouseEnter={() => setHoveredId(prize.id)}
               onClick={() => setHoveredId(prize.id)}
               className={`relative overflow-hidden rounded-[2rem] border bg-[#080808]/80 backdrop-blur-xl transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.3,1)] cursor-pointer group ${isActive ? '' : 'min-h-[75px] lg:min-h-0 min-w-0 lg:min-w-[80px]'}`}
               style={{
                  flexGrow: isActive ? 6 : 1,
                  flexBasis: 0,
                  borderColor: isActive ? `color-mix(in srgb, ${prize.hue} 50%, transparent)` : `color-mix(in srgb, ${prize.hue} 15%, transparent)`,
                  boxShadow: isActive ? `0 10px 40px -10px color-mix(in srgb, ${prize.hue} 40%, transparent)` : 'none'
               }}
             >
                {/* Glow Overlay */}
                <div 
                  className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                  style={{
                     background: `linear-gradient(135deg, color-mix(in srgb, ${prize.hue} 30%, transparent), transparent 70%)`,
                     opacity: isActive ? 1 : 0
                  }}
                />

                {/* Giant Background Number */}
                <div 
                  className={`absolute -bottom-8 -right-4 lg:-bottom-12 lg:-right-8 text-[10rem] lg:text-[15rem] font-black italic leading-none transition-all duration-[1000ms] ease-out pointer-events-none ${isActive ? 'opacity-10 translate-x-0' : 'opacity-0 translate-x-12'}`}
                  style={{ color: prize.hue }}
                >
                  {index + 1}
                </div>
                
                {/* Active State Content */}
                <div 
                  className={`absolute inset-0 p-6 lg:p-10 flex flex-col justify-center w-full lg:w-[600px] transition-all duration-[800ms] ease-out ${isActive ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                >
                   <div className="flex items-center gap-3 mb-4">
                     <span className="px-4 py-1.5 text-[9px] font-bold tracking-[0.3em] uppercase border rounded-full shadow-sm"
                           style={{ borderColor: `color-mix(in srgb, ${prize.hue} 40%, transparent)`, color: prize.hue, backgroundColor: `color-mix(in srgb, ${prize.hue} 10%, transparent)` }}>
                       {prize.place}
                     </span>
                     <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/50 hidden sm:block">
                       {prize.alien}
                     </span>
                   </div>

                   <h3 className="font-black text-white text-3xl md:text-5xl lg:text-6xl uppercase italic tracking-tighter mb-4 drop-shadow-2xl">
                     {prize.title}
                   </h3>
                   
                   <p className="text-white/70 text-xs lg:text-sm max-w-[280px] sm:max-w-sm mb-6 leading-relaxed line-clamp-2 lg:line-clamp-none">
                     {prize.text}
                   </p>
                   
                   <div className="mt-4 pt-6 border-t border-white/10 flex items-center gap-6">
                      <span className="text-[9px] lg:text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase">Reward</span>
                      <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text drop-shadow-2xl" 
                            style={{ backgroundImage: `linear-gradient(to bottom, #ffffff, ${prize.hue})` }}>
                        {prize.amount}
                      </span>
                   </div>
                </div>

                {/* Collapsed State Content */}
                <div 
                  className={`absolute inset-0 flex flex-row lg:flex-col items-center justify-center p-4 transition-all duration-500 ${isActive ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 delay-200'}`}
                >
                   <span 
                     className="text-[10px] font-bold tracking-[0.4em] uppercase whitespace-nowrap transform rotate-0 lg:-rotate-90 origin-center text-white/40 group-hover:text-white transition-colors"
                   >
                     {prize.place}
                   </span>
                </div>
             </div>
           )
        })}
      </Reveal>
    </section>
  );
}