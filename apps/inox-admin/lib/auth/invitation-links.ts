type AdminOriginOptions = {
  requestOrigin: string;
  configuredOrigin?: string;
  vercelProductionUrl?: string;
  vercelDeploymentUrl?: string;
  production?: boolean;
};

function withProtocol(value: string | undefined) {
  const cleanValue = value?.trim();
  if (!cleanValue) return undefined;
  return /^https?:\/\//i.test(cleanValue) ? cleanValue : `https://${cleanValue}`;
}

function normalizedOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string) {
  const hostname = new URL(origin).hostname.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function resolveAdminOrigin({
  requestOrigin,
  configuredOrigin,
  vercelProductionUrl,
  vercelDeploymentUrl,
  production = false,
}: AdminOriginOptions) {
  const configured = normalizedOrigin(withProtocol(configuredOrigin));
  const vercelProduction = normalizedOrigin(withProtocol(vercelProductionUrl));
  const request = normalizedOrigin(requestOrigin);
  const vercelDeployment = normalizedOrigin(withProtocol(vercelDeploymentUrl));
  const candidates = [configured, vercelProduction, request, vercelDeployment].filter(
    (candidate): candidate is string => Boolean(candidate),
  );

  for (const candidate of candidates) {
    const local = isLocalOrigin(candidate);
    if (candidate.startsWith("http:") && !local) continue;
    if (production && local) continue;
    return candidate;
  }

  throw new Error("ADMIN_PUBLIC_ORIGIN_MISSING");
}

export function buildAdminInvitationUrl(origin: string, hashedToken: string) {
  if (!hashedToken || hashedToken.length > 4096) {
    throw new Error("ADMIN_INVITATION_TOKEN_INVALID");
  }

  const invitationUrl = new URL("/auth/callback", origin);
  invitationUrl.searchParams.set("token_hash", hashedToken);
  invitationUrl.searchParams.set("type", "invite");
  return invitationUrl.toString();
}
