type ActivationAuthClient = {
  updateUser(attributes: {
    password: string;
    data: { inox_password_initialized: true };
  }): Promise<{ error: unknown }>;
};

export async function updateActivationPassword(
  auth: ActivationAuthClient,
  password: string,
) {
  return auth.updateUser({
    password,
    data: { inox_password_initialized: true },
  });
}

export function hasInitializedPassword(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
  return user.app_metadata?.inox_password_initialized === true ||
    user.user_metadata?.inox_password_initialized === true;
}
