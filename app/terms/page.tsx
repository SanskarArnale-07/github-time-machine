import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SpaceBackground } from "@/components/space-background";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Terms of Service — GitHub Time Machine",
  description: "Terms of Service for GitHub Time Machine.",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[#071426] text-zinc-300 selection:bg-white/20 selection:text-white">
      {/* Global Space Atmosphere */}
      <SpaceBackground variant="fixed" theme="default" />

      {/* Header */}
      <header className="relative z-20 border-b border-blue-400/10 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-950/50 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-blue-200/80 backdrop-blur-md transition-colors hover:border-blue-400/40 hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <span className="font-mono text-xs text-blue-200/50 uppercase tracking-widest">
            Legal Archive
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 sm:py-20">
        <div className="rounded-[2rem] border border-blue-400/20 bg-[#0d1830]/75 p-8 sm:p-14 backdrop-blur-xl shadow-2xl">
          <div className="mb-10 pb-8 border-b border-white/10">
            <span className="font-mono text-xs text-[#d4a853] uppercase tracking-widest font-medium">
              Terms of Service
            </span>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-3 font-mono text-xs text-zinc-500">
              Last updated: September 2026
            </p>
          </div>

          <div className="prose prose-invert prose-zinc max-w-none space-y-8 font-sans leading-relaxed text-sm sm:text-base text-zinc-300">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, or utilizing GitHub Time Machine (the "Service"), including the web application and browser extension, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                2. Description of the Service
              </h2>
              <p>
                GitHub Time Machine is a cinematic developer documentary platform that visualizes public and user-authorized GitHub contribution histories. The Service generates interactive visual timelines, commit chapters, and summary analytics reflecting a developer's software development journey.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                3. GitHub Data & Read-Only Access
              </h2>
              <p>
                The Service requests strictly read-only access to your public or authorized repository metadata and commit history via the standard GitHub REST and GraphQL APIs.
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li>The Service will never push commits, create branches, or alter repositories on your behalf.</li>
                <li>The Service will never write to your repositories or modify your GitHub profile.</li>
                <li>You may revoke authentication and authorization permissions at any time directly through your GitHub account security settings.</li>
              </ul>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs font-mono text-zinc-400">
                DISCLAIMER: GitHub Time Machine is an independent project and is not affiliated with, endorsed by, sponsored by, or formally associated with GitHub, Inc. or Microsoft Corporation. "GitHub" is a registered trademark of GitHub, Inc.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                4. User Responsibilities
              </h2>
              <p>
                You are responsible for ensuring that your use of the Service complies with applicable laws, your employer's or organization's policies, and the GitHub Terms of Service. You agree not to use the Service to harvest proprietary intellectual property or circumvent GitHub API rate limits.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                5. Third-Party Services
              </h2>
              <p>
                The Service relies upon external third-party infrastructure and APIs, including the GitHub API, Supabase authentication infrastructure, and hosting providers. Your use of these third-party services is subject to their respective terms and policies. We do not assume responsibility for third-party service interruptions or rate limiting.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                6. Availability of the Service
              </h2>
              <p>
                The Service is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted, secure, or error-free operation. Functionality may temporarily be limited by GitHub API rate limits, server maintenance, or network conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                7. Intellectual Property
              </h2>
              <p>
                You retain all rights and ownership in your code, repositories, and historical commit data. The software, animations, visual styling, designs, audio soundtrack compositions, and trademarks constituting GitHub Time Machine are the property of the project creators and contributors.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                8. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, GitHub Time Machine and its maintainers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, profits, or goodwill, arising out of or related to your use of or inability to use the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                9. Changes to These Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted to this page with an updated revision date. Your continued use of the Service following the posting of changes constitutes acceptance of the revised terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                10. Contact
              </h2>
              <p>
                If you have questions or concerns regarding these Terms of Service, you may contact the maintainers via the official project repository or GitHub profile.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
