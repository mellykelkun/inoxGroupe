export const ADMIN_EMAIL_DOMAIN = "inox-group.net";
export const ADMIN_EMAIL_EXAMPLE = `KevinA@${ADMIN_EMAIL_DOMAIN}`;

const adminEmailLocalPart = "[A-Za-z0-9](?:[A-Za-z0-9._-]{0,62}[A-Za-z0-9])?";

export const ADMIN_EMAIL_INPUT_PATTERN = `${adminEmailLocalPart}@inox-group\\.net`;

const adminEmailPattern = new RegExp(`^${ADMIN_EMAIL_INPUT_PATTERN}$`, "i");

export function normalizeAdminEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isAdminEmail(value: unknown) {
  const email = normalizeAdminEmail(value);
  const [localPart, domain, ...extraParts] = email.split("@");

  return extraParts.length === 0 &&
    domain === ADMIN_EMAIL_DOMAIN &&
    localPart.length >= 1 &&
    localPart.length <= 64 &&
    !localPart.includes("..") &&
    adminEmailPattern.test(email);
}
