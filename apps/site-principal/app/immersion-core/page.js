import Entete from "../../composants/Entete";
import ImmersionCore from "../../composants/ImmersionCore";
import PiedDePage from "../../composants/PiedDePage";
import "./immersion-core.css";

export const metadata = {
  title: "Immersion Core | Découvrez la méthode INOX Technologies",
  description: "Découvrez comment INOX transforme un besoin en solution fiable : conception, applications, données, réseaux, cybersécurité, cloud et supervision.",
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
