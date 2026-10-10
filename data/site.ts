/**
 * OMNICON — single source of truth for all site content.
 *
 * Every piece of copy, track data, prize money and contact detail on the
 * site lives in this file. Components stay presentational.
 */

/* ---- Splash timing — must be at least as long as the video. ---- */
export const SPLASH_MS = 4000;
export const SPLASH_EXIT_MS = 700;

/* ---- Event identity ---- */
export const EVENT = {
  name: "BIOBYTE",
  franchise: "BEN 10",
  year: new Date().getFullYear(),
  tagline: "It's time to transform.",
  presenter: "Crescent Technocrats Club",
  blurb:
    "A multi-disciplinary project expo. Teams pick an alien track, build working tools for real problems, then demo them the same day.",
  time: "14/10/26 Wednesday",
  teamSize: "2 to 4 members",
  /**
   * Event day. `null` = not announced yet; the countdown falls back to a
   * "to be announced" state instead of inventing a deadline.
   * Wednesday 14 October 2026, 9:00 AM IST. The offset matters — without it the
   * countdown would resolve 9am in the viewer's own timezone.
   */
  date: "2026-10-14T09:00:00+05:30" as string | null,
  /**
   * Default registration deadline — Sunday 11 October 2026, 12:00 PM IST.
   * The live value in Firestore (`settings/site`) overrides this once an
   * admin changes it from the dashboard.
   */
  deadline: "2026-10-11T12:00:00+05:30",
  venue: "To be announced",
  roundOne: "Free registration + PPT submission",
  roundTwo: "₹50 per head if you make Round 2",
};

/* ---- Mission pillars ---- */
export type Pillar = {
  key: string;
  icon: "radar" | "dna" | "cpu" | "spark";
  title: string;
  text: string;
};

export const PILLARS: Pillar[] = [
  {
    key: "scout",
    icon: "radar",
    title: "Scout",
    text: "Sweep real multi-disciplinary frontiers — engineering, sciences, design, and analytics.",
  },
  {
    key: "decode",
    icon: "dna",
    title: "Decode",
    text: "Turn raw biological and industrial data into signals a human team can actually read and trust.",
  },
  {
    key: "build",
    icon: "cpu",
    title: "Build",
    text: "Ship a working prototype in a single day. Real pipelines, real models, a real interface.",
  },
  {
    key: "impact",
    icon: "spark",
    title: "Impact",
    text: "Prove the outcome. A solution only counts when it moves yield, safety, cost or lives somewhere measurable.",
  },
];

/* ---- Alien power ratings (used by the gallery + track cards) ---- */
export type StatKey = "strength" | "speed" | "intelligence" | "durability";

export const STAT_KEYS: { key: StatKey; label: string }[] = [
  { key: "strength", label: "STR" },
  { key: "speed", label: "SPD" },
  { key: "intelligence", label: "INT" },
  { key: "durability", label: "DUR" },
];

/* ---- Official tracks: one alien per challenge statement ---- */
export type Problem = {
  id: string;
  alien: string;
  species: string;
  glyph: string;
  hue: string;
  hueDeep: string;
  powers: string[];
  stats: Record<StatKey, number>;
  brief: string;
  tags: string[];
  tech: string[];
  domain: string;
  title: string;
  summary: string;
  expectedOutput: string;
  points: string[];
};

