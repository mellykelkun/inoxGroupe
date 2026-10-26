import assert from "node:assert/strict";
import test from "node:test";
import { groundedPublicAnswer } from "./answer-policy.js";

test("une question sur un diagnostic ne reçoit pas de promesse non vérifiée", () => {
  const answer = groundedPublicAnswer("Un technicien viendra demain à domicile.", "Quel est le prix d'un diagnostic à domicile ?", "primary");
  assert.match(answer, /ne permettent pas de confirmer/);
  assert.doesNotMatch(answer, /technicien viendra|demain/);
});

test("la page fictive Réseaux et cybersécurité est écartée", () => {
  const answer = groundedPublicAnswer("Consultez la page Réseaux et cybersécurité.", "Où trouver les réseaux ?", "primary");
  assert.doesNotMatch(answer, /Consultez la page/);
});

test("une réponse sobre et documentée est conservée", () => {
  const text = "Les réseaux et la cybersécurité figurent parmi les expertises présentées par INOX.";
  assert.equal(groundedPublicAnswer(text, "Quelles sont les expertises ?", "primary"), text);
});
