import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeatureCards } from "@/components/landing/feature-cards";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`);
  }

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
