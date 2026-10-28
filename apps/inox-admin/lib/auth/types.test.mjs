import assert from "node:assert/strict";
import test from "node:test";
import { canAccessAdminWorkspace, canInviteMembers, canManageContacts, canManageEditorial, canManageMember, canModerateForum, canReissueAdminInvitation, canUseAdminAssistant, canViewAdminOverview, canViewRoleAccessMatrix } from "./types.ts";

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
  assert.equal(canManageContacts("administrator"), true);
  assert.equal(canManageContacts("moderator"), false);
  assert.equal(canUseAdminAssistant("owner"), true);
  assert.equal(canUseAdminAssistant("editor"), false);
  assert.equal(canViewAdminOverview("administrator"), true);
  assert.equal(canViewAdminOverview("viewer"), false);
  assert.equal(canViewRoleAccessMatrix("owner"), true);
  assert.equal(canViewRoleAccessMatrix("administrator"), false);
});

test("chaque rôle ne reçoit que les espaces autorisés", () => {
  assert.equal(canAccessAdminWorkspace("moderator", "forum"), true);
  assert.equal(canAccessAdminWorkspace("moderator", "journal"), false);
  assert.equal(canAccessAdminWorkspace("editor", "journal"), true);
  assert.equal(canAccessAdminWorkspace("editor", "contacts"), false);
  assert.equal(canAccessAdminWorkspace("viewer", "presence"), true);
  assert.equal(canAccessAdminWorkspace("viewer", "team"), true);
  assert.equal(canAccessAdminWorkspace("viewer", "overview"), false);
});

test("la gestion des membres respecte la hiérarchie et protège le propriétaire", () => {
  assert.equal(canManageMember("owner", "administrator"), true);
  assert.equal(canManageMember("owner", "viewer"), true);
  assert.equal(canManageMember("owner", "owner"), false);
  assert.equal(canManageMember("administrator", "moderator"), true);
  assert.equal(canManageMember("administrator", "editor"), true);
  assert.equal(canManageMember("administrator", "viewer"), true);
  assert.equal(canManageMember("administrator", "administrator"), false);
  assert.equal(canManageMember("moderator", "viewer"), false);
});

test("une invitation ne peut être réémise que pour le même rôle sans facteur vérifié", () => {
  assert.equal(canReissueAdminInvitation({ active: true, existingRole: "viewer", requestedRole: "viewer", hasVerifiedFactor: false }), true);
  assert.equal(canReissueAdminInvitation({ active: true, existingRole: "viewer", requestedRole: "editor", hasVerifiedFactor: false }), false);
  assert.equal(canReissueAdminInvitation({ active: true, existingRole: "viewer", requestedRole: "viewer", hasVerifiedFactor: true }), false);
  assert.equal(canReissueAdminInvitation({ active: true, existingRole: "owner", requestedRole: "viewer", hasVerifiedFactor: false }), false);
  assert.equal(canReissueAdminInvitation({ active: false, existingRole: "viewer", requestedRole: "viewer", hasVerifiedFactor: false }), false);
});
