/**
 * github-detect.js
 * Detects the GitHub username from the current page URL and listens for
 * GitHub's SPA-style navigation (pushState / popstate + title mutation).
 *
 * Exported as plain functions so both the content script and background
 * worker can import them.
 */

// Paths that look like /username but are NOT profile pages
const NON_PROFILE_SEGMENTS = new Set([
  "settings",
  "marketplace",
  "explore",
  "notifications",
  "issues",
  "pulls",
  "trending",
  "features",
  "pricing",
  "about",
  "login",
  "join",
  "orgs",
  "apps",
  "users",
  "search",
  "codespaces",
  "discussions",
  "sponsors",
  "topics",
  "events",
  "contact",
  "security",
  "new",
  "organizations",
  "collections",
  "enterprise",
  "readme",
  "github",
]);

/**
 * Attempts to extract a valid GitHub profile username from a URL string.
 * Returns the username string on success, or null if the URL is not a profile page.
 */
function extractUsername(urlStr) {
  let url;
  try {
    url = new URL(urlStr);
  } catch {
    return null;
  }

  if (url.hostname !== "github.com") return null;

  // Trim leading slash and split
  const parts = url.pathname.replace(/^\//, "").split("/").filter(Boolean);

  // Must be exactly ONE segment for a profile page (github.com/username)
  if (parts.length !== 1) return null;

  const segment = parts[0];

  // Reject known non-profile paths
  if (NON_PROFILE_SEGMENTS.has(segment.toLowerCase())) return null;

  // GitHub usernames: 1–39 chars, alphanumeric + hyphens, no leading/trailing hyphen
  const GITHUB_USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  if (!GITHUB_USERNAME_RE.test(segment)) return null;

  return segment;
}

/**
 * Returns the GitHub username visible on the current page, or null.
 */
function detectGitHubUsername() {
  return extractUsername(window.location.href);
}

/**
 * Listens for GitHub SPA navigation (pushState / popstate) and calls
 * `callback(username | null)` whenever the detected username changes.
 * Returns a cleanup function.
 */
function listenForNavigation(callback) {
  let lastUsername = detectGitHubUsername();

  function check() {
    const current = detectGitHubUsername();
    if (current !== lastUsername) {
      lastUsername = current;
      callback(current);
    }
  }

  // Intercept pushState so we catch GitHub's SPA link clicks
  const originalPushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    originalPushState(...args);
    // Small tick delay so the new URL is fully settled
    setTimeout(check, 50);
  };

  window.addEventListener("popstate", check);

  // MutationObserver on document.title as a belt-and-suspenders fallback
  // for any navigation that doesn't go through pushState
  const titleObserver = new MutationObserver(check);
  titleObserver.observe(document.querySelector("title") || document.head, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return function cleanup() {
    history.pushState = originalPushState;
    window.removeEventListener("popstate", check);
    titleObserver.disconnect();
  };
}

// Expose on window so both scripts loaded via manifest content_scripts can share
window.__gtmDetect = { detectGitHubUsername, listenForNavigation, extractUsername };
