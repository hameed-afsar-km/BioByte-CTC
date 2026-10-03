import Link from "next/link";
import { Zap } from "lucide-react";
import { EVENT, FOOTER_LINKS } from "@/data/site";

export default function Footer() {
  return (
    <footer className="new-footer-100vh" style={{ position: "relative", overflow: "hidden" }}>
      <div className="footer-background-glow"></div>
      
      <div className="footer-main-content" style={{ zIndex: 10 }}>
         <div className="footer-logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem', margin: '2rem 0', flexWrap: 'wrap' }}>
           <img src="/ctc.png" alt="CTC Logo" style={{ width: '120px', filter: 'drop-shadow(0 0 20px rgba(124, 252, 0, 0.4))' }} />
           <img src="/biobyte.png" alt="BioByte Logo" style={{ width: '450px', filter: 'drop-shadow(0 0 20px rgba(124, 252, 0, 0.4))' }} />
         </div>
      </div>

      <div className="footer-bottom-nav" style={{ zIndex: 10 }}>
         <nav className="footer-links-row">
           {FOOTER_LINKS.map((link) => (
             <a key={link.id} href={`#${link.id}`} className="footer-nav-link">{link.label}</a>
           ))}
         </nav>
         <div className="footer-credits">
           © {EVENT.year} {EVENT.name} — {EVENT.presenter}. Event day {EVENT.time}.
           <Link href="/admin" className="footer-admin-link">Organiser Dashboard</Link>
         </div>
      </div>
    </footer>
  );
}
