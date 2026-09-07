/**
 * popup.js — GitHub Time Machine extension popup
 *
 * Detects whether the active tab is a supported GitHub profile or repository,
 * renders the appropriate state, and connects action buttons to existing documentary URLs.
 */

// ─── Constants ────────────────────────────────────────────────────────────

/** Production deployment URL — the single place to update when the domain changes. */
const PRODUCTION_URL = "https://github-time-machine-sage.vercel.app";

// Dev override is stored in chrome.storage.local (device-local, not synced
// across profiles) so it never leaks into production accidentally.

// ─── Utilities ────────────────────────────────────────────────────────────

/**
 * Strictly validates and normalizes a candidate base URL.
 * Only permits:
 * 1. Empty/null -> reverts to default PRODUCTION_URL
 * 2. Local development: http://localhost:3000 or http://127.0.0.1:3000
 * 3. Production HTTPS origin: https://github-time-machine-sage.vercel.app or authorized *.vercel.app
 */
function validateBaseUrl(urlInput) {
  const trimmed = (urlInput || "").trim().replace(/\/$/, "");
  if (!trimmed) {
    return { valid: true, normalized: PRODUCTION_URL };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: "Invalid URL format. Must include protocol (e.g. https://)." };
  }

  // Reject credentials in URL: user:pass@host
  if (parsed.username || parsed.password) {
    return { valid: false, error: "URLs containing user credentials are not allowed." };
  }

  // Reject query strings or hash fragments
  if (parsed.search || parsed.hash) {
    return { valid: false, error: "Base URL cannot include query parameters or fragments." };
  }

  const protocol = parsed.protocol.toLowerCase();
  const hostname = parsed.hostname.toLowerCase();
  const port = parsed.port;

  // Local development origin check
  const isLocalDev =
    (hostname === "localhost" || hostname === "127.0.0.1") &&
    (port === "3000" || port === "") &&
    protocol === "http:";

  // Production origin check (HTTPS required)
  const isProdOrigin =
    protocol === "https:" &&
    (hostname === "github-time-machine-sage.vercel.app" ||
      hostname === "github-time-machine.vercel.app");

  if (!isLocalDev && !isProdOrigin) {
    return {
      valid: false,
      error: "Only https://github-time-machine-sage.vercel.app or http://localhost:3000 are permitted.",
    };
  }

  return { valid: true, normalized: `${parsed.protocol}//${parsed.host}` };
}

async function getBaseUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["gtmBaseUrl"], (result) => {
      const stored = result.gtmBaseUrl;
      const validation = validateBaseUrl(stored);
      resolve(validation.valid ? validation.normalized : PRODUCTION_URL);
    });
  });
}

async function setBaseUrl(url) {
  return new Promise((resolve, reject) => {
    const validation = validateBaseUrl(url);
    if (!validation.valid) {
      return reject(new Error(validation.error || "Invalid URL"));
    }

    if (!url || validation.normalized === PRODUCTION_URL) {
      // Clear the override — fall back to production
      chrome.storage.local.remove("gtmBaseUrl", resolve);
    } else {
      chrome.storage.local.set({ gtmBaseUrl: validation.normalized }, resolve);
    }
  });
}

function replayUrl(baseUrl, username) {
  return `${baseUrl}/replay/${encodeURIComponent(username)}`;
}

function repoDocumentaryUrl(baseUrl, owner, repo) {
  return `${baseUrl}/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/documentary`;
}

// ─── State management ────────────────────────────────────────────────────

function showState(id) {
  ["state-profile", "state-empty", "state-loading"].forEach((s) => {
    const el = document.getElementById(s);
    if (el) el.classList.add("hidden");
  });
  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
}

