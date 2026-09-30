"use client";

import { useState } from "react";

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
      website: champs.website,
    };

    try {
      const reponse = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demande),
      });
      const resultat = await reponse.json().catch(() => ({}));

      if (!reponse.ok) throw new Error(resultat.error || "La demande n’a pas pu être transmise.");

      formulaire.reset();
      setTypeProfil("entreprise");
      setEtatEnvoi("succes");
      setMessageEtat(`Votre demande ${resultat.reference} a bien été transmise. L’équipe INOX vous recontactera par le canal choisi.`);
    } catch (erreur) {
      setEtatEnvoi("erreur");
      setMessageEtat(erreur instanceof Error ? erreur.message : "L’envoi est momentanément indisponible. Réessayez dans quelques minutes.");
    }
  }

  return (
    <form className="formulaireContact" onSubmit={envoyerDemande}>
      <label aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}>
        Site web
        <input name="website" type="text" tabIndex="-1" autoComplete="off" />
      </label>
      <div className="formulaireContact__entete">
        <span className="formulaireContact__numero">DEMANDE / 01</span>
        <h3>Quel résultat recherchez-vous ?</h3>
        <p>Décrivez votre priorité : nous préparerons un échange centré sur les solutions et les prochaines étapes.</p>
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
          <span>Ville et pays *</span>
          <input name="localisation" type="text" autoComplete="address-level2" required placeholder="Ex. Abidjan, Côte d’Ivoire" />
        </label>
        <label>
          <span>Domaine du besoin *</span>
          <select name="domaineBesoin" defaultValue="" required>
            <option value="" disabled>Sélectionner un domaine</option>
            <option>Datacenter, cloud & productivité</option>
            <option>Réseaux & cybersécurité</option>
            <option>Développement & intégration</option>
            <option>Audit & conseil</option>
            <option>Formation, assistance & support</option>
            <option>Autre besoin</option>
          </select>
        </label>
        <label>
          <span>Avancement du projet *</span>
          <select name="avancementProjet" defaultValue="" required>
            <option value="" disabled>Sélectionner une étape</option>
            <option value="idee">Idée ou besoin à clarifier</option>
            <option value="cadrage">Cadrage en cours</option>
            <option value="prestataire">Recherche de prestataire</option>
            <option value="deploiement">Projet déjà lancé</option>
            <option value="incident">Problème ou incident à résoudre</option>
          </select>
        </label>
        <label>
          <span>Échéance souhaitée *</span>
          <select name="echeanceSouhaitee" defaultValue="" required>
            <option value="" disabled>Sélectionner une échéance</option>
            <option value="urgent">Dès que possible</option>
            <option value="1-mois">Sous 1 mois</option>
            <option value="1-3-mois">Dans 1 à 3 mois</option>
            <option value="3-mois-plus">Dans plus de 3 mois</option>
            <option value="a-definir">À définir ensemble</option>
          </select>
        </label>
        <label className="formulaireContact__large">
          <span>Comment pouvons-nous vous aider ? *</span>
          <textarea name="message" rows="5" required placeholder="Exemple : réduire les interruptions, sécuriser nos données, connecter plusieurs sites ou automatiser un processus." />
        </label>
        <label className="formulaireContact__large">
          <span>Comment préférez-vous être recontacté ?</span>
          <select name="modeContact" defaultValue="email">
            <option value="email">Par email</option>
            <option value="telephone">Par téléphone</option>
            <option value="indifferent">Email ou téléphone</option>
          </select>
        </label>
        <label className="formulaireContact__large">
          <span>Créneau de recontact souhaité</span>
          <input name="creneauContact" type="text" placeholder="Ex. du lundi au vendredi, entre 9 h et 12 h" />
        </label>
      </div>

      <label className="consentement">
        <input name="consentement" type="checkbox" value="accepte" required />
        <span>J’accepte que mes informations soient utilisées uniquement pour répondre à ma demande.</span>
      </label>

      <div className="formulaireContact__action">
        <button className="bouton bouton--accent" type="submit" disabled={etatEnvoi === "envoi"}>
          {etatEnvoi === "envoi" ? "Transmission…" : "Être recontacté"}
          <span aria-hidden="true">↗</span>
        </button>
        <p className={`formulaireContact__etat formulaireContact__etat--${etatEnvoi}`} role="status" aria-live="polite">{messageEtat}</p>
      </div>
    </form>
  );
}
