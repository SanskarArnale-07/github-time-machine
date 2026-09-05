/**
 * content.js — GitHub Time Machine content script
 *
 * Injects a tasteful "Replay this GitHub" CTA near the contribution graph
 * on GitHub profile pages. Handles GitHub's SPA navigation so the button
 * appears/disappears correctly as you move between profile pages and repos.
 */

const BUTTON_ID = "gtm-replay-btn";
const BUTTON_ATTR = "data-gtm-injected";

// Track the currently detected username so the popup can query us directly
let _currentUsername = null;

// Respond to popup's direct query for the username on this tab.
// Must return true to keep the message channel open for sendResponse.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_USERNAME") {
    sendResponse({ username: _currentUsername });
    return true;
  }
});

// ─── Config ──────────────────────────────────────────────────────────────────

/** Production deployment URL — single constant, matches popup.js. */
const PRODUCTION_URL = "https://github-time-machine-sage.vercel.app";

/**
 * Validates candidate base URL before using it for window.open.
 * Only allows localhost development (http://localhost:3000) or authorized HTTPS production.
 */
function validateBaseUrl(urlInput) {
  if (!urlInput) return PRODUCTION_URL;
  try {
    const parsed = new URL(urlInput.trim());
    if (parsed.username || parsed.password) return PRODUCTION_URL;
    if (parsed.search || parsed.hash) return PRODUCTION_URL;

    const hostname = parsed.hostname.toLowerCase();
    const protocol = parsed.protocol.toLowerCase();
    const port = parsed.port;

    const isLocalDev =
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      (port === "3000" || port === "") &&
      protocol === "http:";

    const isProdOrigin =
      protocol === "https:" &&
      (hostname === "github-time-machine-sage.vercel.app" ||
        (hostname.endsWith(".vercel.app") && hostname.startsWith("github-time-machine")));

    if (isLocalDev || isProdOrigin) {
      return `${parsed.protocol}//${parsed.host}`;
    }
  } catch {}
  return PRODUCTION_URL;
}

function getBaseUrl() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(["gtmBaseUrl"], (result) => {
        resolve(validateBaseUrl(result.gtmBaseUrl));
      });
    } catch {
      resolve(PRODUCTION_URL);
    }
  });
}


// ─── Button injection ─────────────────────────────────────────────────────────

function removeExistingButton() {
  const existing = document.getElementById(BUTTON_ID);
  if (existing) existing.remove();
}

function injectButton(username) {
  // Don't duplicate
  if (document.getElementById(BUTTON_ID)) return;

  const btn = document.createElement("button");
  btn.id = BUTTON_ID;
  btn.setAttribute(BUTTON_ATTR, "true");
  btn.setAttribute("aria-label", `Replay ${username}'s GitHub history in GitHub Time Machine`);
  btn.innerHTML = `
    <span class="gtm-btn-icon">⏪</span>
    <span class="gtm-btn-text">Replay this GitHub</span>
  `;

  // Inject styles (scoped to our element only — no Tailwind, no external CSS)
  const style = document.createElement("style");
  style.id = "gtm-styles";
  style.textContent = `
    #${BUTTON_ID} {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px;
      background: #0a0a0a;
      color: #e6edf3;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
      outline: none;
      vertical-align: middle;
      letter-spacing: 0.01em;
    }
    #${BUTTON_ID}:hover {
      background: #161b22;
      border-color: rgba(255,255,255,0.3);
      box-shadow: 0 0 0 3px rgba(255,255,255,0.06);
    }
    #${BUTTON_ID}:active {
      background: #0d1117;
      transform: scale(0.98);
    }
    #${BUTTON_ID}:focus-visible {
      box-shadow: 0 0 0 3px rgba(88,166,255,0.4);
      border-color: #58a6ff;
    }
    .gtm-btn-icon {
      font-size: 14px;
      line-height: 1;
    }
    .gtm-wrapper {
      display: flex;
      align-items: center;
      margin-top: 12px;
    }
    .gtm-floating-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      animation: gtmSlideIn 300ms ease forwards;
    }
    @keyframes gtmSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  btn.addEventListener("click", async () => {
    const baseUrl = await getBaseUrl();
    const replayUrl = `${baseUrl}/replay/${encodeURIComponent(username)}`;
    window.open(replayUrl, "_blank", "noopener,noreferrer");
  });

  // Try inserting near the contribution graph first (most prominent placement)
  const inserted = tryInsertNearContributions(btn, style);

  if (!inserted) {
    // Fallback: floating button in the corner
    const wrapper = document.createElement("div");
    wrapper.className = "gtm-floating-wrapper";
    wrapper.appendChild(btn);
    if (!document.getElementById("gtm-styles")) document.head.appendChild(style);
    document.body.appendChild(wrapper);
  }

  // Notify the popup of the current username so it renders immediately
  try {
    chrome.runtime.sendMessage({ type: "USERNAME_DETECTED", username });
  } catch {
    // Background may not be listening — ignore
  }
}

/**
 * Attempts to inject the button near GitHub's contribution/activity section.
 * Returns true if injection succeeded, false if the target wasn't found.
 */
function tryInsertNearContributions(btn, style) {
  // GitHub's contribution section selectors (may change with GitHub UI updates)
  const candidates = [
    // The "Overview" tab contribution calendar section header
    () => document.querySelector(".js-yearly-contributions h2"),
    () => document.querySelector('[data-tab-item="overview"] .contribution-activity-listing'),
    // Profile header action buttons area
    () => document.querySelector(".js-profile-editable-area .js-profile-editable-replace"),
    // The pinned repos section header (good secondary target)
    () => document.querySelector(".js-pinned-items-reorder-container"),
    // The calendar container itself
    () => document.querySelector(".js-calendar-graph"),
    () => document.querySelector(".ContributionCalendar"),
    // Newer GitHub layout
    () => document.querySelector("[data-view-component=true].js-profile-timeline-year-list"),
    () => document.querySelector(".profile-timeline-card"),
  ];

  for (const fn of candidates) {
    const target = fn();
    if (!target) continue;

    const wrapper = document.createElement("div");
    wrapper.className = "gtm-wrapper";
    wrapper.appendChild(btn);

    if (!document.getElementById("gtm-styles")) {
      document.head.appendChild(style);
    }

    // Insert after the target element
    target.parentNode?.insertBefore(wrapper, target.nextSibling) ??
      target.parentNode?.appendChild(wrapper);

    return true;
  }

  return false;
}

// ─── Main logic ──────────────────────────────────────────────────────────────

function handlePage() {
  const username = window.__gtmDetect.detectGitHubUsername();
  _currentUsername = username; // keep in sync for popup queries
  removeExistingButton();

  if (username) {
    // Short delay to let GitHub finish its own DOM updates after SPA navigation
    setTimeout(() => injectButton(username), 200);
  } else {
    // Notify popup there's no profile on this page
    try {
      chrome.runtime.sendMessage({ type: "NO_PROFILE" });
    } catch {
      // Ignore
    }
  }
}

// Initial run
handlePage();

// Watch for SPA navigation
const cleanupNav = window.__gtmDetect.listenForNavigation(() => {
  handlePage();
});

// Clean up if the content script is somehow unloaded (e.g. extension reload)
window.addEventListener("unload", cleanupNav);
