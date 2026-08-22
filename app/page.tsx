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
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        qs.set(key, Array.isArray(value) ? value[0] : value);
      }
    }
    redirect(`/auth/callback?${qs.toString()}`);
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
