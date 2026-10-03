"use client";

import { useEffect, useRef, useState } from "react";
import { SPLASH_MS } from "@/data/site";

/**
 * Boot splash that plays the web or android intro video.
 *
 * - Desktop (≥ 768 px): /web splash.mp4
 * - Mobile  (<  768 px): /android splash.mp4
 *
 * Both media queries are served via `<source>` tags with the appropriate
 * `media` attribute so the browser picks the correct source automatically.
 *
 * The splash unmounts after SPLASH_MS and is skipped on subsequent
 * page navigations inside the same browser session.
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "active" | "exiting">("hidden");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("omnicon:booted")) return undefined;
    sessionStorage.setItem("omnicon:booted", "1");

    setPhase("active");

    /* Auto-play the video; fall back to timer if the browser blocks it. */
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {
        /* Browser blocked autoplay — just rely on the timer. */
      });
    }

    const exitTimer = window.setTimeout(() => {
      setPhase("exiting");
      window.setTimeout(() => setPhase("hidden"), 700);
    }, SPLASH_MS);

    return () => window.clearTimeout(exitTimer);
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className={`splash splash--video ${phase === "exiting" ? "is-exiting" : ""}`.trim()}
      role="status"
      aria-live="polite"
      aria-label="Loading BioByte"
    >
      {/*
        Two <source> elements with media queries.
        Browsers evaluate top-to-bottom and pick the first matching source.
        The android video is served on narrow viewports; the web video on wider ones.
      */}
      <video
        ref={videoRef}
        className="splash-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        {/* Mobile (portrait / narrow) */}
        <source
          src="/android splash.mp4"
          type="video/mp4"
          media="(max-width: 767px)"
        />
        {/* Desktop (wide) */}
        <source
          src="/web splash.mp4"
          type="video/mp4"
          media="(min-width: 768px)"
        />
        {/* Absolute fallback for browsers without video support */}
        Your browser does not support HTML5 video.
      </video>

      {/* Scan-line overlay keeps the Omnitrix HUD feel over the video */}
      <div className="splash-scan" aria-hidden="true" />
    </div>
  );
}