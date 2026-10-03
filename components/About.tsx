import { Cpu, FlaskConical, LayoutTemplate, Activity } from "lucide-react";
import { EVENT } from "@/data/site";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const HIGHLIGHTS = [
  {
    key: "bio",
    icon: FlaskConical,
    title: "Multi-Disciplinary Core",
    text: "Tackle real-world challenges across multiple engineering and science domains.",
  },
  {
    key: "data",
    icon: Activity,
    title: "Data & Analytics",
    text: "Turn complex biological data into actionable signals and predictive models.",
  },
  {
    key: "dev",
    icon: Cpu,
    title: "Software & Hardware",
    text: "Ship a working prototype. Connect hardware sensors, build pipelines, and design interfaces.",
  },
  {
    key: "impact",
    icon: LayoutTemplate,
    title: "Measurable Impact",
    text: "Present solutions that have a real, measurable effect on yield, safety, cost, or lives.",
  }
];

export default function About() {
  return (
    <section id="about" className="section about-section">
      <SectionHead
        kicker="About"
        title="The Expo"
        sub={`${EVENT.name} is a premier multi-disciplinary project expo by ${EVENT.presenter}. Teams of ${EVENT.teamSize} select a track and transform an idea into a working prototype that deserves the stage.`}
        centered
      />

      <div className="container" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className="highlights-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {HIGHLIGHTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal
                as="article"
                key={item.key}
                className="highlight-card card card-hover"
                delay={index * 90}
                style={{ display: "flex", flexDirection: "column", padding: "1.5rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <span className="highlight-icon" style={{ display: "flex", padding: "0.8rem", background: "rgba(124, 252, 0, 0.05)", borderRadius: "8px", color: "var(--color-omni)", border: "1px solid rgba(124, 252, 0, 0.2)" }}>
                    <Icon size={24} />
                  </span>
                  <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "rgba(255, 255, 255, 0.05)", marginLeft: "auto" }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="highlight-title" style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>{item.title}</h3>
                <p className="highlight-text" style={{ color: "var(--color-mist-2)", fontSize: "0.95rem", lineHeight: 1.5 }}>{item.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}