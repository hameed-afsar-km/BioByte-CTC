import About from "@/components/About";
import AlienGallery from "@/components/AlienGallery";
import Contact from "@/components/Contact";
import CoreTeam from "@/components/CoreTeam";
import FAQs from "@/components/FAQs";
import FeaturedMission from "@/components/FeaturedMission";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Prizes from "@/components/Prizes";
import ProblemStatements from "@/components/ProblemStatements";
import Registration from "@/components/Registration";
import RulesTimeline from "@/components/RulesTimeline";
import SiteNav from "@/components/SiteNav";
import SplashScreen from "@/components/SplashScreen";
import Ticker from "@/components/Ticker";

/**
 * Narrative order: what it is → what you get → who you become → the work →
 * the reward → the rules → the sign-up → the fine print → the people.
 */
export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <SiteNav />

      <main className="page-body">
        <Hero />
        <Ticker />
        <FeaturedMission />
        <AlienGallery />
        <About />
        <ProblemStatements />
        <Prizes />
        <RulesTimeline />
        <Registration />
        <FAQs />
        <CoreTeam />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
