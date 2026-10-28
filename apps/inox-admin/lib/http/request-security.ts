import "server-only";

export function validateMutationRequest(request: Request, maximumBytes = 4_000) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;
  if (origin && origin !== expectedOrigin) return "invalid_origin" as const;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return "invalid_origin" as const;

  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (!Number.isFinite(declaredSize) || declaredSize < 0 || declaredSize > maximumBytes) {
    return "request_too_large" as const;
  }

  return null;
}

type LimitedJsonResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: "request_too_large" | "invalid_json" };

export async function readLimitedJsonObject(
  request: Request,
  maximumBytes = 4_000,
): Promise<LimitedJsonResult> {
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maximumBytes) {
    return { ok: false, error: "request_too_large" as const };
  }

  try {
    const body: unknown = JSON.parse(rawBody);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, error: "invalid_json" as const };
    }
    return { ok: true, value: body as Record<string, unknown> };
  } catch {
    return { ok: false, error: "invalid_json" as const };
  }
}