export const PROBLEMS: Problem[] = [
  {
    id: "OM-01",
    alien: "Heatblast",
    species: "Tetrax DNA",
    glyph: "✦",
    hue: "#FF7A00",
    hueDeep: "#180602",
    powers: ["Pyrokinesis", "Heat generation", "Cold resistance"],
    stats: { strength: 75, speed: 65, intelligence: 55, durability: 55 },
    brief: "Know the moment a vaccine is spoiled — and who needs to hear about it first.",
    tags: ["Cold Chain", "IoT", "Predictive Analytics"],
    tech: ["BLE / LoRa / GSM tracking", "Temperature and humidity sensing", "Time-series forecasting", "Alerting dashboards"],
    domain: "Pharma Logistics · IoT",
    title: "Cold Chain Guardian",
    summary:
      "Build a smart package for temperature-sensitive biologics that logs excursions, predicts whether the drug is still usable, and alerts the right person.",
    expectedOutput: "A smart cold-chain system that continuously monitors and records temperature conditions, detects excursions, uses predictive models to assess whether the product remains within acceptable limits, provides real-time alerts, and maintains a digital record.",
    points: [
      "Continuously log temperature across the whole shipping journey",
      "Predict remaining viability from cumulative thermal exposure",
      "Alert the right person the moment an excursion crosses the limit",
    ],
  },
  {
    id: "OM-02",
    alien: "Upgrade",
    species: "Tetrax DNA",
    glyph: "◆",
    hue: "#7CFF00",
    hueDeep: "#050A03",
    powers: ["Size shifting", "Technological adaptation", "Molecular upgrade"],
    stats: { strength: 70, speed: 45, intelligence: 95, durability: 60 },
    brief: "Put a working bioreactor on a teaching-lab bench, not a factory budget.",
    tags: ["Process Control", "Sensors", "Automation"],
    tech: ["Closed-loop PID control", "pH / DO / temperature probes", "ESP32 or STM32", "Growth modelling"],
    domain: "Bioprocess · Control Systems",
    title: "Bench-Top Smart Bioreactor",
    summary:
      "Make a low-cost lab bioreactor that automatically controls temperature, pH, dissolved oxygen and agitation, with a model that predicts growth and flags deviations early.",
    expectedOutput: "A low-cost bench-top bioreactor that automatically monitors and controls critical parameters (temperature, pH, dissolved oxygen, agitation), integrated with a predictive model to estimate growth, detect abnormal trends, and provide early warnings of process deviations.",
    points: [
      "Closed-loop control of temperature, pH, dissolved oxygen and agitation",
      "A model that predicts growth and flags deviation early",
      "A bill of materials a teaching lab can actually afford",
    ],
  },
  {
    id: "OM-03",
    alien: "Grey Matter",
    species: "Tetrax DNA",
    glyph: "◈",
    hue: "#9AA8A0",
    hueDeep: "#101614",
    powers: ["Super-intelligence", "Elastic brain", "Aquatic adaptation"],
    stats: { strength: 20, speed: 55, intelligence: 100, durability: 25 },
    brief: "Give a rural lab a microscope and an analyst for the price of a phone.",
    tags: ["Imaging", "Cell Counting", "Low Cost"],
    tech: ["Optical design and lens arrays", "Smartphone imaging", "Computer vision", "On-device ML"],
    domain: "Bio-imaging · Public Health",
    title: "Pocket Microscope for Rural Labs",
    summary:
      "Design an affordable smartphone-based microscope setup with AI that counts and classifies cells and flags abnormalities.",
    expectedOutput: "An affordable, portable smartphone-based microscope setup with an AI system capable of counting and classifying cells, identifying predefined abnormalities, and providing simple analysis suitable for low-resource environments.",
    points: [
      "An affordable optical and mechanical setup that works with a phone",
      "Counting and classifying cells straight from the captured field",
      "Flagging abnormalities for a technician with no lab nearby",
    ],
  },
  {
    id: "OM-04",
    alien: "Diamondhead",
    species: "Petrosapien DNA",
    glyph: "❖",
    hue: "#2EE6D6",
    hueDeep: "#02171B",
    powers: ["Body hardening", "Diamond exoskeleton", "Durability"],
    stats: { strength: 90, speed: 35, intelligence: 45, durability: 100 },
    brief: "Prove the waste was actually made safe, instead of assuming it was.",
    tags: ["Waste Management", "Sterilisation", "Safety"],
    tech: ["Image classification", "Colour and spectroscopy sensing", "Microbial load assays", "Compliance logging"],
    domain: "Environmental Health · Automation",
    title: "Biomedical Waste Sorter",
    summary:
      "Build a system that identifies and segregates hospital waste and verifies safe sterilisation or disposal.",
    expectedOutput: "An intelligent system that identifies and automatically segregates different categories of biomedical waste using computer vision or sensors, incorporates a method to monitor or verify appropriate sterilization or disposal, and improves traceability.",
    points: [
      "Identifying and segregating waste at the point of collection",
      "Verifying sterilisation actually happened, not just that it was logged",
      "An auditable chain from bin to final disposal",
    ],
  },
  {
    id: "OM-05",
    alien: "XLR8",
    species: "Tetrax DNA",
    glyph: "◐",
    hue: "#35A7FF",
    hueDeep: "#02101C",
    powers: ["Super-speed", "Flight", "Wheelbarrow manoeuvre"],
    stats: { strength: 35, speed: 100, intelligence: 60, durability: 30 },
    brief: "Detect emerging antimicrobial-resistance patterns before they spread.",
    tags: ["Health Data", "Predictive Analytics", "Epidemiology"],
    tech: ["Data pipelines", "Machine learning", "Clinical data mining", "Dashboards"],
    domain: "Healthcare Analytics · Bioinformatics",
    title: "Antibiotic Resistance Radar",
    summary:
      "Hospitals generate enormous amounts of microbiological and prescription data. Build a platform that detects emerging antimicrobial-resistance patterns and provides an early warning to clinicians.",
    expectedOutput: "A data platform that ingests microbiological and prescription data, applies models to identify emerging resistance patterns, and presents an early-warning dashboard for clinicians.",
    points: [
      "Ingesting and standardising diverse hospital and lab data",
      "Detecting resistance patterns faster than manual reviews",
      "Providing an actionable early-warning dashboard for clinicians",
    ],
  },
];

