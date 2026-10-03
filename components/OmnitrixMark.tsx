type OmnitrixMarkProps = {
  className?: string;
  hue?: string;
  /** Adds the pulsing core animation. */
  active?: boolean;
  title?: string;
};

/**
 * The Omnitrix dial: ink rim, lime face, four white power wedges split by a
 * heavy black cross, hub at the centre. Pure inline SVG, so it scales to any
 * size and needs no canvas, font or image asset.
 */
export default function OmnitrixMark({
  className = "",
  hue = "var(--color-omni)",
  active = true,
  title,
}: OmnitrixMarkProps) {
  /* One wedge, drawn once and repeated. Apex on the hub, base on the rim,
     so the four of them read as the dial's power segments. */
  const wedge = "M50 50 L87.5 33.3 L87.5 66.7 Z";

  return (
    <svg
      className={`omni-mark ${className}`.trim()}
      viewBox="0 0 100 100"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}

      <g className={active ? "omni-core" : undefined}>
        {/* Ink rim */}
        <circle cx="50" cy="50" r="50" fill="var(--color-ink)" />

        {/* Lime face */}
        <circle cx="50" cy="50" r="45" fill={hue} />

        {/* Four power wedges, pointing in at the hub */}
        <g fill="var(--color-paper-2)">
          <path d={wedge} />
          <path d={wedge} transform="rotate(90 50 50)" />
          <path d={wedge} transform="rotate(180 50 50)" />
          <path d={wedge} transform="rotate(270 50 50)" />
        </g>

        {/* The cross that splits the dial into four */}
        <g fill="var(--color-ink)">
          <rect x="44.5" y="0" width="11" height="100" transform="rotate(45 50 50)" />
          <rect x="44.5" y="0" width="11" height="100" transform="rotate(-45 50 50)" />
        </g>

        {/* Hub */}
        <circle cx="50" cy="50" r="9" fill="var(--color-ink)" />
        <circle cx="50" cy="50" r="4" fill={hue} />
      </g>
    </svg>
  );
}
