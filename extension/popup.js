/**
 * popup.js — GitHub Time Machine extension popup
 *
 * Detects the GitHub username on the active tab, renders the appropriate
 * state (profile found / not found / loading), and wires up action buttons.
 */

// ─── Constants ────────────────────────────────────────────────────────────

/** Production deployment URL — the single place to update when the domain changes. */
const PRODUCTION_URL = "https://github-time-machine-sage.vercel.app";

// Dev override is stored in chrome.storage.local (device-local, not synced
// across profiles) so it never leaks into production accidentally.

// ─── Utilities ────────────────────────────────────────────────────────────

async function getBaseUrl() {
  return new Promise((resolve) => {
    // chrome.storage.local is device-local — the dev override never syncs
    // to other browser profiles or leaks into production.
    chrome.storage.local.get(["gtmBaseUrl"], (result) => {
      resolve(result.gtmBaseUrl || PRODUCTION_URL);
    });
  });
}

async function setBaseUrl(url) {
  return new Promise((resolve) => {
    if (!url || url === PRODUCTION_URL) {
      // Clear the override — fall back to production
      chrome.storage.local.remove("gtmBaseUrl", resolve);
    } else {
      chrome.storage.local.set({ gtmBaseUrl: url }, resolve);
    }
  });
}

function replayUrl(baseUrl, username) {
  return `${baseUrl}/replay/${encodeURIComponent(username)}`;
}

// ─── State management ────────────────────────────────────────────────────

function showState(id) {
  ["state-profile", "state-empty", "state-loading"].forEach((s) => {
    document.getElementById(s).classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

function renderProfile(username, profile) {
  showState("state-profile");

  const nameEl = document.getElementById("profile-name");
  const usernameEl = document.getElementById("profile-username");
  const avatarEl = document.getElementById("profile-avatar");

  nameEl.textContent = profile?.name || username;
  usernameEl.textContent = `@${username}`;

  if (profile?.avatar_url) {
    avatarEl.src = profile.avatar_url;
    avatarEl.alt = `${username}'s avatar`;
  } else {
    // Fallback: GitHub's default avatar URL by username hash is unavailable
    // in an extension context, so use a simple letter avatar approach
    avatarEl.style.display = "none";
  }
}

function renderEmpty() {
  showState("state-empty");
}

// ─── Profile fetching ─────────────────────────────────────────────────────

async function fetchGitHubProfilePreview(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ─── Username detection ──────────────────────────────────────────────────

/**
 * The same blocklist used in github-detect.js — kept in sync manually.
 * The popup cannot import the content script module, so we duplicate the
 * small constant here rather than introducing a build step.
 */
const NON_PROFILE_SEGMENTS = new Set([
  "settings", "marketplace", "explore", "notifications", "issues", "pulls",
  "trending", "features", "pricing", "about", "login", "join", "orgs", "apps",
  "users", "search", "codespaces", "discussions", "sponsors", "topics",
  "events", "contact", "security", "new", "organizations", "collections",
  "enterprise", "readme", "github", "repositories", "signup",
]);

const GITHUB_USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

/**
 * Parse a github.com URL and return the profile username, or null.
 * Mirrors extractUsername() in github-detect.js.
 */
function extractUsernameFromUrl(urlStr) {
  if (!urlStr || !urlStr.includes("github.com")) return null;
  let url;
  try { url = new URL(urlStr); } catch { return null; }
  if (url.hostname !== "github.com") return null;

  const parts = url.pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length !== 1) return null;           // must be exactly /username

  const seg = parts[0];
  if (NON_PROFILE_SEGMENTS.has(seg.toLowerCase())) return null;
  if (!GITHUB_USERNAME_RE.test(seg)) return null;

  return seg;
}

/**
 * Returns { tabId, url, username } for the active tab.
 * Detection order:
 *   1. Parse tab.url directly (always works when tabs permission is granted)
 *   2. Ask the content script (gives us the runtime-confirmed value)
 *   3. Ask the background cache (covers edge cases like popup opened before CS ran)
 */
async function detectUsernameOnActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return resolve(null);

      // ── Layer 1: URL parse (instant, no messaging needed) ──────────────
      const urlUsername = extractUsernameFromUrl(tab.url || "");
      if (!urlUsername) return resolve(null); // definitely not a profile page

      // URL says it's a profile. Now try to confirm with the content script
      // (it may have more context, e.g. if GitHub loaded a different page
      // client-side without changing the URL — extremely rare but handled).
      // ── Layer 2: content script query ──────────────────────────────────
      chrome.tabs.sendMessage(tab.id, { type: "GET_USERNAME" }, (csResponse) => {
        if (chrome.runtime.lastError) {
          // Content script not yet injected (extension just installed, or
          // page loaded before extension was enabled). Fall back to URL value.
          return resolve(urlUsername);
        }
        // Content script responded — use its value if present, otherwise URL
        resolve(csResponse?.username || urlUsername);
      });
    });
  });
}

