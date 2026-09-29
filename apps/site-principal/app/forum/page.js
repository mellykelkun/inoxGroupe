import Entete from "../../composants/Entete";
import ForumInteractif from "../../composants/ForumInteractif";
import PiedDePage from "../../composants/PiedDePage";
import {
  forumEstConfigure,
  lireMessagesForum,
} from "../../lib/supabase/forum-server";
import "./forum.css";

export const metadata = {
  title: "Forum INOX | Échangez avec la communauté et nos experts",
  description: "Posez vos questions, partagez vos expériences et échangez publiquement avec la communauté et l’équipe INOX Technologies.",
};

export const dynamic = "force-dynamic";

export default async function PageForum() {
  const configure = forumEstConfigure();
  let messages = [];

  if (configure) {
    try {
      messages = await lireMessagesForum();
    } catch (error) {
      console.error("Chargement initial du forum impossible", error);
    }
  }

  return (
    <>
      <Entete />
      <main className="pageForum">
        <section className="forumHero">
          <div className="forumHero__trame" aria-hidden="true" />
          <div className="conteneur forumHero__contenu">
            <div>
              <span className="eyebrow">L’espace d’échange INOX</span>
              <h1>Vos questions méritent des réponses <em>claires.</em></h1>
              <p>Partagez vos enjeux technologiques, profitez de l’expérience de la communauté et échangez directement avec les experts INOX pour faire avancer vos projets.</p>
            </div>
            <div className="forumHero__principes">
              <div><strong>01</strong><span>Posez vos questions librement</span></div>
              <div><strong>02</strong><span>Échangez directement avec INOX</span></div>
              <div><strong>03</strong><span>Avancez avec des réponses concrètes</span></div>
            </div>
          </div>
        </section>
        <ForumInteractif messagesInitiaux={messages} configure={configure} />
      </main>
      <PiedDePage />
    </>
  );
}
