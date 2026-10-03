"use client";

import { useEffect, useState } from "react";

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hrs" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Sec" },
];

const split = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Counts down to `target`. The interval is the only state — the remaining
 * time is derived during render. When the date has not been announced the
 * component renders an honest placeholder instead of a fake deadline.
 */
export default function Countdown({ target }: { target: string | null }) {
  const end = target ? new Date(target).getTime() : Number.NaN;
  const live = Number.isFinite(end);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!live) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [live]);

  if (!live) {
    return (
      <p className="countdown-pending">
        <span className="countdown-key">Event day</span>
        <span className="countdown-value">{target ? "TBA" : "To be announced"}</span>
      </p>
    );
  }

  const remaining = split(end - now);

  return (
    <div className="countdown" aria-live="off">
      {UNITS.map((unit) => (
        <div className="countdown-unit" key={unit.key}>
          <span className="countdown-num">{pad(remaining[unit.key as keyof typeof remaining])}</span>
          <span className="countdown-label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}