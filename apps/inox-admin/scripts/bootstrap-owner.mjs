import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL_EXAMPLE, isAdminEmail, normalizeAdminEmail } from "../lib/auth/admin-email.ts";

try {
  loadEnvFile(new URL("../.env.local", import.meta.url));
} catch {
  // Les variables peuvent aussi être fournies directement par le terminal.
}

const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.replace(/^--/, "").split("=");
    return [key, value.join("=")];
  }),
);

const email = normalizeAdminEmail(args.email);
const name = args.name?.trim();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secret = process.env.SUPABASE_SECRET_KEY?.trim();
const adminUrl = args["admin-url"]?.trim() || process.env.ADMIN_URL?.trim() || process.env.NEXT_PUBLIC_ADMIN_URL?.trim();

if (!email || !name || !url || !secret || !adminUrl) {
  console.error(`Usage: npm run auth:bootstrap -w @inox/inox-admin -- --email=${ADMIN_EMAIL_EXAMPLE} --name=\"Nom\" --admin-url=https://inox-admin.vercel.app`);
  console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY et l’origine ADMIN_URL doivent être configurées.");
  process.exit(1);
}

if (!isAdminEmail(email)) {
  console.error(`L’adresse du propriétaire doit être nominative et se terminer par @inox-group.net, par exemple ${ADMIN_EMAIL_EXAMPLE}.`);
  process.exit(1);
}

let adminOrigin;
try {
  const parsedAdminUrl = new URL(adminUrl);
  if (parsedAdminUrl.protocol !== "http:" && parsedAdminUrl.protocol !== "https:") {
    throw new Error("unsupported_protocol");
  }
  adminOrigin = parsedAdminUrl.origin;
} catch {
  console.error("ADMIN_URL doit être une origine HTTP ou HTTPS valide.");
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (let page = 1; page <= 10; page += 1) {
  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (usersError) {
    console.error("Impossible de vérifier les propriétaires existants.");
    process.exit(1);
  }
  if (usersData.users.some((user) =>
    user.app_metadata.inox_admin_role === "owner" &&
    user.app_metadata.inox_admin_active === true
  )) {
    console.error("Un propriétaire actif existe déjà. Le bootstrap initial est refusé.");
    process.exit(1);
  }
  if (usersData.users.length < 200) break;
}

const { data, error } = await supabase.auth.admin.generateLink({
  type: "invite",
  email,
  options: {
    data: { display_name: name },
  },
});

if (error || !data.user || !data.properties?.hashed_token || data.properties.verification_type !== "invite") {
  console.error(error?.message ?? "Impossible de créer le propriétaire.");
  process.exit(1);
}

const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, {
  app_metadata: {
    ...data.user.app_metadata,
    inox_admin_active: true,
    inox_admin_role: "owner",
    inox_admin_display_name: name,
  },
});

if (updateError) {
  await supabase.auth.admin.deleteUser(data.user.id);
  console.error(updateError.message);
  process.exit(1);
}

console.log("Propriétaire initial créé :", data.user.id);
console.log("Ouvrez ce lien une seule fois pour créer le mot de passe et le TOTP :");
const invitationUrl = new URL("/auth/callback", adminOrigin);
invitationUrl.searchParams.set("token_hash", data.properties.hashed_token);
invitationUrl.searchParams.set("type", "invite");
console.log(invitationUrl.toString());
