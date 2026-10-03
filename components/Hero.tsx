import { ArrowDown, Zap, FileText } from "lucide-react";
import { EVENT } from "@/data/site";
import Countdown from "./Countdown";

export default function Hero() {
  return (
    <section id="top" className="hero">
      {/* Background images for web and android */}
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-aura" aria-hidden="true" />
      <div className="hero-vignette" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content">
          <img 
            src="/biobyte.png" 
            alt="BioByte" 
            className="hero-logo" 
          />

          <p className="hero-description" style={{ fontSize: '1.15rem', color: 'var(--color-mist)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            BioByte is a premier biotech and computer science project expo. Assemble your ultimate crew, dive into cutting-edge challenges, and build innovative prototypes that push the boundaries of modern technology.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-omni)', textShadow: '0 0 15px rgba(124, 252, 0, 0.6)' }}>REGISTRATION DEADLINE</div>
            <Countdown target={EVENT.deadline} />
          </div>

          <div className="hero-actions">
            <a className="btn btn-primary" href="/register">
              <Zap size={17} aria-hidden="true" />
              Register Now
            </a>
            <a className="btn btn-secondary" href="#problems">
              <FileText size={17} aria-hidden="true" />
              Problem Statements
            </a>
          </div>
        </div>
      </div>

      <div className="hero-foot container" style={{ justifyContent: "center" }}>
        <a className="hero-scroll" href="#problems">
          <span className="hero-scroll-track" aria-hidden="true">
            <span className="hero-scroll-thumb" />
          </span>
          <span>Scroll</span>
          <ArrowDown size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
