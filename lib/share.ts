/**
 * Public Documentary Sharing Utility
 * 
 * Supports Web Share API (native mobile/desktop share sheet) with
 * graceful clipboard copy fallback and accessible feedback.
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface ShareResult {
  success: boolean;
  method: "native" | "clipboard" | "dismissed" | "failed";
  url: string;
}

/**
 * Copies plain text to the clipboard with modern and legacy fallbacks.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Modern Async Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or non-secure context; fall back to execCommand below
    }
  }

  // Legacy execCommand fallback for unrestricted browser environments
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Shares a public documentary using the native Web Share API where supported,
 * falling back seamlessly to copying the clean public URL to the clipboard.
 */
export async function shareDocumentary(data: ShareData): Promise<ShareResult> {
  // 1. Try Web Share API (native share sheet on iOS, Android, and supported desktop browsers)
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      if (typeof navigator.canShare === "function" && !navigator.canShare(data)) {
        // Payload not shareable natively, drop down to clipboard copy
      } else {
        await navigator.share(data);
        return { success: true, method: "native", url: data.url };
      }
    } catch (error: unknown) {
      // If the user cancelled or dismissed the share sheet, do not flash "Copied!" or report failure
      if (error instanceof Error && error.name === "AbortError") {
        return { success: false, method: "dismissed", url: data.url };
      }
      // Technical failure with share sheet: fall through to clipboard copy
    }
  }

  // 2. Fallback: Copy clean URL to clipboard
  const copied = await copyTextToClipboard(data.url);
  if (copied) {
    return { success: true, method: "clipboard", url: data.url };
  }

  return { success: false, method: "failed", url: data.url };
}

/**
 * Generates the clean public profile share payload.
 */
export function getProfileShareData(username: string, displayName?: string | null): ShareData {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://github-time-machine.vercel.app";
  const name = displayName?.trim() || username;
  const possessive = username.endsWith("s") || username.endsWith("S") ? `${username}'` : `${username}'s`;
  return {
    title: `${name} — GitHub Time Machine`,
    text: `A cinematic replay of ${possessive} public GitHub journey.`,
    url: `${origin}/replay/${encodeURIComponent(username)}`,
  };
}

/**
 * Generates the clean public repository share payload.
 */
export function getRepoShareData(owner: string, repo: string): ShareData {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://github-time-machine.vercel.app";
  return {
    title: `${owner}/${repo} — GitHub Time Machine`,
    text: `A cinematic replay of the public development history of ${owner}/${repo}.`,
    url: `${origin}/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/documentary`,
  };
}
