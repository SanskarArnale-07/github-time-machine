import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SpaceBackground } from "@/components/space-background";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "Privacy Policy — GitHub Time Machine",
  description: "Privacy Policy and data transparency for GitHub Time Machine.",
};

export default function PrivacyPage() {
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
            Privacy & Trust
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 sm:py-20">
        <div className="rounded-[2rem] border border-blue-400/20 bg-[#0d1830]/75 p-8 sm:p-14 backdrop-blur-xl shadow-2xl">
          <div className="mb-10 pb-8 border-b border-white/10">
            <span className="font-mono text-xs text-[#d4a853] uppercase tracking-widest font-medium">
              Data Transparency
            </span>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 font-mono text-xs text-zinc-500">
              Last updated: September 2026
            </p>
          </div>

          <div className="prose prose-invert prose-zinc max-w-none space-y-8 font-sans leading-relaxed text-sm sm:text-base text-zinc-300">
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                1. What Information Is Accessed
              </h2>
              <p>
                GitHub Time Machine accesses only the information necessary to construct and display your developer documentary:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li>Public GitHub user profile details (username, display name, avatar, bio).</li>
                <li>Public repository metadata (repository names, descriptions, primary programming languages, creation dates).</li>
                <li>Public commit metadata (commit subject lines, timestamps, short SHA hashes, author names).</li>
                <li>For authenticated users, read-only access to your repository list and contribution calendars.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                2. GitHub Authentication
              </h2>
              <p>
                When you sign in using GitHub, authentication is handled through an industry-standard OAuth flow via Supabase. Sensitive credentials, OAuth tokens, and server-side API keys are securely managed server-side and are never exposed to the client-side JavaScript or the browser extension.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                3. Repository & Commit Data
              </h2>
              <p>
                The Service reads commit metadata to assemble the chronological chapters and milestones of your journey. The application does not download or duplicate your repository codebases. It strictly parses commit summaries, dates, and milestone events.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                4. How Data Is Used
              </h2>
              <p>
                Accessed data is used exclusively to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li>Generate your interactive cinematic timeline replay.</li>
                <li>Derive documentary narrative titles and monthly focus summaries.</li>
                <li>Calculate aggregate metrics (streaks, commit counts, top languages, activity patterns).</li>
                <li>Enable client-side exports (such as rendering PDF developer summaries or MP4 videos in your browser).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                5. Whether Data Is Stored
              </h2>
              <p>
                We do not store your repository code, proprietary diffs, or commit messages in any external persistent database.
              </p>
              <p>
                During an active documentary session, fetched commit data is stored temporarily in your browser's <code className="text-[#d4a853] bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">sessionStorage</code>. This eliminates redundant GitHub API calls while you scrub, pause, or rewind through chapters. Once you close your browser tab or window, this session cache is automatically cleared.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                6. API Requests
              </h2>
              <p>
                Requests for public user history are routed directly to the GitHub REST API or through a lightweight serverless endpoint to apply caching headers and avoid rate limits. We do not sell, broker, or monetize your API queries.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                7. Cookies & Local Storage
              </h2>
              <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2">
                <li>
                  <strong className="text-white">Authentication:</strong> Supabase uses standard secure HTTP cookies to maintain your authenticated session.
                </li>
                <li>
                  <strong className="text-white">Preferences:</strong> The web application stores sound settings (audio enabled, volume) in browser <code className="text-[#d4a853] bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">localStorage</code> so your soundtrack preferences persist between visits.
                </li>
                <li>
                  <strong className="text-white">Browser Extension:</strong> The GitHub Time Machine browser extension uses <code className="text-[#d4a853] bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">chrome.storage.local</code> solely to store your custom Time Machine base URL override (if configured in extension settings).
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                8. Third-Party Services
              </h2>
              <p>
                The application relies on trusted infrastructure partners:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li><strong>GitHub, Inc.:</strong> Data source and OAuth provider.</li>
                <li><strong>Supabase:</strong> Authentication management.</li>
                <li><strong>Vercel:</strong> Static hosting and serverless API execution.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                9. Data Retention
              </h2>
              <p>
                Temporary session data resides only in your local browser memory for the duration of your viewing session. When your session ends, the memory and cache are disposed of by your browser.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                10. User Choices & Revocation
              </h2>
              <p>
                You retain complete control over your GitHub data. You may revoke the application's OAuth token at any time by visiting your GitHub account settings at:
              </p>
              <p className="font-mono text-xs text-zinc-400 bg-white/[0.03] p-3 rounded-lg border border-white/5">
                GitHub → Settings → Applications → Authorized OAuth Apps → Revoke
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
                11. Contact
              </h2>
              <p>
                For privacy inquiries or technical questions regarding data processing in GitHub Time Machine, please open an issue or inquiry on the official GitHub project repository.
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
