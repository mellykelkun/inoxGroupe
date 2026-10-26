import assert from "node:assert/strict";
import test from "node:test";
import { linkedParts, pageCatalog, sanitizePageLinks, verifiedPage } from "./assistant-links.ts";

test("les pages publiques des deux sites restent cliquables", () => {
  const answer = sanitizePageLinks("Explorer https://inox-expertises.vercel.app/expertises/reseaux-securite.");
  const link = linkedParts(answer).find((part) => part.href);
  assert.equal(link?.href, "https://inox-expertises.vercel.app/expertises/reseaux-securite");
  assert.equal(link?.text, "Réseaux & Sécurité");
});

test("un lien admin ne peut pas être transmis dans le chat public", () => {
  assert.equal(verifiedPage("https://inox-admin.vercel.app/#contacts"), null);
  assert.doesNotMatch(sanitizePageLinks("https://inox-admin.vercel.app/#contacts"), /inox-admin/);
  assert.ok(verifiedPage("https://inox-admin.vercel.app/#contacts", true));
});

test("un domaine ressemblant, une page absente et un schéma dangereux sont refusés", () => {
  const answer = sanitizePageLinks("[Aide](https://inox-groupe.vercel.app.evil.test/forum) https://inox-groupe.vercel.app/page-inexistante [ouvrir](javascript:alert)");
  assert.doesNotMatch(answer, /evil|page-inexistante|https:\/\//);
  assert.doesNotMatch(answer, /javascript:/);
  assert.equal(verifiedPage("javascript:alert(1)", true), null);
  assert.equal(verifiedPage("https://inox-groupe.vercel.app@evil.test/forum", true), null);
});

test("les courriels de contact et les liens Markdown autorisés sont conservés", () => {
  const answer = sanitizePageLinks("Écrivez à contact@inox-group.net ou [ouvrez le forum](https://inox-groupe.vercel.app/forum).");
  assert.match(answer, /contact@inox-group\.net/);
  assert.match(answer, /https:\/\/inox-groupe\.vercel\.app\/forum/);
});

test("le catalogue ne propose pas de route admin aux visiteurs", () => {
  assert.doesNotMatch(pageCatalog(), /inox-admin/);
  assert.match(pageCatalog(true), /inox-admin/);
});
