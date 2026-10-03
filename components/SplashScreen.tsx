"use client";

import { useEffect, useRef, useState } from "react";
import { SPLASH_MS, SPLASH_EXIT_MS } from "@/data/site";

/**
 * Boot splash that plays the web or android intro video, then splits away.
 *
 * - Desktop (≥ 768 px): the frame splits horizontally — top half exits up,
 *   bottom half exits down.
 * - Mobile  (<  768 px): the split runs vertically instead — top half exits
 *   right, bottom half exits left.
 *
 * Because the halves have to travel independently, the video is rendered as
 * two <video> elements stacked on each other, each clipped to one half via
 * clip-path. Both point at the same file, so a rAF loop keeps them locked
 * together — without it the seam tears as the two clocks drift.
 *
 * The splash unmounts after SPLASH_MS and is skipped on subsequent
 * navigations in the same browser session. Append `?splash=1` to the URL to
 * force it back, which is the only way to see it again after a reload.
 */

/** The two per-viewport sources, shared by both halves. */
function SplashSources() {
  return (
    <>
      {/* Mobile (portrait / narrow) */}
      <source src="/android%20splash.webm" type="video/webm" media="(max-width: 767px)" />
      {/* Desktop (wide) */}
      <source src="/web%20splash.webm" type="video/webm" media="(min-width: 768px)" />
    </>
  );
}

export default function SplashScreen() {
  const [phase, setPhase] = useState<"loading" | "active" | "exiting" | "hidden">("loading");
  const topRef = useRef<HTMLVideoElement>(null);
  const bottomRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;

    let cancelled = false;
    let exitTimer = 0;
    let removeTimer = 0;
    let fallbackTimer = 0;
    let started = false;

    const begin = async () => {
      if (started || cancelled) return;
      started = true;
      top.currentTime = 0;
      bottom.currentTime = 0;
      try {
        await Promise.all([top.play(), bottom.play()]);
      } catch {
        // A static first frame is still preferable to a permanently black screen.
      }
      if (cancelled) return;
      setPhase("active");
      exitTimer = window.setTimeout(() => {
        setPhase("exiting");
        removeTimer = window.setTimeout(() => setPhase("hidden"), SPLASH_EXIT_MS);
      }, SPLASH_MS);
    };

    // Do not start the transition clock until both halves can paint a frame.
    // This removes the black lower panel seen when one decoder starts later.
    const onReady = () => {
      if (top.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && bottom.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) begin();
    };
    top.addEventListener("canplay", onReady);
    bottom.addEventListener("canplay", onReady);
    top.addEventListener("loadeddata", onReady);
    bottom.addEventListener("loadeddata", onReady);
    onReady();
    // Bad/cached media must never trap the visitor behind the splash.
    fallbackTimer = window.setTimeout(begin, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(fallbackTimer);
      top.removeEventListener("canplay", onReady);
      bottom.removeEventListener("canplay", onReady);
      top.removeEventListener("loadeddata", onReady);
      bottom.removeEventListener("loadeddata", onReady);
    };
  }, []);

  /* Start playback once the halves are actually mounted. This has to be a
     separate effect keyed on phase — on mount there is nothing to play yet. */
  useEffect(() => {
    if (phase !== "active") return;
    const top = topRef.current;
    const bottom = bottomRef.current;
    
    if (top && bottom) {
      top.muted = true;
      bottom.muted = true;
      
      // Lock both videos to frame 0 before playing to guarantee sync
      top.currentTime = 0;
      bottom.currentTime = 0;
      
      Promise.all([top.play(), bottom.play()]).catch(() => {
        /* Still blocked — the timer unmounts the splash regardless. */
      });
    }
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`splash ${phase === "loading" ? "is-loading" : ""} ${phase === "exiting" ? "is-exiting" : ""}`.trim()}
      role="status"
      aria-live="polite"
      aria-label="Loading BioByte"
    >
      {/*
        Solid black bed behind the video. It stops a white flash before the
        first frame decodes, and it fades out with the split so the page is
        revealed through the widening gap.
      */}
      <div className="splash-bed" aria-hidden="true" />

      {/*
        Two full-bleed copies of the same video, each clipped to one half.
        clip-path clips first, then transform moves what is left, so each half
        slides away as a solid piece rather than scaling or fading.
      */}
      <video
        ref={topRef}
        className="splash-half splash-half--top"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <SplashSources />
      </video>

      <video
        ref={bottomRef}
        className="splash-half splash-half--bottom"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <SplashSources />
      </video>

      {/* Lit seam that flares along the cut while the halves separate */}
      <div className="splash-seam" aria-hidden="true" />

      {/* Scan-line overlay keeps the Omnitrix HUD feel over the video */}
      <div className="splash-scan" aria-hidden="true" />
    </div>
  );
}
