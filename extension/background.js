/**
 * background.js — GitHub Time Machine service worker (MV3)
 *
 * Responsibilities:
 * - Relay username detection messages from content script to popup
 * - Store per-tab detected username in session storage
 * - Keep the service worker alive long enough for message passing
 */

// Map of tabId → detected username
const tabUsernames = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  if (message.type === "USERNAME_DETECTED") {
    if (tabId !== undefined) {
      tabUsernames.set(tabId, message.username);
    }
    // Acknowledge
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "NO_PROFILE") {
    if (tabId !== undefined) {
      tabUsernames.delete(tabId);
    }
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "GET_USERNAME") {
    // Popup asking for the username on a given tab
    const requestedTabId = message.tabId;
    const username = tabUsernames.get(requestedTabId) ?? null;
    sendResponse({ username });
    return false;
  }
});

// Clean up when a tab is closed or navigated away
chrome.tabs.onRemoved.addListener((tabId) => {
  tabUsernames.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // When the tab starts loading a new URL, clear the stale username
  if (changeInfo.status === "loading") {
    tabUsernames.delete(tabId);
  }
});
