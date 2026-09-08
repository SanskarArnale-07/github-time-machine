/**
 * Strict GitHub Identifier Validators
 * 
 * Prevents path traversal, URL injection, parameter tampering,
 * and malicious input vectors in public documentary routes.
 */

// GitHub usernames: 1-39 characters, alphanumeric and single hyphens, no leading/trailing hyphen.
const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

// GitHub repository names: 1-100 characters, alphanumeric, hyphen, underscore, and period.
// Cannot be "." or "..", and cannot contain path separators or traversal sequences.
const GITHUB_REPO_REGEX = /^[a-zA-Z0-9_.-]{1,100}$/;

/**
 * Validates whether a string is a legitimate GitHub username or organization name.
 */
export function isValidGitHubUsername(username: unknown): username is string {
  if (typeof username !== "string") return false;
  const trimmed = username.trim();
  if (!trimmed || trimmed.length > 39) return false;

  // Strict structural check
  if (!GITHUB_USERNAME_REGEX.test(trimmed)) return false;

  // Extra guard against encoded path traversal or forbidden tokens
  if (
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("..") ||
    trimmed.includes("%") ||
    trimmed === "."
  ) {
    return false;
  }

  return true;
}

/**
 * Validates whether a string is a legitimate GitHub repository name.
 */
export function isValidGitHubRepo(repo: unknown): repo is string {
  if (typeof repo !== "string") return false;
  const trimmed = repo.trim();
  if (!trimmed || trimmed.length > 100) return false;

  // Cannot be single or double dots
  if (trimmed === "." || trimmed === "..") return false;

  // GitHub repos cannot end with .git
  if (trimmed.toLowerCase().endsWith(".git")) return false;

  // Cannot start with a dot or hyphen
  if (trimmed.startsWith(".") || trimmed.startsWith("-")) return false;

  // Strict structural check
  if (!GITHUB_REPO_REGEX.test(trimmed)) return false;

  // Extra guard against directory traversal or injection
  if (
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("..") ||
    trimmed.includes("%")
  ) {
    return false;
  }

  return true;
}

/**
 * Validates both owner and repository name together.
 */
export function isValidGitHubOwnerRepo(owner: unknown, repo: unknown): boolean {
  return isValidGitHubUsername(owner) && isValidGitHubRepo(repo);
}

/**
 * Validates and sanitizes a returnTo destination.
 * Only allows:
 * 1. HTTPS URLs whose hostname is exactly github.com or www.github.com
 * 2. Safe internal paths starting with "/"
 * 
 * Explicitly rejects:
 * - http://
 * - javascript:
 * - data:
 * - //example.com
 * - arbitrary external domains
 * - malformed URLs
 * 
 * Returns the validated URL/path or defaultUrl (default: "/").
 */
export function getSafeReturnUrl(returnTo: unknown, defaultUrl: string = "/"): string {
  if (typeof returnTo !== "string") {
    return defaultUrl;
  }

  const trimmed = returnTo.trim();
  if (!trimmed) {
    return defaultUrl;
  }

  // Reject CR/LF or control characters
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
    return defaultUrl;
  }

  // Reject dangerous schemes anywhere in the string
  if (/(?:javascript|data|vbscript):/i.test(trimmed)) {
    return defaultUrl;
  }

  // Reject explicit http:// external URLs
  if (/^http:\/\//i.test(trimmed)) {
    return defaultUrl;
  }

  // Case 1: Internal path (starts with single "/")
  if (trimmed.startsWith("/")) {
    // Reject protocol-relative URLs (e.g. "//evil.com") or backslash variations ("/\" or "\\")
    if (trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.startsWith("\\")) {
      return defaultUrl;
    }

    // Verify decoded URL does not smuggle protocol-relative or dangerous schemes
    try {
      const decoded = decodeURIComponent(trimmed);
      if (decoded.startsWith("//") || decoded.startsWith("/\\") || decoded.startsWith("\\")) {
        return defaultUrl;
      }
      if (/(?:javascript|data|vbscript):/i.test(decoded)) {
        return defaultUrl;
      }
    } catch {
      return defaultUrl;
    }

    try {
      const parsed = new URL(trimmed, "http://localhost");
      if (parsed.origin !== "http://localhost") {
        return defaultUrl;
      }
      if (!parsed.pathname.startsWith("/") || parsed.pathname.startsWith("//")) {
        return defaultUrl;
      }
      if (parsed.protocol !== "http:") {
        return defaultUrl;
      }
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return defaultUrl;
    }
  }

  // Case 2: HTTPS URLs whose hostname is exactly github.com or www.github.com
  // Also supports scheme-less "github.com/..." and "www.github.com/..."
  let candidate = trimmed;
  if (/^(?:www\.)?github\.com(?:[/?#]|$)/i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);

    // Strictly HTTPS protocol
    if (parsed.protocol !== "https:") {
      return defaultUrl;
    }

    // Hostname must strictly be github.com or www.github.com
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "github.com" && hostname !== "www.github.com") {
      return defaultUrl;
    }

    // Reject user credentials in URL (e.g. https://user:pass@github.com)
    if (parsed.username || parsed.password) {
      return defaultUrl;
    }

    // Return the clean normalized GitHub URL
    return parsed.href;
  } catch {
    return defaultUrl;
  }
}
