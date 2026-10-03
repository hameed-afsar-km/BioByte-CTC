/**
 * OMNICON — single source of truth for all site content.
 *
 * Every piece of copy, track data, prize money and contact detail on the
 * site lives in this file. Components stay presentational.
 */

/* ---- Splash timing (shared by the JS timer and the CSS animation) ---- */
export const SPLASH_MS = 2800;
export const SPLASH_EXIT_MS = 600;

/* ---- Event identity ---- */
export const EVENT = {
  name: "OMNICON",
  franchise: "BEN 10",
  year: new Date().getFullYear(),
  tagline: "It's time to transform.",
  presenter: "Crescent Technocrats Club",
  blurb:
    "A one-day biotech hackathon. Teams pick an alien track, build working tools for real problems in bioprocessing, imaging and drug discovery, then demo them the same day.",
  time: "9:00 AM – 4:10 PM",
  /**
   * Event day. `null` = not announced yet; the countdown falls back to a
   * "to be announced" state instead of inventing a deadline.
   * Set e.g. "2026-11-14T09:00:00+05:30" and the countdown goes live.
   */
  date: null as string | null,
  venue: "To be announced",
  teamSize: "2 to 4 members",
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
    text: "Sweep real biotech frontiers — bioprocess, imaging, fermentation, environmental sensing and drug discovery.",
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
  capacity: number;
  brief: string;
  tags: string[];
  tech: string[];
  domain: string;
  title: string;
  summary: string;
  points: string[];
};

export const PROBLEMS: Problem[] = [
  {
    id: "OM-01",
    alien: "Upgrade",
    species: "Tetrax DNA",
    glyph: "◆",
    hue: "#7CFF00",
    hueDeep: "#050A03",
    powers: ["Size shifting", "Technological adaptation", "Molecular upgrade"],
    stats: { strength: 70, speed: 45, intelligence: 95, durability: 60 },
    capacity: 12,
    brief: "Twin the bioreactor and catch a failing batch before it costs you the run.",
    tags: ["Simulation", "Real-time Data", "Optimisation"],
    tech: ["Python", "Simulation models", "IoT / sensor data", "Dashboards"],
    domain: "Bioprocess Engineering",
    title: "Digital Twin for Industrial Bioreactors",
    summary:
      "Build a digital twin that fuses first-principles models, microbial kinetics, live sensor feeds and historical fermentation data to continuously predict biomass growth, substrate use and product formation — then run what-if simulations to cut batch failures.",
    points: [
      "Continuous prediction of growth, oxygen uptake and metabolite output",
      "Early detection of process deviations",
      "What-if simulation for feeding, aeration, agitation and temperature",
    ],
  },
  {
    id: "OM-02",
    alien: "Grey Matter",
    species: "Tetrax DNA",
    glyph: "◈",
    hue: "#9AA8A0",
    hueDeep: "#101614",
    powers: ["Super-intelligence", "Elastic brain", "Aquatic adaptation"],
    stats: { strength: 20, speed: 55, intelligence: 100, durability: 25 },
    capacity: 12,
    brief: "Teach a model to spot what a slide under a microscope was missing.",
    tags: ["Image AI", "Cell Counting", "Detection"],
    tech: ["Computer vision", "CNNs", "OpenCV", "PyTorch / TensorFlow"],
    domain: "Computer Vision · Bio-imaging",
    title: "AI-Based Microscopy Analysis",
    summary:
      "Create an AI image-analysis system that automatically detects, counts, classifies and flags abnormal cells from microscopy images, surfacing results through annotated images, graphs or a live dashboard.",
    points: [
      "Detect, count, classify and identify cell abnormalities",
      "Analyse size, shape, morphology and distribution features",
      "Report through annotated output or a dashboard",
    ],
  },
  {
    id: "OM-03",
    alien: "Heatblast",
    species: "Tetrax DNA",
    glyph: "✦",
    hue: "#FF7A00",
    hueDeep: "#180602",
    powers: ["Pyrokinesis", "Heat generation", "Magma resistance"],
    stats: { strength: 75, speed: 65, intelligence: 55, durability: 55 },
    capacity: 12,
    brief: "Watch the fermenter live and act before the culture drifts out of spec.",
    tags: ["Sensors", "Monitoring", "Control"],
    tech: ["IoT / Arduino", "Data analytics", "Web or mobile app", "ML (optional)"],
    domain: "IoT · Process Control",
    title: "Smart Fermentation Monitoring System",
    summary:
      "Replace periodic manual checks with real-time intelligence. Analyse temperature, pH, dissolved oxygen, agitation, CO₂, optical density and nutrient levels to predict growth and recommend process adjustments.",
    points: [
      "Real-time multi-parameter sensing and fusion",
      "Predict microbial growth and estimate product formation",
      "Recommend adjustments to reduce operator intervention",
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
    capacity: 12,
    brief: "Map exactly where heavy metals will settle next, and how sure you are.",
    tags: ["Prediction", "Environment", "Modelling"],
    tech: ["Python / R", "Regression and ML", "GIS / maps", "Data visualisation"],
    domain: "Environmental Science · ML",
    title: "Heavy Metals Sedimentation Predictor",
    summary:
      "Deliver an integrated prediction system that combines grain size and mineral composition, pH, redox potential, dissolved oxygen, organic matter, and human and biological activity to flag areas most susceptible to heavy-metal sedimentation.",
    points: [
      "Fuse soil, chemical and biological signals into one model",
      "Detect high-risk zones from previously collected data",
      "Remain efficient, data-consistent and fully integrated",
    ],
  },
  {
    id: "OM-05",
    alien: "Ghostfreak",
    species: "Tetrax DNA",
    glyph: "◐",
    hue: "#7B3FD4",
    hueDeep: "#0B0418",
    powers: ["Phase intangibility", "Possession", "Precognition"],
    stats: { strength: 40, speed: 85, intelligence: 80, durability: 15 },
    capacity: 12,
    brief: "Rank old drugs for new diseases, and show your reasoning for every pick.",
    tags: ["Drug Discovery", "AI Ranking", "Bioinformatics"],
    tech: ["Machine learning", "Graph analysis", "Bioinformatics databases", "Python"],
    domain: "Computational Biology · AI/ML",
    title: "AI-Assisted Drug Repurposing Candidates",
    summary:
      "Build a computational platform that re-analyses existing drugs for new indications using drug–target interactions, molecular properties and public biological data, producing a ranked shortlist ready for further investigation.",
    points: [
      "Analyse drug–target interactions and molecular properties",
      "Use bioinformatics, docking, network analysis or AI/ML",
      "Output a ranked, prioritised shortlist of candidates",
    ],
  },
];

/**
 * Classified aliens — gallery flavour only, no mission file and no sign-up.
 * Kept separate from PROBLEMS so the form can never offer a dead track.
 */
export type ClassifiedAlien = {
  name: string;
  species: string;
  glyph: string;
  hue: string;
  quote: string;
};

export const CLASSIFIED: ClassifiedAlien[] = [
  {
    name: "XLR8",
    species: "Kryptonian DNA",
    glyph: "➤",
    hue: "#FF3B30",
    quote: "Velocity beyond machine limits.",
  },
  {
    name: "Ripjaws",
    species: "Selivan DNA",
    glyph: "◤",
    hue: "#3D9BFF",
    quote: "Built for the pressure of the deep.",
  },
  {
    name: "Wildfire",
    species: "Petrosapien DNA",
    glyph: "✸",
    hue: "#FFB300",
    quote: "Combustion at cellular temperature.",
  },
  {
    name: "Stinkworst",
    species: "Garbalon DNA",
    glyph: "✹",
    hue: "#B6FF5C",
    quote: "Aromatic payload. Deploy at your own risk.",
  },
];

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
];

