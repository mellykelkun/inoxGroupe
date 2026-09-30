import Entete from "../../composants/Entete";
import ImmersionCore from "../../composants/ImmersionCore";
import PiedDePage from "../../composants/PiedDePage";
import "./immersion-core.css";

export const metadata = {
  title: "Immersion Core | La méthode INOX Technologies",
  description: "Une méthode structurée pour transformer un besoin en solution fiable, de la conception à la supervision des applications, données, réseaux et services cloud.",
};

export default function PageImmersionCore() {
  return (
    <>
      <Entete />
      <ImmersionCore />
      <PiedDePage />
    </>
  );
}
