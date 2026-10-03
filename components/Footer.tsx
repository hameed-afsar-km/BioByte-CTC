import Link from "next/link";
import { LayoutDashboard, Zap } from "lucide-react";
import { EVENT, FOOTER_LINKS } from "@/data/site";
import OmnitrixMark from "./OmnitrixMark";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />

      <div className="container footer-inner">
        <div className="footer-brand">
          <OmnitrixMark className="footer-mark" />
          <p className="footer-slogan">
            {EVENT.name}
            <span className="footer-slogan-accent"> — {EVENT.tagline}</span>
          </p>
          <p className="footer-mini">
            A futuristic biotech hackathon by {EVENT.presenter}.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <h3 className="footer-heading">Quick Links</h3>
          <ul>
            {FOOTER_LINKS.map((link) => (
              <li key={link.id}>
                <a className="footer-link" href={`#${link.id}`}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-cta">
          <h3 className="footer-heading">Bring a team</h3>
          <p className="footer-mini">
            Round 1 is free for Crescent email holders. Teams of {EVENT.teamSize}.
          </p>
          <a className="btn btn-primary btn-block" href="#register">
            <Zap size={16} aria-hidden="true" />
            Register Now
          </a>
          <Link className="footer-admin-link" href="/admin">
            <LayoutDashboard size={14} aria-hidden="true" />
            Organiser dashboard
          </Link>
        </div>
      </div>

      <div className="footer-base">
        <div className="container footer-base-inner">
          <span>
            © {EVENT.year} {EVENT.name} — {EVENT.presenter}.
          </span>
          <span className="footer-base-tag">Event day {EVENT.time}</span>
        </div>
      </div>
    </footer>
  );
}