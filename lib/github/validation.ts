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
