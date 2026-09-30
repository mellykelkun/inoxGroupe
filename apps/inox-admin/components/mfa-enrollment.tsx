"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Enrollment = { factorId: string; qrCode: string; secret: string };

export default function MfaEnrollment({
  email,
  passwordReady = false,
}: {
  email: string;
  passwordReady?: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!passwordReady && password.length < 12) {
      setError("Choisissez un mot de passe d’au moins 12 caractères.");
      return;
    }
    if (!passwordReady && password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setPending(true);
    try {
      const supabase = await createClient();
      if (!passwordReady) {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) throw passwordError;
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "INOX Admin",
      });
      if (enrollError) throw enrollError;
      setEnrollment({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("L’activation n’a pas pu démarrer. Rechargez l’invitation ou contactez l’administrateur.");
    } finally {
      setPending(false);
    }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment) return;
    setPending(true);
    setError("");

    try {
      const supabase = await createClient();
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: enrollment.factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollment.factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;
      router.replace("/");
      router.refresh();
    } catch {
      setError("Code incorrect. Vérifiez l’heure du téléphone puis saisissez le nouveau code affiché.");
    } finally {
      setPending(false);
    }
  }

  if (!enrollment) {
    return (
      <form className="auth-form" onSubmit={prepare}>
        <div className="auth-account"><span>Compte invité</span><strong>{email}</strong></div>
        {!passwordReady ? <>
          <label>
            Créer votre mot de passe
            <input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label>
            Confirmer le mot de passe
            <input type="password" autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
        </> : <p className="auth-help">Votre mot de passe est actif. Créez maintenant votre QR personnel pour protéger chaque connexion.</p>}
        {error ? <p className="auth-error" role="alert">{error}</p> : null}
        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? "Préparation…" : "Créer mon QR personnel"}
        </button>
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={verify}>
      <div className="enrollment-qr">
        <Image src={enrollment.qrCode} alt="QR personnel INOX Admin à scanner" width={220} height={220} unoptimized priority />
      </div>
      <ol className="activation-steps">
        <li>Ouvrez une application TOTP comme Google Authenticator, Microsoft Authenticator ou 1Password.</li>
        <li>Scannez ce QR personnel. Ne le partagez jamais.</li>
        <li>Saisissez le code à 6 chiffres généré.</li>
      </ol>
      <details className="manual-secret">
        <summary>Impossible de scanner ? Afficher la clé manuelle</summary>
        <code>{enrollment.secret}</code>
      </details>
      <label>
        Code de vérification
        <input className="otp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" />
      </label>
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={pending || code.length !== 6}>
        {pending ? "Activation…" : "Activer le 2FA et ouvrir le panel"}
      </button>
    </form>
  );
}
