import About from "@/components/About";
import CoreTeam from "@/components/CoreTeam";
import FAQs from "@/components/FAQs";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Prizes from "@/components/Prizes";
import ProblemStatements from "@/components/ProblemStatements";
import RulesTimeline from "@/components/RulesTimeline";
import SiteNav from "@/components/SiteNav";
import SplashScreen from "@/components/SplashScreen";
import Ticker from "@/components/Ticker";

export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <SiteNav />

      <main className="page-body">
        <Hero />
        <Ticker />
        <About />
        <ProblemStatements />
        <Prizes />
        <RulesTimeline />
        <FAQs />
        <CoreTeam />
      </main>

      <Footer />
    </>
  );
}
