"use client";

import { usePathname } from "next/navigation";

export default function Template({ children }) {
  const chemin = usePathname();
  const ouverturePartenaires = chemin === "/partenaires";

  return (
    <div className="transitionPage">
      <div className={`transitionPage__ouverture ${ouverturePartenaires ? "transitionPage__ouverture--partenaires" : ""}`} aria-hidden="true">
        <span>{ouverturePartenaires ? "CONNEXIONS" : "INOX"}</span>
      </div>
      {children}
    </div>
  );
}