// ─── Settings panel ───────────────────────────────────────────────────────

function initSettings() {
  const toggle = document.getElementById("btn-settings-toggle");
  const panel = document.getElementById("settings-panel");
  const input = document.getElementById("input-base-url");
  const saveBtn = document.getElementById("btn-settings-save");
  const cancelBtn = document.getElementById("btn-settings-cancel");

  toggle.addEventListener("click", async () => {
    const isOpen = !panel.classList.contains("hidden");
    if (isOpen) {
      panel.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
    } else {
      const saved = await getBaseUrl();
      input.value = saved;
      panel.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
      input.focus();
    }
  });

  saveBtn.addEventListener("click", async () => {
    const val = input.value.trim().replace(/\/$/, ""); // strip trailing slash
    // Empty input → restore production default (clears the local override)
    await setBaseUrl(val || PRODUCTION_URL);
    // Show confirmation
    const actionsEl = saveBtn.closest(".settings-actions");
    const confirm = document.createElement("span");
    confirm.className = "save-confirmation";
    confirm.textContent = "✓ Saved";
    actionsEl.appendChild(confirm);
    setTimeout(() => {
      confirm.remove();
      panel.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
    }, 1200);
  });

  cancelBtn.addEventListener("click", () => {
    panel.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
  });

  // Allow Enter to save
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveBtn.click();
    if (e.key === "Escape") cancelBtn.click();
  });
}

// ─── Action buttons ───────────────────────────────────────────────────────

function wireButtons(username) {
  const baseUrlPromise = getBaseUrl();

  document.getElementById("btn-replay").addEventListener("click", async () => {
    const base = await baseUrlPromise;
    chrome.tabs.create({ url: replayUrl(base, username) });
    window.close();
  });

  document.getElementById("btn-new-tab").addEventListener("click", async () => {
    const base = await baseUrlPromise;
    chrome.tabs.create({ url: replayUrl(base, username) });
    window.close();
  });

  document.getElementById("btn-open-app").addEventListener("click", async () => {
    const base = await baseUrlPromise;
    chrome.tabs.create({ url: base });
    window.close();
  });
}

function wireEmptyButtons() {
  document.getElementById("btn-open-app-empty").addEventListener("click", async () => {
    const base = await getBaseUrl();
    chrome.tabs.create({ url: base });
    window.close();
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────

async function init() {
  showState("state-loading");
  initSettings();
  wireEmptyButtons();

  const username = await detectUsernameOnActiveTab();

  if (!username) {
    renderEmpty();
    return;
  }

  // Fetch a lightweight profile preview (avatar + name)
  // so the popup renders something useful before the replay loads
  const profile = await fetchGitHubProfilePreview(username);
  renderProfile(username, profile);
  wireButtons(username);
}

document.addEventListener("DOMContentLoaded", init);
