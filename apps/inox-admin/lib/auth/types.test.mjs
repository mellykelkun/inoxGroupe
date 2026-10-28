import assert from "node:assert/strict";
import test from "node:test";
import { canInviteMembers, canManageEditorial, canModerateForum, canReissueAdminInvitation } from "./types.ts";

test("seuls le propriétaire et l’administrateur peuvent inviter des membres", () => {
  assert.equal(canInviteMembers("owner"), true);
  assert.equal(canInviteMembers("administrator"), true);
  assert.equal(canInviteMembers("moderator"), false);
  assert.equal(canInviteMembers("editor"), false);
  assert.equal(canInviteMembers("viewer"), false);
});

test("les permissions métier restent séparées par rôle", () => {
  assert.equal(canModerateForum("moderator"), true);
  assert.equal(canModerateForum("editor"), false);
  assert.equal(canManageEditorial("editor"), true);
  assert.equal(canManageEditorial("moderator"), false);
  assert.equal(canModerateForum("viewer"), false);
  assert.equal(canManageEditorial("viewer"), false);
});

test("une invitation ne peut être réémise que pour le même rôle sans facteur vérifié", () => {
  assert.equal(canReissueAdminInvitation({ active: true, existingRole: "viewer", requestedRole: "viewer", hasVerifiedFactor: false }), true);
  assert.equal(canReissueAdminInvitation({ active: true, existingRole: "viewer", requestedRole: "editor", hasVerifiedFactor: false }), false);
  assert.equal(canReissueAdminInvitation({ active: true, existingRole: "viewer", requestedRole: "viewer", hasVerifiedFactor: true }), false);
  assert.equal(canReissueAdminInvitation({ active: true, existingRole: "owner", requestedRole: "viewer", hasVerifiedFactor: false }), false);
  assert.equal(canReissueAdminInvitation({ active: false, existingRole: "viewer", requestedRole: "viewer", hasVerifiedFactor: false }), false);
});