/* ---- Rules of engagement ---- */
export const RULES = [
  { icon: "globe", text: "Open to all students across departments and institutions." },
  { icon: "users", text: "Team size must be between 2 and 4 members." },
  { icon: "gift", text: "Round 1 registration is completely free." },
  { icon: "fileText", text: "Round 1 requires a PPT submission from every team." },
  { icon: "advance", text: "Selected teams advance to Round 2." },
  { icon: "wallet", text: "Round 2 fee is ₹50 per head." },
  { icon: "clock", text: "Event runs from 9:00 AM to 4:10 PM." },
];

/* ---- Transformation protocol ---- */
export const PROTOCOL = [
  { step: "01", title: "Register", text: "Verify your Crescent email and register your team." },
  { step: "02", title: "Submit PPT", text: "Present your approach through a Round 1 deck." },
  { step: "03", title: "Shortlisting", text: "Judges select the teams advancing to Round 2." },
  { step: "04", title: "Round 2 Build", text: "Build a working prototype on your alien track." },
  { step: "05", title: "Final Demo", text: "Demo your solution to the panel and the floor." },
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
    a: "Open each mission file, read the brief and choose the one your team can actually build in a day. Your registration is locked to that track, and each alien has a limited number of slots.",
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
  { id: "aliens", label: "Aliens" },
  { id: "about", label: "About" },
  { id: "problems", label: "Mission Files" },
  { id: "register", label: "Registration" },
  { id: "timeline", label: "Rules & Timeline" },
  { id: "prizes", label: "Prize Vault" },
  { id: "faq", label: "FAQs" },
  { id: "core-team", label: "Core Team" },
  { id: "contact", label: "Contact" },
];

/* ---- Navbar ---- */
export const NAV_ITEMS = [
  { id: "aliens", label: "Aliens" },
  { id: "about", label: "About" },
  { id: "problems", label: "Challenges" },
  { id: "timeline", label: "How it works" },
  { id: "prizes", label: "Prizes" },
  { id: "faq", label: "FAQs" },
  { id: "core-team", label: "Core Team" },
  { id: "contact", label: "Contact" },
];

/* ---- Marquee copy ---- */
export const TICKER_WORDS = [
  "Aliens",
  "Hackathons",
  "Workshops",
  "Seminars",
  "Tech Talks",
  "Biolabs",
  "Ideathons",
  "Demos",
  "Mentoring",
];

export const TICKER_SLOGAN = ["It's time to transform.", "Pick your alien."];