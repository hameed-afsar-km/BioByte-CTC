"use client";

import { useState } from "react";
import { PROBLEMS } from "@/data/site";
import MissionCard from "./MissionCard";
import MissionModal from "./MissionModal";
import SectionHead from "./SectionHead";

export default function ProblemStatements() {
  const [active, setActive] = useState<string | null>(null);

  const problem = PROBLEMS.find((item) => item.id === active) ?? null;

  return (
    <section id="problems" className="section problems-section">
      <SectionHead
        kicker="Challenge Files"
        title="Pick Your Mission"
        sub="Five official problem statements. Open one mission file at a time — your registration stays locked to the track you pick, and every alien has a limited number of slots."
      />

      <div className="mission-grid">
        {PROBLEMS.map((item, index) => (
          <MissionCard key={item.id} problem={item} index={index} onOpen={setActive} />
        ))}
      </div>

      <MissionModal problem={problem} onClose={() => setActive(null)} />
    </section>
  );
}