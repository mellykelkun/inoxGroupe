import assert from "node:assert/strict";
import test from "node:test";
import { isAdminWriteRequest, parseContactDeleteCommand, parseContactStatusCommand } from "./commands.ts";

test("prépare le bon statut pour une référence INOX", () => {
  assert.deepEqual(parseContactStatusCommand("Passe la demande INOX-000003 en cours"), { id: 3, status: "in_progress" });
  assert.deepEqual(parseContactStatusCommand("Classe la demande INOX-000004 archivée"), { id: 4, status: "archived" });
});

test("refuse une action sans cible ou statut clair", () => {
  assert.equal(parseContactStatusCommand("Passe la demande en cours"), null);
  assert.equal(parseContactStatusCommand("Rapport sur la demande INOX-000003"), null);
});

test("distingue les demandes d'action des questions explicatives", () => {
  assert.equal(isAdminWriteRequest("Ajoute un membre à l'équipe"), true);
  assert.equal(isAdminWriteRequest("Peux-tu supprimer la demande INOX-000010 ?"), true);
  assert.equal(isAdminWriteRequest("Comment ajouter un membre ?"), false);
});

test("une suppression exige chaque référence exacte", () => {
  assert.deepEqual(parseContactDeleteCommand("Supprime les demandes INOX-000003 et INOX-000004"), { ids: [3, 4] });
  assert.deepEqual(parseContactDeleteCommand("Peux-tu supprimer la demande INOX-000010 ?"), { ids: [10] });
  assert.equal(parseContactDeleteCommand("Supprime les demandes nouvelles"), null);
  assert.equal(parseContactDeleteCommand("Supprime INOX-000003 et 4"), null);
  assert.equal(parseContactDeleteCommand("Supprime INOX-000003 et INOX-000003"), null);
});
