import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import LoginForm from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { hasCompleteSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!hasCompleteSupabaseConfig()) redirect("/");

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/");

  return (
    <AuthShell
      eyebrow="Connexion sécurisée"
      title="Accéder au panel INOX"
      description="Saisissez d’abord vos identifiants, puis confirmez votre identité avec le code de votre application d’authentification."
    >
      <LoginForm />
    </AuthShell>
  );
}
