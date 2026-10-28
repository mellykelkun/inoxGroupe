import assert from "node:assert/strict";
import test from "node:test";
import { buildAdminInvitationUrl, resolveAdminOrigin } from "./invitation-links.ts";

test("une production ne réutilise jamais une origine localhost configurée", () => {
  assert.equal(
    resolveAdminOrigin({
      requestOrigin: "https://inox-admin.vercel.app",
      configuredOrigin: "http://localhost:3002",
      production: true,
    }),
    "https://inox-admin.vercel.app",
  );
});

test("le domaine de production Vercel est prioritaire sur une URL de déploiement", () => {
  assert.equal(
    resolveAdminOrigin({
      requestOrigin: "https://preview-inox-admin.vercel.app",
      vercelProductionUrl: "inox-admin.vercel.app",
      vercelDeploymentUrl: "preview-inox-admin.vercel.app",
      production: true,
    }),
    "https://inox-admin.vercel.app",
  );
});

test("le lien scanné passe par le callback admin et transporte uniquement le jeton d'invitation", () => {
  const invitation = new URL(buildAdminInvitationUrl("https://inox-admin.vercel.app", "jeton-hache"));
  assert.equal(invitation.origin, "https://inox-admin.vercel.app");
  assert.equal(invitation.pathname, "/auth/callback");
  assert.equal(invitation.searchParams.get("token_hash"), "jeton-hache");
  assert.equal(invitation.searchParams.get("type"), "invite");
  assert.doesNotMatch(invitation.toString(), /localhost|redirect_to|secret/i);
});

test("une origine locale est refusée en production", () => {
  assert.throws(
    () => resolveAdminOrigin({ requestOrigin: "http://localhost:3002", production: true }),
    /ADMIN_PUBLIC_ORIGIN_MISSING/,
  );
});
