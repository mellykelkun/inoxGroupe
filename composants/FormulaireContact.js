"use client";

import { useState } from "react";

const adresseReception = "contact@inox-group.net";
const endpointContact = process.env.NEXT_PUBLIC_ENDPOINT_CONTACT;

export default function FormulaireContact() {
  const [typeProfil, setTypeProfil] = useState("entreprise");
  const [etatEnvoi, setEtatEnvoi] = useState("repos");
  const [messageEtat, setMessageEtat] = useState("");

  async function envoyerDemande(evenement) {
    evenement.preventDefault();
    setEtatEnvoi("envoi");
    setMessageEtat("");

    const formulaire = evenement.currentTarget;
    const champs = Object.fromEntries(new FormData(formulaire));
    const demande = {
      typeProfil,
      ...champs,
      consentement: champs.consentement === "accepte",
      dateCreation: new Date().toISOString(),
      source: "site-inox-technologies",
    };

    if (endpointContact) {
      try {
        const reponse = await fetch(endpointContact, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(demande),
        });

        if (!reponse.ok) throw new Error("La demande n’a pas pu être transmise.");

        formulaire.reset();
        setTypeProfil("entreprise");
        setEtatEnvoi("succes");
        setMessageEtat("Merci. Votre demande a bien été transmise à l’équipe INOX.");
        return;
      } catch {
        setEtatEnvoi("erreur");
        setMessageEtat("L’envoi est momentanément indisponible. Vous pouvez nous écrire directement à contact@inox-group.net.");
        return;
      }
    }

    const sujet = encodeURIComponent(`Demande ${typeProfil} — ${champs.domaineBesoin}`);
    const corps = encodeURIComponent([
      `Profil : ${typeProfil}`,
      champs.organisation ? `Organisation : ${champs.organisation}` : null,
      champs.fonction ? `Fonction : ${champs.fonction}` : null,
      `Nom : ${champs.nomComplet}`,
      `Email : ${champs.email}`,
      `Téléphone : ${champs.telephone}`,
      `Besoin : ${champs.domaineBesoin}`,
      `Contact préféré : ${champs.modeContact}`,
      "",
      champs.message,
    ].filter(Boolean).join("\n"));

    setEtatEnvoi("succes");
    setMessageEtat("Votre messagerie va s’ouvrir avec les informations déjà préparées.");
    window.location.href = `mailto:${adresseReception}?subject=${sujet}&body=${corps}`;
  }

  return (
    <form className="formulaireContact" onSubmit={envoyerDemande}>
      <div className="formulaireContact__entete">
        <span className="formulaireContact__numero">DEMANDE / 01</span>
        <h3>Présentez-nous votre besoin</h3>
        <p>Quelques informations suffisent pour préparer un premier échange utile.</p>
      </div>

      <fieldset className="choixProfil">
        <legend>Vous nous contactez comme</legend>
        <div className="choixProfil__options">
          <label className={typeProfil === "entreprise" ? "choixProfil__option choixProfil__option--actif" : "choixProfil__option"}>
            <input type="radio" name="typeProfil" value="entreprise" checked={typeProfil === "entreprise"} onChange={() => setTypeProfil("entreprise")} />
            <span>Entreprise</span>
            <small>Organisation, institution ou équipe</small>
          </label>
          <label className={typeProfil === "particulier" ? "choixProfil__option choixProfil__option--actif" : "choixProfil__option"}>
            <input type="radio" name="typeProfil" value="particulier" checked={typeProfil === "particulier"} onChange={() => setTypeProfil("particulier")} />
            <span>Particulier</span>
            <small>Besoin individuel ou projet personnel</small>
          </label>
        </div>
      </fieldset>

      <div className="formulaireContact__grille">
        {typeProfil === "entreprise" && (
          <>
            <label>
              <span>Organisation *</span>
              <input name="organisation" type="text" autoComplete="organization" required placeholder="Nom de votre organisation" />
            </label>
            <label>
              <span>Fonction</span>
              <input name="fonction" type="text" autoComplete="organization-title" placeholder="Votre rôle" />
            </label>
          </>
        )}
        <label>
          <span>Nom complet *</span>
          <input name="nomComplet" type="text" autoComplete="name" required placeholder="Votre nom et prénom" />
        </label>
        <label>
          <span>Adresse email *</span>
          <input name="email" type="email" autoComplete="email" required placeholder="vous@exemple.com" />
        </label>
        <label>
          <span>Téléphone *</span>
          <input name="telephone" type="tel" autoComplete="tel" required placeholder="+225 00 00 00 00 00" />
        </label>
        <label>
          <span>Domaine du besoin *</span>
          <select name="domaineBesoin" defaultValue="" required>
            <option value="" disabled>Sélectionner un domaine</option>
            <option>Datacenter, cloud & productivité</option>
            <option>Réseaux & cybersécurité</option>
            <option>Développement & intégration</option>
            <option>Audit & consulting</option>
            <option>Formation, assistance & support</option>
            <option>Autre besoin</option>
          </select>
        </label>
        <label className="formulaireContact__large">
          <span>Comment pouvons-nous vous aider ? *</span>
          <textarea name="message" rows="5" required placeholder="Décrivez brièvement votre contexte, votre difficulté ou le résultat recherché." />
        </label>
        <label className="formulaireContact__large">
          <span>Comment préférez-vous être recontacté ?</span>
          <select name="modeContact" defaultValue="email">
            <option value="email">Par email</option>
            <option value="telephone">Par téléphone</option>
            <option value="indifferent">Email ou téléphone</option>
          </select>
        </label>
      </div>

      <label className="consentement">
        <input name="consentement" type="checkbox" value="accepte" required />
        <span>J’accepte que mes informations soient utilisées uniquement pour répondre à ma demande.</span>
      </label>

      <div className="formulaireContact__action">
        <button className="bouton bouton--accent" type="submit" disabled={etatEnvoi === "envoi"}>
          {etatEnvoi === "envoi" ? "Transmission…" : "Envoyer ma demande"}
          <span aria-hidden="true">↗</span>
        </button>
        <p className={`formulaireContact__etat formulaireContact__etat--${etatEnvoi}`} role="status" aria-live="polite">{messageEtat}</p>
      </div>
    </form>
  );
}
