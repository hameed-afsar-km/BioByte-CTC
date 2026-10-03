import type { Metadata, Viewport } from "next";
import { Bangers, Chakra_Petch } from "next/font/google";
import "./globals.css";
/* Section layouts load after the design system so they win specificity ties. */
import "./sections.css";
import "./redesign.css";

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
  display: "swap",
});

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://omnicon.vercel.app"),
  title: {
    default: "OMNICON — It's Time To Transform",
    template: "%s · OMNICON",
  },
  description:
    "OMNICON is a one-day biotech hackathon by Crescent Technocrats Club. Pick an alien track, build a working prototype and demo it the same day.",
  keywords: [
    "OMNICON",
    "BEN 10",
    "hackathon",
    "biotech",
    "biotechnology",
    "Crescent Technocrats Club",
    "student hackathon",
  ],
  openGraph: {
    title: "OMNICON — It's Time To Transform",
    description:
      "A one-day biotech hackathon. Five alien tracks, teams of 2 to 4, one working build.",
    type: "website",
  },
  icons: {
    icon: "/omnitrix.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#01050a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bangers.variable} ${chakra.variable}`}>
      <body>{children}</body>
    </html>
  );
}
