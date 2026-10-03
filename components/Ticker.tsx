import { TICKER_SLOGAN, TICKER_WORDS } from "@/data/site";

function strip(className: string, items: string[], label: string) {
  return (
    <div className={`marquee ${className}`.trim()}>
      <span className="marquee-label">{label}</span>
      <div className="marquee-viewport">
        {/* The run is duplicated so the loop has no visible seam. The
            duplicate is hidden from assistive tech. */}
        {[0, 1].map((copy) => (
          <ul className="marquee-run" key={copy} aria-hidden={copy === 1}>
            {items.map((word, i) => (
              <li className="marquee-word" key={`${copy}-${word}-${i}`}>
                {word}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Two counter-scrolling strips. This is the rhythm that makes the club
 * site feel alive rather than like a static poster.
 */
export default function Ticker() {
  return (
    <section aria-label="Club activity">
      {strip("", TICKER_WORDS, "What we run")}
      {strip("marquee--reverse", TICKER_SLOGAN, "Slogan")}
    </section>
  );
}