function renderReady(target, profilePreview) {
  showState("state-profile");

  const nameEl = document.getElementById("profile-name");
  const usernameEl = document.getElementById("profile-username");
  const avatarEl = document.getElementById("profile-avatar");
  const repoIconEl = document.getElementById("entity-repo-icon");
  const userIconEl = document.getElementById("entity-user-icon");

  if (target.type === "profile") {
    nameEl.textContent = profilePreview?.name || target.username;
    usernameEl.textContent = `@${target.username}`;

    if (profilePreview?.avatar_url) {
      avatarEl.src = profilePreview.avatar_url;
      avatarEl.alt = `${target.username}'s avatar`;
      avatarEl.classList.remove("hidden");
      if (userIconEl) userIconEl.classList.add("hidden");
      if (repoIconEl) repoIconEl.classList.add("hidden");
    } else {
      avatarEl.classList.add("hidden");
      if (userIconEl) userIconEl.classList.remove("hidden");
      if (repoIconEl) repoIconEl.classList.add("hidden");
    }
  } else if (target.type === "repo") {
    nameEl.textContent = `${target.owner}/${target.repo}`;
    usernameEl.textContent = "GitHub Repository";

    avatarEl.classList.add("hidden");
    if (userIconEl) userIconEl.classList.add("hidden");
    if (repoIconEl) repoIconEl.classList.remove("hidden");
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

// ─── Target detection (Profile or Repository) ────────────────────────────

const NON_PROFILE_SEGMENTS = new Set([
  "settings", "marketplace", "explore", "notifications", "issues", "pulls",
  "trending", "features", "pricing", "about", "login", "join", "orgs", "apps",
  "users", "search", "codespaces", "discussions", "sponsors", "topics",
  "events", "contact", "security", "new", "organizations", "collections",
  "enterprise", "readme", "github", "repositories", "signup",
]);

const NON_REPO_SEGMENTS = new Set([
  "followers", "following", "repositories", "projects", "packages",
  "stars", "sponsoring", "sponsors", "achievements", "tab",
]);

const GITHUB_USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const GITHUB_REPO_RE = /^[a-zA-Z0-9._-]{1,100}$/;

function extractUsernameFromUrl(urlStr) {
  if (typeof window !== "undefined" && window.__gtmDetect?.extractUsername) {
    return window.__gtmDetect.extractUsername(urlStr);
  }
  if (!urlStr || !urlStr.includes("github.com")) return null;
  let url;
  try { url = new URL(urlStr); } catch { return null; }
  if (url.hostname !== "github.com") return null;

  const parts = url.pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length !== 1) return null;

  const seg = parts[0];
  if (NON_PROFILE_SEGMENTS.has(seg.toLowerCase())) return null;
  if (!GITHUB_USERNAME_RE.test(seg)) return null;

  return seg;
}

function extractRepoFromUrl(urlStr) {
  if (typeof window !== "undefined" && window.__gtmDetect?.extractRepo) {
    return window.__gtmDetect.extractRepo(urlStr);
  }
  if (!urlStr || !urlStr.includes("github.com")) return null;
  let url;
  try { url = new URL(urlStr); } catch { return null; }
  if (url.hostname !== "github.com") return null;

  const parts = url.pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const owner = parts[0];
  let repo = parts[1];
  if (repo.endsWith(".git")) repo = repo.slice(0, -4);

  if (NON_PROFILE_SEGMENTS.has(owner.toLowerCase())) return null;
  if (NON_REPO_SEGMENTS.has(repo.toLowerCase())) return null;

  if (!GITHUB_USERNAME_RE.test(owner)) return null;
  if (!GITHUB_REPO_RE.test(repo)) return null;
  if (repo === "." || repo === "..") return null;

  return { owner, repo };
}

/**
 * Detects whether the active tab is a supported GitHub repository or profile.
 * Returns { type: 'profile', username } or { type: 'repo', owner, repo } or null.
 */
async function detectTargetOnActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id || !tab?.url) return resolve(null);

      // Check repository (handles repo root and subpages like /issues, /commits, etc.)
      const repo = extractRepoFromUrl(tab.url);
      if (repo) {
        return resolve({ type: "repo", owner: repo.owner, repo: repo.repo });
      }

      // Check profile page
      const username = extractUsernameFromUrl(tab.url);
      if (username) {
        chrome.tabs.sendMessage(tab.id, { type: "GET_USERNAME" }, (csResponse) => {
          if (chrome.runtime.lastError || !csResponse?.username) {
            return resolve({ type: "profile", username });
          }
          resolve({ type: "profile", username: csResponse.username });
        });
        return;
      }

      resolve(null);
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

  if (!toggle || !panel || !input || !saveBtn || !cancelBtn) return;

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
    const existingError = panel.querySelector(".settings-error");
    if (existingError) existingError.remove();
    const existingConfirm = panel.querySelector(".save-confirmation");
    if (existingConfirm) existingConfirm.remove();

    const validation = validateBaseUrl(input.value);
    if (!validation.valid) {
      const errEl = document.createElement("div");
      errEl.className = "settings-error";
      errEl.style.color = "#f87171";
      errEl.style.fontSize = "11px";
      errEl.style.marginTop = "6px";
      errEl.style.lineHeight = "1.3";
      errEl.textContent = validation.error || "Invalid URL";
      input.insertAdjacentElement("afterend", errEl);
      return;
    }

    try {
      await setBaseUrl(validation.normalized);
      input.value = validation.normalized;
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
    } catch (err) {
      const errEl = document.createElement("div");
      errEl.className = "settings-error";
      errEl.style.color = "#f87171";
      errEl.style.fontSize = "11px";
      errEl.style.marginTop = "6px";
      errEl.textContent = err.message || "Failed to save";
      input.insertAdjacentElement("afterend", errEl);
    }
  });

  cancelBtn.addEventListener("click", () => {
    const existingError = panel.querySelector(".settings-error");
    if (existingError) existingError.remove();
    panel.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveBtn.click();
    if (e.key === "Escape") cancelBtn.click();
  });
}

// ─── Action buttons ───────────────────────────────────────────────────────

function wireActions(target) {
  const baseUrlPromise = getBaseUrl();

  const replayBtn = document.getElementById("btn-replay");
  if (replayBtn) {
    replayBtn.addEventListener("click", async () => {
      const base = await baseUrlPromise;
      let url = base;
      if (target.type === "profile") {
        url = replayUrl(base, target.username);
      } else if (target.type === "repo") {
        url = repoDocumentaryUrl(base, target.owner, target.repo);
      }
      chrome.tabs.create({ url });
      window.close();
    });
  }

  const openAppBtn = document.getElementById("btn-open-app");
  if (openAppBtn) {
    openAppBtn.addEventListener("click", async () => {
      const base = await baseUrlPromise;
      chrome.tabs.create({ url: base });
      window.close();
    });
  }
}

function wireEmptyButtons() {
  const emptyBtn = document.getElementById("btn-open-app-empty");
  if (emptyBtn) {
    emptyBtn.addEventListener("click", async () => {
      const base = await getBaseUrl();
      chrome.tabs.create({ url: base });
      window.close();
    });
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────

async function init() {
  showState("state-loading");
  initSettings();
  wireEmptyButtons();

  const target = await detectTargetOnActiveTab();

  if (!target) {
    renderEmpty();
    return;
  }

  let profilePreview = null;
  if (target.type === "profile") {
    profilePreview = await fetchGitHubProfilePreview(target.username);
  }

  renderReady(target, profilePreview);
  wireActions(target);
}

document.addEventListener("DOMContentLoaded", init);
