import assert from "node:assert/strict";
import test from "node:test";
import { intakeDraftFromMessage } from "./assistant-intake.js";

test("la demande entreprise préremplit le besoin sans recopier la commande", () => {
  const draft = intakeDraftFromMessage("Je suis responsable d’une PME et je voudrais confier à INOX la sécurisation de notre réseau. Peux-tu préparer une demande de contact pour mon entreprise, sans rien envoyer pour le moment ?");
  assert.match(draft.summary, /sécurisation de notre réseau/i);
  assert.doesNotMatch(draft.summary, /Peux-tu préparer/i);
  assert.equal(draft.needArea, "Réseaux & cybersécurité");
  assert.equal(draft.desiredTimeline, "");
});

test("un formulaire demandé sans description ne fabrique pas un besoin", () => {
  const draft = intakeDraftFromMessage("Peux-tu ouvrir le formulaire entreprise ?");
  assert.equal(draft.summary, "");
  assert.equal(draft.needArea, "");
  assert.equal(intakeDraftFromMessage("Peux-tu faire une demande pour mon entreprise ?").summary, "");
});

test("un besoin de sauvegarde avec échéance explicite préremplit les choix", () => {
  const draft = intakeDraftFromMessage("Je souhaite remplir le formulaire entreprise pour un besoin de sauvegarde sous 1 mois.");
  assert.equal(draft.needArea, "Datacenter, cloud & productivité");
  assert.equal(draft.desiredTimeline, "1-mois");
  assert.match(draft.summary, /sauvegarde/i);
});

test("le résumé ne reproduit pas les coordonnées fournies dans le chat", () => {
  const draft = intakeDraftFromMessage("Nous cherchons à sécuriser notre réseau. Mon email est test@example.com et mon téléphone +225 01 02 03 04 05.");
  assert.doesNotMatch(draft.summary, /test@example.com|01 02 03/i);
});
