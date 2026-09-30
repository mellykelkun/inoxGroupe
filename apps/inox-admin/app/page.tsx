import Link from "next/link";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";
import { authenticateAdmin } from "@/lib/auth/server";
import { hasCompleteSupabaseConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!hasCompleteSupabaseConfig()) {
    return (
      <main className="setup-page">
        <section className="setup-card">
          <span className="card-label">Configuration locale requise</span>
          <h1>INOX Admin est fermé par défaut</h1>
          <p>Les écrans sont prêts, mais aucune clé Supabase n’est présente dans cette application. Aucun accès factice n’est accordé.</p>
          <ol>
            <li>Copier <code>.env.example</code> vers <code>.env.local</code> dans <code>apps/inox-admin</code>.</li>
            <li>Renseigner l’URL, la clé publique et la clé serveur du projet Supabase partagé.</li>
            <li>Appliquer les migrations puis créer le premier propriétaire avec le script d’amorçage.</li>
          </ol>
          {process.env.NODE_ENV === "development" ? <Link className="auth-submit" href="/apercu">Voir uniquement l’aperçu de l’interface</Link> : null}
        </section>
      </main>
    );
  }

  const auth = await authenticateAdmin();
  if (!auth.ok) {
    if (auth.reason === "unauthenticated") redirect("/connexion");
    if (auth.reason === "enrollment_required") redirect("/activation");
    if (auth.reason === "mfa_required") redirect("/mfa");
    redirect("/connexion?erreur=acces");
  }

  return <AdminDashboard currentMember={auth.identity} />;
}
