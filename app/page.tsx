import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeatureCards } from "@/components/landing/feature-cards";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-ink">
      <Navbar />
      <Hero />
      <FeatureCards />
      <CtaBand />
      <Footer />
    </main>
  );
}
