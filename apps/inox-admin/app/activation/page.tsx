import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import MfaEnrollment from "@/components/mfa-enrollment";
import { createClient } from "@/lib/supabase/server";
import { hasCompleteSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function ActivationPage() {
  if (!hasCompleteSupabaseConfig()) redirect("/");
  const supabase = await createClient();
  const [{ data: userData }, { data: aalData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  if (!userData.user) redirect("/connexion");
  if (aalData?.currentLevel === "aal2") redirect("/");
  if (aalData?.nextLevel === "aal2") redirect("/mfa");

  return (
    <AuthShell
      eyebrow="Activation personnelle"
      title="Sécurisez votre compte INOX"
      description="Le QR ci-dessous sera créé uniquement dans votre session. L’administrateur qui vous a invité ne pourra ni le voir ni reproduire vos codes."
    >
      <MfaEnrollment email={userData.user.email ?? "Compte INOX"} />
    </AuthShell>
  );
}
