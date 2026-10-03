import Reveal from "./Reveal";

type SectionHeadProps = {
  kicker: string;
  title: string;
  sub?: string;
  centered?: boolean;
  id?: string;
};

/** The repeated header block: kicker chip, display title, accent rule, copy. */
export default function SectionHead({
  kicker,
  title,
  sub,
  centered = false,
  id,
}: SectionHeadProps) {
  return (
    <Reveal
      as="header"
      className={`section-head ${centered ? "is-centered" : ""}`.trim()}
    >
      <span className="kicker">{kicker}</span>
      <h2 className="section-title" id={id}>
        {title}
      </h2>
      <div className="rule-line" />
      {sub ? <p className="section-sub">{sub}</p> : null}
    </Reveal>
  );
}