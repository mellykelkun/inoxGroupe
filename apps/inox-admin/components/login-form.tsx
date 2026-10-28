"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_EMAIL_EXAMPLE, ADMIN_EMAIL_INPUT_PATTERN, isAdminEmail, normalizeAdminEmail } from "@/lib/auth/admin-email";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeAdminEmail(email);
    if (!isAdminEmail(normalizedEmail)) {
      setError("Utilisez votre adresse nominative se terminant par @inox-group.net.");
      return;
    }
    setPending(true);
    setError("");

    try {
      const supabase = await createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) throw signInError;

      const { data, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) throw aalError;

      router.replace(data.nextLevel === "aal2" ? "/mfa" : "/activation");
      router.refresh();
    } catch {
      setError("Adresse e-mail ou mot de passe incorrect.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>
        Adresse e-mail professionnelle
        <input
          type="email"
          autoComplete="username"
          maxLength={80}
          pattern={ADMIN_EMAIL_INPUT_PATTERN}
          title="Utilisez une adresse nominative se terminant par @inox-group.net."
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={ADMIN_EMAIL_EXAMPLE}
          aria-describedby="login-email-help"
        />
        <small id="login-email-help" className="field-help">Format attendu : {ADMIN_EMAIL_EXAMPLE}</small>
      </label>
      <label>
        Mot de passe
        <input
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Votre mot de passe"
        />
      </label>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Vérification…" : "Continuer vers le code à 6 chiffres"}
      </button>
      <p className="auth-help">
        Aucun compte public ne peut être créé ici. L’accès commence toujours par
        une invitation émise depuis le panel par un membre autorisé.
      </p>
    </form>
  );
}
