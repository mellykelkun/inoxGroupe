export const adminRoles = [
  "owner",
  "administrator",
  "moderator",
  "editor",
  "viewer",
] as const;

export type AdminRole = (typeof adminRoles)[number];

export type AdminWorkspace =
  | "overview"
  | "assistant"
  | "contacts"
  | "forum"
  | "journal"
  | "presence"
  | "team";

export type AdminIdentity = {
  userId: string;
  sessionId: string;
  email: string;
  displayName: string;
  role: AdminRole;
};

export type AdminMemberSummary = {
  userId: string;
  email: string;
  displayName: string;
  role: AdminRole;
  active: boolean;
  status: "pending" | "active" | "blocked";
  hasVerifiedMfa: boolean;
  emailCompliant: boolean;
  invitationIssuedAt: string | null;
  invitationGeneration: number;
  createdAt: string;
  lastSignInAt: string | null;
};

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && adminRoles.includes(value as AdminRole);
}

export function canInviteMembers(role: AdminRole) {
  return role === "owner" || role === "administrator";
}

export function canManageContacts(role: AdminRole) {
  return role === "owner" || role === "administrator";
}

export function canUseAdminAssistant(role: AdminRole) {
  return role === "owner" || role === "administrator";
}

export function canViewAdminOverview(role: AdminRole) {
  return role === "owner" || role === "administrator";
}

export function canViewRoleAccessMatrix(role: AdminRole) {
  return role === "owner";
}

export function canAccessAdminWorkspace(role: AdminRole, workspace: AdminWorkspace) {
  if (workspace === "presence" || workspace === "team") return true;
  if (workspace === "forum") return canModerateForum(role);
  if (workspace === "journal") return canManageEditorial(role);
  if (workspace === "overview") return canViewAdminOverview(role);
  if (workspace === "assistant") return canUseAdminAssistant(role);
  return canManageContacts(role);
}

export function canManageMember(actorRole: AdminRole, targetRole: AdminRole) {
  if (targetRole === "owner") return false;
  if (actorRole === "owner") return true;
  return actorRole === "administrator" &&
    (targetRole === "moderator" || targetRole === "editor" || targetRole === "viewer");
}

export function canModerateForum(role: AdminRole) {
  return role === "owner" || role === "administrator" || role === "moderator";
}

export function canManageEditorial(role: AdminRole) {
  return role === "owner" || role === "administrator" || role === "editor";
}

export function canReissueAdminInvitation({
  active,
  existingRole,
  requestedRole,
  hasVerifiedFactor,
}: {
  active: boolean;
  existingRole: unknown;
  requestedRole: AdminRole;
  hasVerifiedFactor: boolean;
}) {
  return active &&
    isAdminRole(existingRole) &&
    existingRole !== "owner" &&
    existingRole === requestedRole &&
    !hasVerifiedFactor;
}
