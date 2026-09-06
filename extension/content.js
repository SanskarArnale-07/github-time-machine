/**
 * content.js — GitHub Time Machine content script
 *
 * Injects a tasteful "Replay this GitHub" CTA near the contribution graph
 * on GitHub profile pages. Handles GitHub's SPA navigation so the button
 * appears/disappears correctly as you move between profile pages and repos.
 */

const BUTTON_ID = "gtm-replay-btn";
const BUTTON_ATTR = "data-gtm-injected";

const REPO_CONTAINER_ID = "gtm-repo-companion";
const REPO_ICON_ID = "gtm-repo-icon";
const REPO_STYLES_ID = "gtm-repo-styles";

// Cooldown constants: 3 hours for regular re-show on the same repo, 12 hours if dismissed
const REPO_COOLDOWN_MS = 3 * 60 * 60 * 1000;
const DISMISS_COOLDOWN_MS = 12 * 60 * 60 * 1000;

// Track the currently detected username so the popup can query us directly
let _currentUsername = null;
// Track the currently active repository { owner, repo }
let _activeRepo = null;

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

// ─── Cooldown Storage Helpers ────────────────────────────────────────────────

function getRepoCooldownKey(owner, repo) {
  return `gtmRepoCooldown_${owner.toLowerCase()}_${repo.toLowerCase()}`;
}

function getRepoDismissKey(owner, repo) {
  return `gtmRepoDismissed_${owner.toLowerCase()}_${repo.toLowerCase()}`;
}

function shouldShowRepoIcon(owner, repo) {
  return new Promise((resolve) => {
    try {
      const coolKey = getRepoCooldownKey(owner, repo);
      const dismissKey = getRepoDismissKey(owner, repo);
      chrome.storage.local.get([coolKey, dismissKey], (result) => {
        if (chrome.runtime.lastError) {
          return resolve(false);
        }
        const now = Date.now();
        const dismissedAt = result[dismissKey] || 0;
        if (now - dismissedAt < DISMISS_COOLDOWN_MS) {
          return resolve(false);
        }
        const shownAt = result[coolKey] || 0;
        if (now - shownAt < REPO_COOLDOWN_MS) {
          return resolve(false);
        }
        resolve(true);
      });
    } catch {
      resolve(false);
    }
  });
}

function markRepoIconShown(owner, repo) {
  try {
    const coolKey = getRepoCooldownKey(owner, repo);
    chrome.storage.local.set({ [coolKey]: Date.now() });
  } catch {}
}

function markRepoDismissed(owner, repo) {
  try {
    const dismissKey = getRepoDismissKey(owner, repo);
    chrome.storage.local.set({ [dismissKey]: Date.now() });
  } catch {}
}

function removeRepoIcon() {
  const container = document.getElementById(REPO_CONTAINER_ID);
  if (container) {
    container.remove();
  }
}

// ─── Profile Button Injection ────────────────────────────────────────────────

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

// ─── Repository Companion Icon Injection ─────────────────────────────────────

