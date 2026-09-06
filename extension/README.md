# GitHub Time Machine — Browser Extension

A Chrome/Edge extension (Manifest V3) that detects the GitHub profile you're viewing and lets you launch a cinematic replay of that developer's contribution history with one click.

## How it works

```
GitHub Profile Page
      ↓
Extension content script detects @username
      ↓
"⏪ Replay this GitHub" button appears near contribution graph
      ↓
Click → opens  /replay/{username}  in the existing Time Machine app
      ↓
Existing TimelineReplay engine renders the cinematic documentary
```

The extension **does not** contain a replay engine. It is a thin launcher that integrates GitHub with the existing GitHub Time Machine web application.

---

## Installation (development)

### 1. Start the web app

```bash
# From the project root
npm run dev
```

The app runs at `http://localhost:3000`.

### 2. Load the extension in Chrome / Edge

1. Go to `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the `extension/` directory in this project

The extension is now active.

### 3. Try it

#### Profile pages
1. Visit any GitHub profile: `github.com/torvalds`
2. The **⏪ Replay this GitHub** button appears near the contribution graph
3. Click it — the replay opens at `http://localhost:3000/replay/torvalds`

#### Repository pages
1. Visit any public GitHub repository: `github.com/facebook/react`
2. A sleek, translucent Time Machine companion icon appears in the bottom-right corner
3. Hover to reveal the tooltip: **"Replay this repository"**
4. Click it — the repository documentary opens at `http://localhost:3000/repo/facebook/react/documentary`
5. Click **✕** to dismiss the recommendation. Cooldown logic in `chrome.storage.local` ensures the icon only appears occasionally (e.g. once every few hours) and respects dismissals.

---

## Extension popup

Click the extension icon in the Chrome toolbar to open the popup.

- **Profile detected**: shows the GitHub avatar + username, with a **▶ Replay History** button
- **No profile**: shows a prompt to visit a GitHub profile
- **⚙ Settings**: configure the Time Machine base URL (for custom deployments)

---

## Configuring the base URL

By default the extension points to the **production deployment**:

```
https://github-time-machine.vercel.app
```

To use a local dev server during development:

1. Click the extension icon
2. Click **⚙ Settings**
3. Enter `http://localhost:3000`
4. Click **Save**

The override is stored in `chrome.storage.local` (device-local, not synced across browser profiles). Clearing the field and saving resets back to the production URL.

To change the production URL permanently, update `PRODUCTION_URL` in both:
- `extension/popup.js`
- `extension/content.js`


---

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | MV3 manifest — minimal permissions (`storage` + `github.com`) |
| `background.js` | Service worker — caches per-tab usernames |
| `content.js` | Content script — injects the CTA button on profile pages |
| `utils/github-detect.js` | Username detection + SPA navigation listener |
| `popup.html/css/js` | Extension popup UI |
| `icons/` | Extension icons (16, 32, 48, 128px) |
| `generate-icons.js` | Run `node generate-icons.js` to regenerate icons |

---

## Regenerating icons

```bash
cd extension
node generate-icons.js
```

For full-quality icons, install `canvas` first:

```bash
npm install canvas
node generate-icons.js
```

---

## Permissions

| Permission | Why |
|-----------|-----|
| `storage` | Persist the configured Time Machine base URL |
| `host_permissions: github.com` | Run content script on GitHub profile pages |

No browsing history, no tab access, no cookies.