// CLASSIFIED aliens removed as per request.

/* ---- Prize vault ---- */
export type Prize = {
  id: string;
  place: string;
  amount: string;
  title: string;
  text: string;
  podName: string;
  alien: string;
  hue: string;
};

export const PRIZES: Prize[] = [
  {
    id: "p1",
    place: "1st Place",
    amount: "₹2,000",
    title: "Omnitrix Champion",
    text: "Strongest working build across all five tracks.",
    podName: "Omnitrix Prime",
    alien: "Upgrade",
    hue: "#7CFF00",
  },
  {
    id: "p2",
    place: "2nd Place",
    amount: "₹1,500",
    title: "Ultimate Runner-Up",
    text: "Best solution with the cleanest execution under time.",
    podName: "Alien Capsule",
    alien: "Diamondhead",
    hue: "#2EE6D6",
  },
  {
    id: "p3",
    place: "3rd Place",
    amount: "₹1,000",
    title: "Second Runner-Up",
    text: "Biggest leap from a rough idea to a working prototype.",
    podName: "Field Canister",
    alien: "Heatblast",
    hue: "#FF7A00",
  },
  {
    id: "p4",
    place: "Best Innovation",
    amount: "₹500",
    title: "Creative Spark",
    text: "Most out-of-the-box and unique approach to a problem.",
    podName: "Galvanic Core",
    alien: "Grey Matter",
    hue: "#9AA8A0",
  },
];

/* ---- Rules of engagement ---- */
export const RULES = [
  { icon: "globe", text: "Open to all students with no department or year restriction." },
  { icon: "users", text: "Each team must have 2–4 members and work on one problem statement only." },
  { icon: "advance", text: "AI tools and hardware projects are allowed. Bring your own hardware." },
  { icon: "wallet", text: "Existing solutions can be inspiration, but direct copying is prohibited." },
  { icon: "clock", text: "CTC provides guidance and support, but does not build projects for you." },
];