function injectRepoIcon(owner, repo) {
  // Prevent duplicates
  if (document.getElementById(REPO_CONTAINER_ID)) return;

  // Inject styles if not present
  if (!document.getElementById(REPO_STYLES_ID)) {
    const style = document.createElement("style");
    style.id = REPO_STYLES_ID;
    style.textContent = `
      #${REPO_CONTAINER_ID}.gtm-companion-wrap {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: gtmCompanionFadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes gtmCompanionFadeIn {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .gtm-companion-btn {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: rgba(10, 15, 26, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.35);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 14px rgba(56, 189, 248, 0.18);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        outline: none;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                    border-color 0.2s ease,
                    box-shadow 0.2s ease,
                    background 0.2s ease;
      }

      .gtm-companion-btn:hover {
        transform: translateY(-2px) scale(1.06);
        background: rgba(15, 23, 42, 0.95);
        border-color: rgba(56, 189, 248, 0.7);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 22px rgba(56, 189, 248, 0.4);
      }

      .gtm-companion-btn:active {
        transform: translateY(0) scale(0.96);
        background: #0b1120;
      }

      .gtm-companion-btn:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 3px;
        box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.25);
      }

      .gtm-companion-svg {
        display: block;
        pointer-events: none;
        filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.5));
        transition: filter 0.2s ease;
      }

      .gtm-companion-btn:hover .gtm-companion-svg {
        filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
      }

      .gtm-companion-tooltip {
        position: absolute;
        right: calc(100% + 12px);
        top: 50%;
        transform: translateY(-50%) translateX(6px);
        background: rgba(8, 12, 22, 0.94);
        border: 1px solid rgba(56, 189, 248, 0.3);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5), 0 0 12px rgba(56, 189, 248, 0.15);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.02em;
        padding: 6px 12px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 10000;
      }

      .gtm-companion-btn:hover ~ .gtm-companion-tooltip,
      .gtm-companion-btn:focus-visible ~ .gtm-companion-tooltip {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
      }

      .gtm-companion-dismiss {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #94a3b8;
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-weight: bold;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        padding: 0;
        outline: none;
        transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        z-index: 10001;
      }

      .gtm-companion-wrap:hover .gtm-companion-dismiss,
      .gtm-companion-dismiss:focus-visible {
        opacity: 1;
      }

      .gtm-companion-dismiss:hover {
        background: rgba(239, 68, 68, 0.9);
        border-color: #ef4444;
        color: #ffffff;
      }

      .gtm-companion-dismiss:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 1px;
      }

      @media (prefers-reduced-motion: reduce) {
        #${REPO_CONTAINER_ID}.gtm-companion-wrap,
        .gtm-companion-btn,
        .gtm-companion-svg,
        .gtm-companion-tooltip,
        .gtm-companion-dismiss {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const container = document.createElement("div");
  container.id = REPO_CONTAINER_ID;
  container.className = "gtm-companion-wrap";
  container.setAttribute("role", "region");
  container.setAttribute("aria-label", "GitHub Time Machine Companion");

  const btn = document.createElement("button");
  btn.id = REPO_ICON_ID;
  btn.className = "gtm-companion-btn";
  btn.setAttribute("aria-label", `Replay ${owner}/${repo} in GitHub Time Machine`);
  btn.setAttribute("title", "Replay this repository");

  btn.innerHTML = `
    <svg class="gtm-companion-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="url(#gtm-repo-grad)" stroke-width="1.5" stroke-dasharray="3 2.5"/>
      <polygon points="11,7.5 5,12 11,16.5" fill="#38bdf8"/>
      <polygon points="18,7.5 12,12 18,16.5" fill="#818cf8"/>
      <defs>
        <linearGradient id="gtm-repo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#818cf8"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  const tooltip = document.createElement("div");
  tooltip.className = "gtm-companion-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.textContent = "Replay this repository";

  const dismissBtn = document.createElement("button");
  dismissBtn.className = "gtm-companion-dismiss";
  dismissBtn.setAttribute("aria-label", "Dismiss Time Machine icon");
  dismissBtn.setAttribute("title", "Dismiss");
  dismissBtn.textContent = "✕";

  btn.addEventListener("click", async () => {
    const baseUrl = await getBaseUrl();
    const destination = `${baseUrl}/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/documentary`;
    window.open(destination, "_blank", "noopener,noreferrer");
  });

  dismissBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    markRepoDismissed(owner, repo);
    container.style.opacity = "0";
    container.style.transform = "scale(0.85)";
    container.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    setTimeout(() => {
      removeRepoIcon();
    }, 200);
  });

  container.appendChild(btn);
  container.appendChild(tooltip);
  container.appendChild(dismissBtn);
  document.body.appendChild(container);
}

// ─── Main navigation & page handler ──────────────────────────────────────────

function handlePage() {
  const username = window.__gtmDetect.detectGitHubUsername();
  const repoInfo = window.__gtmDetect.detectGitHubRepo();

  _currentUsername = username; // keep in sync for popup queries

  if (username) {
    _activeRepo = null;
    removeRepoIcon();
    removeExistingButton();
    // Short delay to let GitHub finish its own DOM updates after SPA navigation
    setTimeout(() => injectButton(username), 200);
    return;
  }

  // Not a profile page: remove profile button
  removeExistingButton();
  try {
    chrome.runtime.sendMessage({ type: "NO_PROFILE" });
  } catch {}

  if (repoInfo) {
    // If still in the same repository and icon is already attached, leave it in place
    if (_activeRepo && _activeRepo.owner === repoInfo.owner && _activeRepo.repo === repoInfo.repo) {
      if (document.getElementById(REPO_CONTAINER_ID)) {
        return;
      }
    }

    // New repository or icon needs injection
    removeRepoIcon();
    _activeRepo = { owner: repoInfo.owner, repo: repoInfo.repo };

    const { owner, repo } = repoInfo;
    setTimeout(async () => {
      // Re-verify after tick to ensure user hasn't already navigated away
      const current = window.__gtmDetect.detectGitHubRepo();
      if (!current || current.owner !== owner || current.repo !== repo) {
        return;
      }
      const canShow = await shouldShowRepoIcon(owner, repo);
      if (canShow) {
        injectRepoIcon(owner, repo);
        markRepoIconShown(owner, repo);
      }
    }, 300);
  } else {
    // Neither profile nor repo page (e.g. settings, explore, search)
    _activeRepo = null;
    removeRepoIcon();
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

