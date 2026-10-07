"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/data/site";
import { fetchSiteSettings, registrationGate, type SiteSettings } from "@/lib/settings";
import Countdown from "./Countdown";

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "var(--color-omni)",
  textShadow: "0 0 15px rgba(124, 252, 0, 0.6)",
};

/**
 * Hero countdown to the live registration deadline.
 *
 * The deadline an admin sets in the dashboard overrides the build-time
 * default, so the timer is never stale. Once the deadline passes (or an admin
 * closes registrations) the timer is replaced by the closed message.
 */
export default function DeadlineCountdown() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;

    fetchSiteSettings().then((next) => {
      if (alive) setSettings(next);
    });

    /* Re-evaluate the gate so the timer flips to "closed" the moment the
       deadline passes, even for a tab left open. */
    const id = window.setInterval(() => setNow(Date.now()), 1000);

    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const effective = settings ?? { registrationsOpen: true, deadline: EVENT.deadline };
  const gate = registrationGate(effective, now);

  return (
    <>
      <div style={LABEL_STYLE}>
        {gate.open ? "Registration Deadline" : "Registrations Closed"}
      </div>
      {gate.open ? (
        <Countdown target={effective.deadline} />
      ) : (
        <p className="countdown-pending" role="status">
          <span className="countdown-value">{gate.reason}</span>
        </p>
      )}
    </>
  );
}
