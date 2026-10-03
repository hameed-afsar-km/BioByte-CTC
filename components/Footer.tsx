import Link from "next/link";
import { LayoutDashboard, Zap } from "lucide-react";
import { EVENT, FOOTER_LINKS } from "@/data/site";
import OmnitrixMark from "./OmnitrixMark";

export default function Footer() {
  return (
    <footer className="new-footer-100vh">
      <div className="footer-background-glow"></div>
      
      <div className="footer-main-content">
         <div className="footer-logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
           <img src="/ctc.png" alt="CTC Logo" style={{ width: '140px', filter: 'drop-shadow(0 0 20px rgba(124, 252, 0, 0.4))' }} />
           <img src="/biobyte.png" alt="BioByte Logo" style={{ width: '300px', filter: 'drop-shadow(0 0 20px rgba(124, 252, 0, 0.4))' }} />
         </div>
         
         <div className="footer-big-cta" style={{ marginTop: '2rem' }}>
           <Link className="btn btn-primary btn-massive" href="/register">
             <Zap size={24} />
             <span>ACCESS REGISTRATION</span>
           </Link>
         </div>
      </div>

      <div className="footer-bottom-nav">
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
