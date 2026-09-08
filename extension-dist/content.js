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
        hostname === "github-time-machine.vercel.app");

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

let _headerObserver = null;

function removeRepoIcon() {
  if (_headerObserver) {
    _headerObserver.disconnect();
    _headerObserver = null;
  }
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
  btn.setAttribute("title", "Replay this GitHub in GitHub Time Machine");
  btn.innerHTML = `
    <span class="gtm-btn-icon-wrap" aria-hidden="true">
      <svg class="gtm-btn-svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.5" stroke="url(#gtm-profile-grad)" stroke-width="1.8" stroke-dasharray="3 2.5"/>
        <polygon points="11,7.5 5,12 11,16.5" fill="#38bdf8"/>
        <polygon points="18,7.5 12,12 18,16.5" fill="#818cf8"/>
        <defs>
          <linearGradient id="gtm-profile-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#818cf8"/>
          </linearGradient>
        </defs>
      </svg>
    </span>
    <span class="gtm-btn-text">Replay this GitHub</span>
  `;

  // Inject styles (scoped to our element only — no Tailwind, no external CSS)
  const style = document.createElement("style");
  style.id = "gtm-styles";
  style.textContent = `
    #${BUTTON_ID} {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 32px;
      padding: 0 14px;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 9999px;
      background: rgba(10, 15, 28, 0.9);
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1;
      letter-spacing: 0.01em;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35), 0 0 12px rgba(56, 189, 248, 0.12);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: background 150ms ease,
                  border-color 150ms ease,
                  box-shadow 150ms ease,
                  transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
      outline: none;
      vertical-align: middle;
    }
    #${BUTTON_ID}:hover {
      background: rgba(15, 23, 42, 0.98);
      border-color: rgba(56, 189, 248, 0.65);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5), 0 0 16px rgba(56, 189, 248, 0.3);
      transform: translateY(-1px);
      color: #ffffff;
    }
    #${BUTTON_ID}:active {
      background: #090e1a;
      transform: translateY(0) scale(0.98);
    }
    #${BUTTON_ID}:focus-visible {
      outline: 2px solid #38bdf8;
      outline-offset: 2px;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.3);
    }
    .gtm-btn-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .gtm-btn-svg {
      display: block;
      filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.45));
      transition: filter 150ms ease;
    }
    #${BUTTON_ID}:hover .gtm-btn-svg {
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.75));
    }
    .gtm-btn-text {
      font-size: 12.5px;
      font-weight: 500;
      color: #f1f5f9;
    }
    .gtm-wrapper {
      display: inline-flex;
      align-items: center;
      margin-top: 12px;
      margin-bottom: 8px;
    }
    .gtm-floating-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      animation: gtmSlideIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes gtmSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      #${BUTTON_ID},
      .gtm-floating-wrapper,
      .gtm-btn-svg {
        animation: none !important;
        transition: none !important;
        transform: none !important;
      }
    }
  `;

  btn.addEventListener("click", async () => {
    const baseUrl = await getBaseUrl();
    const returnTo = window.location.href;
    const replayUrl = `${baseUrl}/replay/${encodeURIComponent(username)}?returnTo=${encodeURIComponent(returnTo)}`;
    window.open(replayUrl, "_blank");
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
        display: inline-flex;
        align-items: center;
        position: relative;
        vertical-align: middle;
        z-index: 30;
        flex-shrink: 0;
      }

      /* Header placement: inline inside the action buttons container */
      .gtm-companion-wrap.gtm-in-header {
        margin-right: 8px;
        animation: gtmHeaderFadeIn 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      /* Fallback anchored near top header area if DOM elements are delayed (never bottom-right!) */
      .gtm-companion-wrap.gtm-anchored-header {
        position: fixed;
        top: 72px;
        right: 24px;
        z-index: 999;
        animation: gtmHeaderFadeIn 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes gtmHeaderFadeIn {
        from { opacity: 0; transform: scale(0.92); }
        to   { opacity: 1; transform: scale(1); }
      }

      .gtm-companion-btn {
        display: inline-flex;
        align-items: center;
        height: 32px;
        width: 32px;
        min-width: 32px;
        max-width: 32px;
        padding: 0;
        border-radius: 9999px;
        background: rgba(13, 17, 23, 0.92);
        border: 1px solid rgba(56, 189, 248, 0.35);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35), 0 0 12px rgba(56, 189, 248, 0.16);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        cursor: pointer;
        outline: none;
        overflow: hidden;
        white-space: nowrap;
        box-sizing: border-box;
        transition: max-width 240ms cubic-bezier(0.16, 1, 0.3, 1),
                    width 240ms cubic-bezier(0.16, 1, 0.3, 1),
                    padding 240ms cubic-bezier(0.16, 1, 0.3, 1),
                    background 180ms ease,
                    border-color 180ms ease,
                    box-shadow 180ms ease,
                    transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .gtm-companion-btn:hover,
      .gtm-companion-btn:focus-visible {
        width: auto;
        min-width: 32px;
        max-width: 220px;
        padding: 0 12px 0 7px;
        background: rgba(15, 23, 42, 0.98);
        border-color: rgba(56, 189, 248, 0.7);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), 0 0 16px rgba(56, 189, 248, 0.32);
        transform: translateY(-1px);
      }

      .gtm-companion-btn:active {
        background: #090e1a;
        transform: translateY(0) scale(0.98);
      }

      .gtm-companion-btn:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 2px;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.3);
      }

      .gtm-companion-icon-wrap {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .gtm-companion-svg {
        display: block;
        pointer-events: none;
        filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.5));
        transition: filter 0.18s ease;
      }

      .gtm-companion-btn:hover .gtm-companion-svg,
      .gtm-companion-btn:focus-visible .gtm-companion-svg {
        filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.85));
      }

      .gtm-companion-label {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.01em;
        color: #f1f5f9;
        margin-left: 5px;
        opacity: 0;
        max-width: 0;
        pointer-events: none;
        overflow: hidden;
        white-space: nowrap;
        transition: opacity 160ms ease 40ms, max-width 240ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .gtm-companion-btn:hover .gtm-companion-label,
      .gtm-companion-btn:focus-visible .gtm-companion-label {
        opacity: 1;
        max-width: 160px;
      }

      .gtm-companion-dismiss {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #94a3b8;
        font-size: 10px;
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
        .gtm-companion-label,
        .gtm-companion-dismiss {
          animation: none !important;
          transition: none !important;
          transform: none !important;
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
    <span class="gtm-companion-icon-wrap" aria-hidden="true">
      <svg class="gtm-companion-svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.5" stroke="url(#gtm-repo-grad)" stroke-width="1.6" stroke-dasharray="3 2.5"/>
        <polygon points="11,7.5 5,12 11,16.5" fill="#38bdf8"/>
        <polygon points="18,7.5 12,12 18,16.5" fill="#818cf8"/>
        <defs>
          <linearGradient id="gtm-repo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#818cf8"/>
          </linearGradient>
        </defs>
      </svg>
    </span>
    <span class="gtm-companion-label">Replay this repository</span>
  `;

  const dismissBtn = document.createElement("button");
  dismissBtn.className = "gtm-companion-dismiss";
  dismissBtn.setAttribute("aria-label", "Dismiss Time Machine icon");
  dismissBtn.setAttribute("title", "Dismiss");
  dismissBtn.textContent = "✕";

  btn.addEventListener("click", async () => {
    const baseUrl = await getBaseUrl();
    const returnTo = window.location.href;
    const destination = `${baseUrl}/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/documentary?returnTo=${encodeURIComponent(returnTo)}`;
    window.open(destination, "_blank");
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
  container.appendChild(dismissBtn);

  tryInsertNearRepoHeader(container);
}

/**
 * Inserts the repository companion near the GitHub repository header / action buttons area.
 * Targets in priority order:
 *  1. Inside #repository-details-container before ul.pagehead-actions
 *  2. Inside ul.pagehead-actions parent
 *  3. Adjacent to repo title / badge in #repository-container-header
 *  4. Top-right header area fallback while DOM elements mount (never in bottom-right corner)
 */
function tryInsertNearRepoHeader(container) {
  if (_headerObserver) {
    _headerObserver.disconnect();
    _headerObserver = null;
  }

  function attemptPlacement() {
    if (container.parentNode && container.classList.contains("gtm-in-header")) {
      return true;
    }

    // 1. Target: Inside #repository-details-container before pagehead-actions
    const detailsContainer = document.getElementById("repository-details-container");
    if (detailsContainer) {
      detailsContainer.style.display = "flex";
      detailsContainer.style.alignItems = "center";
      detailsContainer.style.justifyContent = "flex-end";
      detailsContainer.style.gap = "8px";

      const actions = detailsContainer.querySelector("ul.pagehead-actions, .pagehead-actions");
      if (actions) {
        detailsContainer.insertBefore(container, actions);
      } else {
        detailsContainer.insertBefore(container, detailsContainer.firstChild);
      }
      container.className = "gtm-companion-wrap gtm-in-header";
      return true;
    }

    // 2. Target: Directly before ul.pagehead-actions in parent
    const pageheadActions = document.querySelector("ul.pagehead-actions, .pagehead-actions");
    if (pageheadActions && pageheadActions.parentNode) {
      pageheadActions.parentNode.insertBefore(container, pageheadActions);
      container.className = "gtm-companion-wrap gtm-in-header";
      return true;
    }

    // 3. Target: Adjacent to repo title / badge in #repository-container-header
    const repoHeader = document.getElementById("repository-container-header");
    if (repoHeader) {
      const titleArea = repoHeader.querySelector(".wb-break-word, strong[itemprop='name']");
      if (titleArea && titleArea.parentNode) {
        titleArea.parentNode.appendChild(container);
        container.className = "gtm-companion-wrap gtm-in-header";
        return true;
      }
      const flexRow = repoHeader.querySelector(".d-flex") || repoHeader;
      flexRow.appendChild(container);
      container.className = "gtm-companion-wrap gtm-in-header";
      return true;
    }

    return false;
  }

  if (attemptPlacement()) {
    return true;
  }

  // Fallback while header DOM elements are mounting:
  // Anchor at the top-right header region (NEVER in bottom-right corner)
  container.className = "gtm-companion-wrap gtm-anchored-header";
  if (!container.parentNode) {
    document.body.appendChild(container);
  }

  // Observe DOM for header appearance without polling
  _headerObserver = new MutationObserver(() => {
    if (attemptPlacement()) {
      if (_headerObserver) {
        _headerObserver.disconnect();
        _headerObserver = null;
      }
    }
  });

  _headerObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return false;
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
    // If still in the same repository and icon is already attached in header, leave it in place
    if (_activeRepo && _activeRepo.owner === repoInfo.owner && _activeRepo.repo === repoInfo.repo) {
      const existing = document.getElementById(REPO_CONTAINER_ID);
      if (existing && existing.classList.contains("gtm-in-header")) {
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

// Watch for Turbo render events across repository subpages (/issues, /pulls, /commits)
document.addEventListener("turbo:render", () => {
  const repoInfo = window.__gtmDetect ? window.__gtmDetect.detectGitHubRepo() : null;
  if (repoInfo) {
    const existing = document.getElementById(REPO_CONTAINER_ID);
    if (!existing || !existing.classList.contains("gtm-in-header")) {
      handlePage();
    }
  }
});

// Clean up if the content script is somehow unloaded (e.g. extension reload)
window.addEventListener("unload", () => {
  cleanupNav();
  if (_headerObserver) {
    _headerObserver.disconnect();
    _headerObserver = null;
  }
});

