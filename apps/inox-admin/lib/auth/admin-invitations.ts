import "server-only";

import type { GenerateLinkProperties, User } from "@supabase/supabase-js";
import { buildAdminInvitationUrl } from "@/lib/auth/invitation-links";
import { canReissueAdminInvitation, type AdminRole } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminInvitationFailure =
  | "member_already_exists"
  | "invitation_failed"
  | "member_profile_failed";

export class AdminInvitationError extends Error {
  constructor(readonly reason: AdminInvitationFailure) {
    super(reason);
  }
}

function looksLikeExistingMember(message: string | undefined) {
  const cleanMessage = message?.toLowerCase() ?? "";
  return cleanMessage.includes("registered") || cleanMessage.includes("exists");
}

async function findUserByEmail(email: string) {
  const admin = createAdminClient();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new AdminInvitationError("invitation_failed");
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 200) break;
  }
  return null;
}

async function reissuePendingInvitation(
  email: string,
  displayName: string,
  role: AdminRole,
  invitedBy: string,
) {
  const admin = createAdminClient();
  const existingUser = await findUserByEmail(email);
  const existingRole = existingUser?.app_metadata.inox_admin_role;
  if (!existingUser) {
    throw new AdminInvitationError("member_already_exists");
  }

  const { data: factorData, error: factorError } =
    await admin.auth.admin.mfa.listFactors({ userId: existingUser.id });
  if (factorError) throw new AdminInvitationError("invitation_failed");
  if (!canReissueAdminInvitation({
    active: existingUser.app_metadata.inox_admin_active === true,
    existingRole,
    requestedRole: role,
    hasVerifiedFactor: factorData.factors.some((factor) => factor.status === "verified"),
  })) {
    throw new AdminInvitationError("member_already_exists");
  }

  const { data: recoveryData, error: recoveryError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (
    recoveryError ||
    !recoveryData.user ||
    !recoveryData.properties?.hashed_token ||
    recoveryData.properties.verification_type !== "recovery"
  ) {
    throw new AdminInvitationError("invitation_failed");
  }

  const { data: updatedData, error: updateError } = await admin.auth.admin.updateUserById(
    existingUser.id,
    {
      app_metadata: {
        ...existingUser.app_metadata,
        inox_admin_display_name: displayName,
        inox_admin_invited_by:
          existingUser.app_metadata.inox_admin_invited_by || invitedBy,
      },
    },
  );
  if (updateError || !updatedData.user) {
    throw new AdminInvitationError("member_profile_failed");
  }

  return {
    user: updatedData.user,
    properties: recoveryData.properties,
    reissued: true,
  };
}

export async function createAdminInvitation({
  email,
  displayName,
  role,
  invitedBy,
  origin,
}: {
  email: string;
  displayName: string;
  role: AdminRole;
  invitedBy: string;
  origin: string;
}) {
  const admin = createAdminClient();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: { display_name: displayName } },
  });

  let user: User;
  let properties: GenerateLinkProperties;
  let reissued = false;

  if (linkError) {
    if (!looksLikeExistingMember(linkError.message)) {
      throw new AdminInvitationError("invitation_failed");
    }
    const pendingInvitation = await reissuePendingInvitation(email, displayName, role, invitedBy);
    user = pendingInvitation.user;
    properties = pendingInvitation.properties;
    reissued = pendingInvitation.reissued;
  } else {
    if (
      !linkData.user ||
      !linkData.properties?.hashed_token ||
      linkData.properties.verification_type !== "invite"
    ) {
      throw new AdminInvitationError("invitation_failed");
    }
    user = linkData.user;
    properties = linkData.properties;

    const { data: updatedData, error: updateError } = await admin.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...user.app_metadata,
          inox_admin_active: true,
          inox_admin_role: role,
          inox_admin_display_name: displayName,
          inox_admin_invited_by: invitedBy,
        },
      },
    );
    if (updateError || !updatedData.user) {
      await admin.auth.admin.deleteUser(user.id);
      throw new AdminInvitationError("member_profile_failed");
    }
    user = updatedData.user;
  }

  const verificationType = properties.verification_type;
  if (verificationType !== "invite" && verificationType !== "recovery") {
    throw new AdminInvitationError("invitation_failed");
  }

  return {
    invitationUrl: buildAdminInvitationUrl(
      origin,
      properties.hashed_token,
      verificationType,
    ),
    member: { userId: user.id, email, displayName, role },
    reissued,
  };
}
