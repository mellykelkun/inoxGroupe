import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

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

const email = args.email?.trim().toLowerCase();
const name = args.name?.trim();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const secret = process.env.SUPABASE_SECRET_KEY?.trim();
const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL?.trim() || "http://localhost:3002";

if (!email || !name || !url || !secret) {
  console.error("Usage: npm run auth:bootstrap -w @inox/inox-admin -- --email=proprietaire@inox.ci --name=\"Nom\"");
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY doivent être configurées dans apps/inox-admin/.env.local.");
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.generateLink({
  type: "invite",
  email,
  options: {
    redirectTo: `${new URL(adminUrl).origin}/auth/callback`,
    data: { display_name: name },
  },
});

if (error || !data.user || !data.properties?.action_link) {
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
  console.error(updateError.message);
  process.exit(1);
}

console.log("Propriétaire initial créé :", data.user.id);
console.log("Ouvrez ce lien une seule fois pour créer le mot de passe et le TOTP :");
console.log(data.properties.action_link);

