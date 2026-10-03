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
    default: "BioByte",
    template: "%s · BioByte",
  },
  description:
    "BioByte is a premier multi-disciplinary project expo by Crescent Technocrats Club. Assemble your crew, dive into cutting-edge challenges, and build innovative prototypes.",
  keywords: [
    "BioByte",
    "BEN 10",
    "project expo",
    "multi-disciplinary",
    "Crescent Technocrats Club",
    "student expo",
  ],
  openGraph: {
    title: "BioByte",
    description:
      "A premier multi-disciplinary project expo. Five alien tracks, teams of 2 to 4, one working build.",
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
