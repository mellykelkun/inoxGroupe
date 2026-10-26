import assert from "node:assert/strict";
import test from "node:test";
import { groundedPublicAnswer } from "./answer-policy.ts";

test("une intervention à domicile non vérifiée est écartée", () => {
  const answer = groundedPublicAnswer("Nous proposons un diagnostic à domicile.", "Pouvez-vous m'aider ?", "expertise");
  assert.doesNotMatch(answer, /diagnostic à domicile/);
  assert.match(answer, /Je peux vous aider à préciser/);
});

test("un formulaire imaginaire sur une page expertise est écarté", () => {
  const answer = groundedPublicAnswer("Remplissez le formulaire sur la page Formation.", "Comment vous contacter ?", "expertise");
  assert.doesNotMatch(answer, /formulaire sur la page/);
});

test("une réponse sur une expertise vérifiée est conservée", () => {
  const text = "La page Réseaux & Sécurité détaille cette expertise.";
  assert.equal(groundedPublicAnswer(text, "Où est la page ?", "expertise"), text);
});
