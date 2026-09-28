"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const CATEGORIES = {
  general: "Discussion générale",
  conseil: "Conseil & expertise",
  support: "Support technique",
  projet: "Projet numérique",
};

const DATE_FORUM = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function FormulaireForum({ parentId = null, configure, onAnnuler, onPublication }) {
  const [etat, setEtat] = useState({ type: "", texte: "" });
  const [envoi, setEnvoi] = useState(false);

  async function envoyer(event) {
    event.preventDefault();
    setEnvoi(true);
    setEtat({ type: "", texte: "" });
    const formulaire = event.currentTarget;
    const donnees = new FormData(formulaire);
    const payload = {
      firstName: donnees.get("firstName"),
      lastName: donnees.get("lastName"),
      email: donnees.get("email"),
      subject: parentId ? "" : donnees.get("subject"),
      category: parentId ? "general" : donnees.get("category"),
      body: donnees.get("body"),
      parentId,
      privacyAccepted: donnees.get("privacyAccepted") === "on",
      website: donnees.get("website"),
    };

    try {
      const reponse = await fetch("/api/forum/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resultat = await reponse.json();
      if (!reponse.ok) throw new Error(resultat.error || "Publication impossible.");

      formulaire.reset();
      setEtat({ type: "succes", texte: "Votre message est publié." });
      await onPublication();
      if (parentId) onAnnuler?.();
    } catch (error) {
      setEtat({ type: "erreur", texte: error.message });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form className={`forumFormulaire ${parentId ? "forumFormulaire--reponse" : ""}`} onSubmit={envoyer}>
      <div className="forumFormulaire__entete">
        <div>
          <span className="forumFormulaire__repere">{parentId ? "Réponse publique" : "Nouvelle discussion"}</span>
          <h2>{parentId ? "Participer à cet échange" : "Lancer une discussion"}</h2>
        </div>
        {onAnnuler && <button className="forumFormulaire__fermer" type="button" onClick={onAnnuler} aria-label="Fermer le formulaire">×</button>}
      </div>

      <p className="forumFormulaire__confidentialite">
        Pour vous répondre avec attention et préserver la qualité des échanges, nous vous demandons vos coordonnées. Seul votre prénom et l’initiale de votre nom apparaîtront sur le forum.
      </p>

      <div className="forumFormulaire__grille">
        <label><span>Prénom</span><input name="firstName" autoComplete="given-name" minLength="2" maxLength="60" required /></label>
        <label><span>Nom</span><input name="lastName" autoComplete="family-name" minLength="2" maxLength="60" required /></label>
        <label className="forumFormulaire__large"><span>Adresse e-mail</span><input name="email" type="email" autoComplete="email" maxLength="254" required /></label>
        {!parentId && (
          <>
            <label className="forumFormulaire__large"><span>Sujet</span><input name="subject" minLength="5" maxLength="140" required /></label>
            <label className="forumFormulaire__large"><span>Catégorie</span><select name="category" defaultValue="general">{Object.entries(CATEGORIES).map(([valeur, libelle]) => <option value={valeur} key={valeur}>{libelle}</option>)}</select></label>
          </>
        )}
        <label className="forumFormulaire__large"><span>Message</span><textarea name="body" minLength="10" maxLength="3000" rows="6" required /></label>
        <label className="forumFormulaire__piege" aria-hidden="true">Site web<input name="website" tabIndex="-1" autoComplete="off" /></label>
      </div>

      <label className="forumFormulaire__accord">
        <input name="privacyAccepted" type="checkbox" required />
        <span>J’accepte qu’INOX utilise mes coordonnées pour assurer le suivi de mon message. Elles ne seront jamais affichées publiquement.</span>
      </label>

      <div className="forumFormulaire__actions">
        <button className="bouton bouton--sombre" type="submit" disabled={!configure || envoi}>
          {envoi ? "Publication…" : parentId ? "Publier la réponse" : "Publier la discussion"}
          <span aria-hidden="true">↗</span>
        </button>
        {onAnnuler && <button className="forumBoutonTexte" type="button" onClick={onAnnuler}>Annuler</button>}
      </div>
      {!configure && <p className="forumFormulaire__etat forumFormulaire__etat--attente">Les nouvelles publications seront disponibles très prochainement.</p>}
      {etat.texte && <p className={`forumFormulaire__etat forumFormulaire__etat--${etat.type}`} role="status">{etat.texte}</p>}
    </form>
  );
}

export default function ForumInteractif({ messagesInitiaux, configure }) {
  const [messages, setMessages] = useState(messagesInitiaux);
  const [categorie, setCategorie] = useState("toutes");
  const [reponseA, setReponseA] = useState(null);
  const [chargement, setChargement] = useState(false);

  const actualiser = useCallback(async ({ discret = false } = {}) => {
    if (!configure) return;
    if (!discret) setChargement(true);
    try {
      const reponse = await fetch("/api/forum/messages", { cache: "no-store" });
      if (!reponse.ok) return;
      const resultat = await reponse.json();
      setMessages(resultat.messages || []);
    } finally {
      if (!discret) setChargement(false);
    }
  }, [configure]);

  useEffect(() => {
    if (!configure) return undefined;
    const intervalle = window.setInterval(() => {
      if (document.visibilityState === "visible") actualiser({ discret: true });
    }, 45_000);
    return () => window.clearInterval(intervalle);
  }, [actualiser, configure]);

  const { discussions, reponsesParFil, messagesParId } = useMemo(() => {
    const index = new Map(messages.map((message) => [message.id, message]));
    const racines = messages
      .filter((message) => message.parent_id === null)
      .filter((message) => categorie === "toutes" || message.category === categorie)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const groupes = new Map();
    messages.filter((message) => message.parent_id !== null).forEach((message) => {
      const fil = message.thread_id;
      groupes.set(fil, [...(groupes.get(fil) || []), message]);
    });
    groupes.forEach((reponses) => reponses.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    return { discussions: racines, reponsesParFil: groupes, messagesParId: index };
  }, [messages, categorie]);

  return (
    <section className="forumEspace" aria-label="Discussions du forum INOX">
      <div className="conteneur forumEspace__grille">
        <aside className="forumEspace__creation">
          <FormulaireForum configure={configure} onPublication={actualiser} />
        </aside>

        <div className="forumEspace__discussions">
          <div className="forumOutils">
            <div className="forumFiltres" role="group" aria-label="Filtrer les discussions">
              <button className={categorie === "toutes" ? "forumFiltre--actif" : ""} type="button" onClick={() => setCategorie("toutes")}>Toutes</button>
              {Object.entries(CATEGORIES).map(([valeur, libelle]) => (
                <button className={categorie === valeur ? "forumFiltre--actif" : ""} type="button" onClick={() => setCategorie(valeur)} key={valeur}>{libelle}</button>
              ))}
            </div>
            <button className="forumActualiser" type="button" onClick={() => actualiser()} disabled={!configure || chargement}>
              {chargement ? "Actualisation…" : "Actualiser"}
            </button>
          </div>

          {!configure && (
            <div className="forumAlerte">
              <span aria-hidden="true">→</span>
              <div>
                <strong>Le Forum INOX ouvre très bientôt</strong>
                <p>Un nouvel espace pour poser vos questions, partager vos enjeux et bénéficier de réponses utiles de la communauté et de nos experts.</p>
                <Link href="/#contact">Échanger dès maintenant avec un expert <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          )}

          {configure && discussions.length === 0 && (
            <div className="forumVide"><span>01</span><h2>Soyez la première personne à ouvrir la discussion.</h2><p>Posez une question, partagez une expérience ou présentez votre projet à la communauté INOX.</p></div>
          )}

          <div className="forumListe">
            {discussions.map((discussion) => {
              const reponses = reponsesParFil.get(discussion.id) || [];
              return (
                <article className="forumDiscussion" id={`discussion-${discussion.id}`} key={discussion.id}>
                  <header className="forumDiscussion__entete">
                    <div className={`forumAvatar ${discussion.author_kind === "inox" ? "forumAvatar--inox" : ""}`} aria-hidden="true">{discussion.author_kind === "inox" ? "IX" : discussion.display_name.slice(0, 1)}</div>
                    <div><strong>{discussion.display_name}</strong>{discussion.author_kind === "inox" && <span className="forumBadgeInox">Équipe INOX</span>}<time dateTime={discussion.created_at}>{DATE_FORUM.format(new Date(discussion.created_at))}</time></div>
                    <span className="forumDiscussion__categorie">{CATEGORIES[discussion.category]}</span>
                  </header>
                  <h2>{discussion.subject}</h2>
                  <p className="forumDiscussion__texte">{discussion.body}</p>
                  <div className="forumDiscussion__actions">
                    <span>{reponses.length} {reponses.length > 1 ? "réponses" : "réponse"}</span>
                    <button type="button" onClick={() => setReponseA(reponseA === discussion.id ? null : discussion.id)}>Répondre <span aria-hidden="true">↗</span></button>
                  </div>

                  {reponses.length > 0 && (
                    <div className="forumReponses">
                      {reponses.map((reponse) => {
                        const parent = messagesParId.get(reponse.parent_id);
                        return (
                          <div className={`forumReponse ${reponse.author_kind === "inox" ? "forumReponse--inox" : ""}`} id={`message-${reponse.id}`} key={reponse.id}>
                            <div className="forumReponse__meta"><strong>{reponse.display_name}</strong>{reponse.author_kind === "inox" && <span className="forumBadgeInox">Réponse officielle INOX</span>}<time dateTime={reponse.created_at}>{DATE_FORUM.format(new Date(reponse.created_at))}</time></div>
                            {parent && parent.id !== discussion.id && <small>En réponse à {parent.display_name}</small>}
                            <p>{reponse.body}</p>
                            <button type="button" onClick={() => setReponseA(reponseA === reponse.id ? null : reponse.id)}>Répondre</button>
                            {reponseA === reponse.id && <FormulaireForum parentId={reponse.id} configure={configure} onPublication={actualiser} onAnnuler={() => setReponseA(null)} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {reponseA === discussion.id && <FormulaireForum parentId={discussion.id} configure={configure} onPublication={actualiser} onAnnuler={() => setReponseA(null)} />}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
