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

// Sub-paths on a user profile that are NOT repositories (e.g., github.com/username/repositories)
const NON_REPO_SEGMENTS = new Set([
  "followers",
  "following",
  "repositories",
  "projects",
  "packages",
  "stars",
  "sponsoring",
  "sponsors",
  "achievements",
  "tab",
]);

const GITHUB_USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const GITHUB_REPO_RE = /^[a-zA-Z0-9._-]{1,100}$/;

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
 * Attempts to extract a valid GitHub repository { owner, repo } from a URL string.
 * Returns { owner, repo } on success, or null if the URL is not a repository page.
 */
function extractRepo(urlStr) {
  let url;
  try {
    url = new URL(urlStr);
  } catch {
    return null;
  }

  if (url.hostname !== "github.com") return null;

  // Trim leading slash and split
  const parts = url.pathname.replace(/^\//, "").split("/").filter(Boolean);

  // Must have at least two segments for a repository page (/owner/repo/...)
  if (parts.length < 2) return null;

  const owner = parts[0];
  let repo = parts[1];

  // Strip optional trailing .git
  if (repo.endsWith(".git")) {
    repo = repo.slice(0, -4);
  }

  // Reject known non-profile / non-repo paths
  if (NON_PROFILE_SEGMENTS.has(owner.toLowerCase())) return null;
  if (NON_REPO_SEGMENTS.has(repo.toLowerCase())) return null;

  // Validate owner and repo against safe GitHub naming rules
  if (!GITHUB_USERNAME_RE.test(owner)) return null;
  if (!GITHUB_REPO_RE.test(repo)) return null;
  if (repo === "." || repo === "..") return null;

  return { owner, repo };
}

/**
 * Returns the GitHub { owner, repo } visible on the current page, or null.
 */
function detectGitHubRepo() {
  return extractRepo(window.location.href);
}

/**
 * Listens for GitHub SPA navigation (pushState / popstate / turbo) and calls
 * `callback(username | null)` whenever navigation occurs.
 * Returns a cleanup function.
 */
function listenForNavigation(callback) {
  let lastUrl = window.location.href;

  function check() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      const currentUsername = detectGitHubUsername();
      callback(currentUsername);
    }
  }

  // Intercept pushState so we catch GitHub's SPA link clicks
  const originalPushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    originalPushState(...args);
    // Small tick delay so the new URL is fully settled
    setTimeout(check, 50);
  };

  // Intercept replaceState as well for completeness
  const originalReplaceState = history.replaceState?.bind(history);
  if (originalReplaceState) {
    history.replaceState = function (...args) {
      originalReplaceState(...args);
      setTimeout(check, 50);
    };
  }

  window.addEventListener("popstate", check);
  document.addEventListener("turbo:load", check);
  document.addEventListener("turbo:render", check);

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
    if (originalReplaceState) history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", check);
    document.removeEventListener("turbo:load", check);
    document.removeEventListener("turbo:render", check);
    titleObserver.disconnect();
  };
}

// Expose on window so both scripts loaded via manifest content_scripts can share
window.__gtmDetect = {
  detectGitHubUsername,
  detectGitHubRepo,
  listenForNavigation,
  extractUsername,
  extractRepo,
};
