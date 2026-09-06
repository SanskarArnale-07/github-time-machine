import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { isValidGitHubUsername, isValidGitHubRepo } from "@/lib/github/validation";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const rawUsername = searchParams.get("username") || "";
  const rawName = searchParams.get("name") || "";
  const rawOwner = searchParams.get("owner") || "";
  const rawRepo = searchParams.get("repo") || "";

  let title = "GitHub Time Machine";
  let subtitle = "YOUR CODE HAS A HISTORY.";
  let badge = "PUBLIC DOCUMENTARY";
  let description = "A cinematic replay of public GitHub journey.";

  if (type === "profile" && isValidGitHubUsername(rawUsername)) {
    title = `@${rawUsername}`;
    subtitle = rawName ? `${rawName.toUpperCase()} · YOUR CODE HAS A HISTORY.` : "YOUR CODE HAS A HISTORY.";
    description = `A cinematic replay of @${rawUsername}'s public GitHub journey.`;
    badge = "PUBLIC PROFILE DOCUMENTARY";
  } else if (
    type === "repo" &&
    isValidGitHubUsername(rawOwner) &&
    isValidGitHubRepo(rawRepo)
  ) {
    title = `${rawOwner}/${rawRepo}`;
    subtitle = "REPOSITORY DOCUMENTARY · YOUR CODE HAS A HISTORY.";
    description = `The public development history and milestones of ${rawOwner}/${rawRepo}.`;
    badge = "PUBLIC REPO DOCUMENTARY";
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px 64px",
          backgroundColor: "#070B14",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(59, 75, 140, 0.45) 0%, transparent 55%), radial-gradient(circle at 82% 78%, rgba(212, 168, 83, 0.16) 0%, transparent 48%), radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.8) 0%, transparent 100%)",
          color: "#FFFFFF",
        }}
      >
        {/* Top Header: Brand & Public Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#D4AF37",
                boxShadow: "0 0 16px #D4AF37",
              }}
            />
            <span
              style={{
                fontSize: "20px",
                letterSpacing: "0.24em",
                fontWeight: 700,
                color: "#F1F5F9",
                textTransform: "uppercase",
              }}
            >
              GitHub Time Machine
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px",
              borderRadius: "9999px",
              border: "1px solid rgba(212, 168, 83, 0.35)",
              backgroundColor: "rgba(10, 14, 26, 0.75)",
              fontSize: "12px",
              letterSpacing: "0.2em",
              color: "#E5C07B",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {badge}
          </div>
        </div>

        {/* Center: Documentary Title & Identity */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "1040px",
          }}
        >
          <span
            style={{
              fontSize: "15px",
              letterSpacing: "0.26em",
              color: "#94A3B8",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </span>
          <span
            style={{
              fontSize: title.length > 24 ? "56px" : "72px",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              color: "#F8FAFC",
              textShadow: "0 4px 24px rgba(0,0,0,0.5)",
              wordBreak: "break-all",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: "22px",
              lineHeight: 1.4,
              color: "#CBD5E1",
              maxWidth: "880px",
              marginTop: "6px",
            }}
          >
            {description}
          </span>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "24px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              letterSpacing: "0.15em",
              color: "#64748B",
              textTransform: "uppercase",
            }}
          >
            Public GitHub Archive · Interactive Documentary
          </span>
          <span
            style={{
              fontSize: "14px",
              letterSpacing: "0.12em",
              color: "#D4AF37",
              fontWeight: 600,
            }}
          >
            github-time-machine.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    }
  );
}
