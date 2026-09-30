import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import MfaChallenge from "@/components/mfa-challenge";
import { createClient } from "@/lib/supabase/server";
import { hasCompleteSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function MfaPage() {
  if (!hasCompleteSupabaseConfig()) redirect("/");
  const supabase = await createClient();
  const [{ data: userData }, { data: aalData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  if (!userData.user) redirect("/connexion");
  if (aalData?.currentLevel === "aal2") redirect("/");
  if (aalData?.nextLevel !== "aal2") redirect("/activation");

  return (
    <AuthShell
      eyebrow="Deuxième facteur"
      title="Entrez votre code à 6 chiffres"
      description="Ouvrez l’application d’authentification utilisée lors de votre activation et saisissez le code INOX Admin."
    >
      <MfaChallenge />
    </AuthShell>
  );
}