/* ---- Transformation protocol (Timeline) ---- */
export const PROTOCOL = [
  { step: "Mon, 5 Oct", title: "Registration Opens", text: "Problem statements are revealed and website registration begins." },
  { step: "Sun, 11 Oct", title: "Registration & PPT Deadline", text: "Registration and PPT submission extended till 12:00 PM." },
  { step: "Sun, 11 Oct", title: "Shortlisting & Payment", text: "Shortlisted teams are announced and payment is collected from the selected teams." },
  { step: "12 - 13 Oct", title: "Building the Prototype/MVP", text: "Teams begin building their working prototypes and MVPs for their selected track." },
  { step: "Wed, 14 Oct", title: "Final Demo", text: "Final judging, prototype demonstrations, and afternoon awards ceremony." },
];

/* ---- Frequently asked questions ---- */
export const FAQS = [
  {
    q: "Who can participate?",
    a: "Any student with a Crescent email address. All departments and institutions are welcome.",
  },
  {
    q: "What is the team size?",
    a: "Between 2 and 4 members per team. Register the full team together.",
  },
  {
    q: "Is registration free?",
    a: "Yes. Round 1 registration is free. A ₹50 per head fee applies only if your team advances to Round 2.",
  },
  {
    q: "What is required in Round 1?",
    a: "A PPT submission that explains your approach to the chosen problem statement.",
  },
  {
    q: "How do I pick my alien track?",
    a: "Open each mission file, read the brief and choose the one your team can actually build in a day. Your registration is locked to that track once you confirm it, and every track is open to as many teams as want to attempt it.",
  },
  {
    q: "What happens in Round 2?",
    a: "Shortlisted teams build a working prototype of their solution, then present it in the final demo.",
  },
  {
    q: "What are the event timings?",
    a: "9:00 AM to 4:10 PM on event day, for both rounds.",
  },
];

/* ---- Command center ---- */
export const COORDINATORS = [
  { name: "Hameed Afsar", role: "CEO", phone: "9489475038" },
  { name: "Mehar Basha", role: "COO", phone: "6379155839" },
  { name: "Merfin Hanson", role: "CTO", phone: "7010416207" },
];

export const CONVENORS = [
  { name: "Dr. Karthikeyan Ramalingam", role: "Dean of Student Affairs" },
  { name: "Dr. Aisha Banu", role: "Club Coordinator" },
];

/* ---- Student core team ----
   Phone numbers are looked up from COORDINATORS so this section and the
   Contact section can never drift apart. */
const CORE_TEAM_META = [
  { name: "Merfin Hanson", title: "Technical Head", handle: "merfinhanson", badge: "CTO", alien: "Upgrade" },
  { name: "Hameed Afsar", title: "Event Coordinator", handle: "hameedafsar", badge: "COO", alien: "XLR8" },
  { name: "Mehar Basha", title: "Operations Lead", handle: "meharbasha", badge: "OPS", alien: "Diamondhead" },
];

export const CORE_TEAM = CORE_TEAM_META.map((member, index) => {
  const match = COORDINATORS.find((person) => person.name === member.name);

  return {
    ...member,
    role: match ? match.role : "",
    phone: match ? match.phone : "",
    hue: ["#7CFF00", "#FF3B30", "#2EE6D6"][index % 3],
    status: "Online",
  };
});

/* ---- Footer ---- */
export const FOOTER_LINKS = [
  { id: "top", label: "Home" },
  { id: "about", label: "About" },
  { id: "problems", label: "Mission Files" },
  { id: "timeline", label: "Rules & Timeline" },
  { id: "prizes", label: "Prize Vault" },
  { id: "faq", label: "FAQs" },
  { id: "contact", label: "Contact" },
];

/* ---- Navbar ---- */
export const NAV_ITEMS = [
  { id: "aliens", label: "Aliens" },
  { id: "about", label: "About" },
  { id: "prizes", label: "Prizes" },
  { id: "timeline", label: "How it works" },
];

/* ---- Marquee copy ---- */
export const TICKER_WORDS = [
  "Project Expo",
  "Multi-Disciplinary",
  "Engineering",
  "Prototypes",
  "Innovation",
  "Hardware",
  "Software",
  "Demos",
];