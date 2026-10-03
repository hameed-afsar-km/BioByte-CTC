"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { EVENT, NAV_ITEMS } from "@/data/site";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  /* Navbar solidifies once the page leaves the top */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Highlight the section currently in view */
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* A resize back to desktop must not leave the mobile panel open */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 941px)");
    const onChange = (event: MediaQueryListEvent) => event.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback((id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      {/* Floating pill navbar — admin button intentionally omitted from public UI.
          Access /admin directly in the browser to reach the organiser dashboard. */}
      <header className={`navbar ${scrolled ? "is-scrolled" : ""}`.trim()}>
        <nav className="container navbar-inner" aria-label="Primary">
          <a
            className="brand"
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              goTo("top");
            }}
          >
            <img src="/CTC.png" className="brand-mark" alt="CTC Logo" />
            <span className="brand-text">
              <span className="brand-name">{EVENT.name}</span>
              <span className="brand-sub">{EVENT.presenter}</span>
            </span>
          </a>

          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${activeId === item.id ? "is-active" : ""}`.trim()}
                aria-current={activeId === item.id ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  goTo(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="navbar-actions">
            <a className="btn btn-primary btn-sm" href="/register">
              <Zap size={15} aria-hidden="true" />
              Register Now
            </a>

            <button
              type="button"
              className={`nav-toggle ${menuOpen ? "is-open" : ""}`.trim()}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="nav-toggle-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {menuOpen ? (
        <div className="nav-mobile">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-mobile-link ${activeId === item.id ? "is-active" : ""}`.trim()}
              onClick={() => goTo(item.id)}
            >
              {item.label}
            </button>
          ))}
          <a className="btn btn-primary btn-block" href="/register">
            <Zap size={15} aria-hidden="true" />
            Register Now
          </a>
        </div>
      ) : null}
    </>
  );
}
