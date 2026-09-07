import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { isValidGitHubUsername, isValidGitHubRepo } from "@/lib/github/validation";

export const runtime = "edge";

function formatStatNumber(numStr: string | null): string | null {
  if (!numStr) return null;
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return num.toLocaleString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const rawUsername = searchParams.get("username") || "";
  const rawName = searchParams.get("name") || "";
  const rawOwner = searchParams.get("owner") || "";
  const rawRepo = searchParams.get("repo") || "";
  const rawAvatar = searchParams.get("avatar") || "";
  const rawBio = searchParams.get("bio") || "";
  const rawDesc = searchParams.get("desc") || "";
  const rawRepos = searchParams.get("repos");
  const rawFollowers = searchParams.get("followers");
  const rawJoined = searchParams.get("joined");
  const rawStars = searchParams.get("stars");
  const rawForks = searchParams.get("forks");
  const rawLanguage = searchParams.get("language");

  const isProfile = type === "profile" && isValidGitHubUsername(rawUsername);
  const isRepo = type === "repo" && isValidGitHubUsername(rawOwner) && isValidGitHubRepo(rawRepo);

  // Common Header & Branding
  const brandName = "GITHUB TIME MACHINE";
  const badgeText = isProfile
    ? "DEVELOPER DOCUMENTARY"
    : isRepo
    ? "REPOSITORY DOCUMENTARY"
    : "PUBLIC ARCHIVE";

  // Avatar resolution
  let avatarUrl: string | null = null;
  if (rawAvatar && rawAvatar.startsWith("http")) {
    avatarUrl = rawAvatar;
  } else if (isProfile) {
    avatarUrl = `https://github.com/${rawUsername}.png`;
  } else if (isRepo) {
    avatarUrl = `https://github.com/${rawOwner}.png`;
  }

  // Profile Specifics
  const displayName = rawName || rawUsername;
  const usernameHandle = rawUsername ? `@${rawUsername}` : "";
  const profileBio = rawBio ? (rawBio.length > 130 ? `${rawBio.slice(0, 127)}...` : rawBio) : null;
  const reposStat = formatStatNumber(rawRepos);
  const followersStat = formatStatNumber(rawFollowers);
  const joinedStat = rawJoined || null;

  // Repo Specifics
  const repoFullName = `${rawOwner}/${rawRepo}`;
  const repoDesc = rawDesc
    ? rawDesc.length > 150
      ? `${rawDesc.slice(0, 147)}...`
      : rawDesc
    : null;
  const starsStat = formatStatNumber(rawStars);
  const forksStat = formatStatNumber(rawForks);
  const languageStat = rawLanguage || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          backgroundColor: "#070B14",
          backgroundImage:
            "radial-gradient(circle at 16% 20%, rgba(59, 75, 140, 0.45) 0%, transparent 55%), radial-gradient(circle at 84% 80%, rgba(212, 168, 83, 0.18) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.85) 0%, transparent 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Navigation / Brand Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#D4AF37",
                boxShadow: "0 0 20px #D4AF37",
              }}
            />
            <span
              style={{
                fontSize: "19px",
                letterSpacing: "0.22em",
                fontWeight: 700,
                color: "#F8FAFC",
                textTransform: "uppercase",
              }}
            >
              {brandName}
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "7px 18px",
              borderRadius: "9999px",
              border: "1px solid rgba(212, 168, 83, 0.4)",
              backgroundColor: "rgba(10, 14, 26, 0.8)",
              fontSize: "12px",
              letterSpacing: "0.2em",
              color: "#E5C07B",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {badgeText}
          </div>
        </div>

        {/* Center Content Section */}
        {isProfile ? (
          /* Profile Documentary View */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "28px",
              marginTop: "16px",
              marginBottom: "16px",
            }}
          >
            {/* Avatar + Main Title Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "28px",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={rawUsername}
                  width="112"
                  height="112"
                  style={{
                    width: "112px",
                    height: "112px",
                    borderRadius: "50%",
                    border: "3px solid #D4AF37",
                    boxShadow: "0 0 30px rgba(212, 168, 83, 0.35)",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "112px",
                    height: "112px",
                    borderRadius: "50%",
                    backgroundColor: "#1E293B",
                    border: "3px solid #D4AF37",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "44px",
                    fontWeight: 700,
                    color: "#D4AF37",
                  }}
                >
                  {rawUsername.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    fontSize: displayName.length > 20 ? "46px" : "56px",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#F8FAFC",
                    lineHeight: 1.1,
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#D4AF37",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {usernameHandle}
                </div>
              </div>
            </div>

            {/* Profile Bio (if available) */}
            {profileBio ? (
              <div
                style={{
                  fontSize: "20px",
                  lineHeight: 1.45,
                  color: "#CBD5E1",
                  maxWidth: "960px",
                }}
              >
                {profileBio}
              </div>
            ) : null}

            {/* Stats Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginTop: profileBio ? "0px" : "12px",
              }}
            >
              {reposStat !== null ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span style={{ fontSize: "22px", fontWeight: 800, color: "#F8FAFC" }}>
                    {reposStat}
                  </span>
                  <span style={{ fontSize: "14px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Repositories
                  </span>
                </div>
              ) : null}

              {followersStat !== null ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span style={{ fontSize: "22px", fontWeight: 800, color: "#D4AF37" }}>
                    {followersStat}
                  </span>
                  <span style={{ fontSize: "14px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Followers
                  </span>
                </div>
              ) : null}

              {joinedStat ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span style={{ fontSize: "14px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Member Since
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "#E2E8F0" }}>
                    {joinedStat}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : isRepo ? (
          /* Repository Documentary View */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              marginTop: "16px",
              marginBottom: "16px",
            }}
          >
            {/* Repo Owner Avatar + Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={rawOwner}
                  width="88"
                  height="88"
                  style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "20px",
                    border: "2px solid #D4AF37",
                    boxShadow: "0 0 26px rgba(212, 168, 83, 0.3)",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "20px",
                    backgroundColor: "#1E293B",
                    border: "2px solid #D4AF37",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    fontWeight: 700,
                    color: "#D4AF37",
                  }}
                >
                  {rawOwner.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    letterSpacing: "0.18em",
                    color: "#94A3B8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {rawOwner}
                </span>
                <span
                  style={{
                    fontSize: repoFullName.length > 24 ? "48px" : "60px",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#F8FAFC",
                    lineHeight: 1.1,
                  }}
                >
                  {rawRepo}
                </span>
              </div>
            </div>

            {/* Repo Description */}
            <div
              style={{
                fontSize: "21px",
                lineHeight: 1.4,
                color: "#CBD5E1",
                maxWidth: "1000px",
              }}
            >
              {repoDesc ||
                `The public development chronicle, commit milestones, and open-source history of ${repoFullName}.`}
            </div>

            {/* Stats Badges */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                marginTop: "6px",
              }}
            >
              {starsStat !== null ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid rgba(212, 168, 83, 0.3)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#D4AF37"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#F8FAFC" }}>
                    {starsStat}
                  </span>
                  <span style={{ fontSize: "13px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Stars
                  </span>
                </div>
              ) : null}

              {forksStat !== null ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="6" y1="3" x2="6" y2="15" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M18 9a9 9 0 0 1-9 9" />
                  </svg>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#F8FAFC" }}>
                    {forksStat}
                  </span>
                  <span style={{ fontSize: "13px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Forks
                  </span>
                </div>
              ) : null}

              {languageStat ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#38BDF8",
                    }}
                  />
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#F1F5F9" }}>
                    {languageStat}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* General Brand Share View */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "1000px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                letterSpacing: "0.24em",
                color: "#D4AF37",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Interactive Git Archaeology
            </span>
            <span
              style={{
                fontSize: "64px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
                color: "#F8FAFC",
              }}
            >
              Replay your developer journey.
            </span>
            <span
              style={{
                fontSize: "22px",
                lineHeight: 1.45,
                color: "#CBD5E1",
                maxWidth: "880px",
              }}
            >
              Turn years of commits, repos, and late-night pushes into a cinematic replay of how you became the developer you are.
            </span>
          </div>
        )}

        {/* Bottom Editorial Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              letterSpacing: "0.16em",
              color: "#64748B",
              textTransform: "uppercase",
            }}
          >
            Public GitHub Archive · Interactive Documentary
          </span>
          <span
            style={{
              fontSize: "14px",
              letterSpacing: "0.14em",
              color: "#D4AF37",
              fontWeight: 600,
            }}
          >
            github-time-machine-sage.vercel.app
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
