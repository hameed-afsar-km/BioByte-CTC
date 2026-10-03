import { TICKER_WORDS } from "@/data/site";

function strip(className: string, items: string[]) {
  // Multiply items so a single run is wide enough to overflow ultra-wide screens
  const multipliedItems = [...items, ...items, ...items, ...items, ...items, ...items];
  
  return (
    <div className={`marquee ${className}`.trim()}>
      <div className="marquee-viewport marquee-viewport--centered">
        {/* The run is duplicated so the loop has no visible seam. The
            duplicate is hidden from assistive tech. */}
        {[0, 1].map((copy) => (
          <ul className="marquee-run" key={copy} aria-hidden={copy === 1}>
            {multipliedItems.map((word, i) => (
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
 * Single scrolling strip. Center focused and faded at the edges.
 */
export default function Ticker() {
  return (
    <section aria-label="Project Expo Focus" className="ticker-section">
      {strip("", TICKER_WORDS)}
    </section>
  );
}