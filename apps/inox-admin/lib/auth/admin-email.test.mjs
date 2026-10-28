import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_EMAIL_EXAMPLE,
  ADMIN_EMAIL_INPUT_PATTERN,
  isAdminEmail,
  normalizeAdminEmail,
} from "./admin-email.ts";

test("les comptes administratifs utilisent exclusivement le domaine INOX", () => {
  assert.equal(isAdminEmail("KevinA@inox-group.net"), true);
  assert.equal(isAdminEmail("kevin.a-1_tech@inox-group.net"), true);
  assert.equal(isAdminEmail("k@inox-group.net"), true);
  assert.equal(isAdminEmail("membre@inox.ci"), false);
  assert.equal(isAdminEmail("membre@admin.inox-group.net"), false);
  assert.equal(isAdminEmail("membre@inox-group.net.example.com"), false);
});

test("la partie nominative refuse les formes ambiguës", () => {
  assert.equal(isAdminEmail("kevin..a@inox-group.net"), false);
  assert.equal(isAdminEmail(".kevina@inox-group.net"), false);
  assert.equal(isAdminEmail("kevina.@inox-group.net"), false);
  assert.equal(isAdminEmail("kevin+a@inox-group.net"), false);
  assert.equal(isAdminEmail("kévin@inox-group.net"), false);
  assert.equal(isAdminEmail("kevin a@inox-group.net"), false);
});

test("l’adresse est normalisée avant son stockage", () => {
  assert.equal(normalizeAdminEmail("  KevinA@INOX-GROUP.NET "), "kevina@inox-group.net");
  assert.equal(ADMIN_EMAIL_EXAMPLE, "KevinA@inox-group.net");
  assert.match("KevinA@inox-group.net", new RegExp(`^${ADMIN_EMAIL_INPUT_PATTERN}$`));
});
