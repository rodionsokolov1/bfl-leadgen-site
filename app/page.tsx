import { AudienceSections } from "@/components/home/AudienceSections";
import { Hero } from "@/components/home/Hero";
import { IntroSection } from "@/components/home/IntroSection";
import { SiteFooter } from "@/components/home/SiteFooter";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <IntroSection />
      <AudienceSections />
      <SiteFooter />
    </main>
  );
}
