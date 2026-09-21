"use client";

import { useEffect } from "react";

export default function UniversNumerique() {
  useEffect(() => {
    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationEnAttente = null;

    function actualiserScene() {
      if (mouvementReduit.matches || animationEnAttente) return;

      animationEnAttente = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--defilement", window.scrollY);
        animationEnAttente = null;
      });
    }

    actualiserScene();
    window.addEventListener("scroll", actualiserScene, { passive: true });

    return () => {
      window.removeEventListener("scroll", actualiserScene);
      if (animationEnAttente) window.cancelAnimationFrame(animationEnAttente);
    };
  }, []);

  return (
    <div className="universNumerique" aria-hidden="true">
      <svg className="universNumerique__liaisons" viewBox="0 0 620 620" fill="none">
        <path d="M105 292C176 292 188 163 305 163C425 163 430 286 518 286" />
        <path d="M114 405C230 405 225 485 354 485C447 485 470 416 535 416" />
        <path d="M310 164V484" />
      </svg>

      <div className="objetNumerique objetNumerique--cloud">
        <svg viewBox="0 0 96 64" fill="none">
          <path d="M27 52H74C84 52 90 45 90 36C90 27 83 20 74 20C70 10 61 5 51 7C42 8 35 15 33 24C21 20 10 28 10 39C10 46 17 52 27 52Z" />
          <path d="M38 34L48 25L58 34M48 26V45" />
        </svg>
        <span>Cloud</span>
      </div>

      <div className="objetNumerique objetNumerique--serveur">
        <svg viewBox="0 0 86 100" fill="none">
          <rect x="9" y="8" width="68" height="24" rx="3" />
          <rect x="9" y="38" width="68" height="24" rx="3" />
          <rect x="9" y="68" width="68" height="24" rx="3" />
          <circle cx="20" cy="20" r="2" /><circle cx="20" cy="50" r="2" /><circle cx="20" cy="80" r="2" />
          <path d="M29 20H66M29 50H66M29 80H66" />
        </svg>
        <span>Datacenter</span>
      </div>

      <div className="objetNumerique objetNumerique--securite">
        <svg viewBox="0 0 82 92" fill="none">
          <path d="M41 7L70 18V40C70 61 58 76 41 84C24 76 12 61 12 40V18L41 7Z" />
          <path d="M29 44L37 52L54 34" />
        </svg>
        <span>Security</span>
      </div>

      <div className="objetNumerique objetNumerique--reseau">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="12" /><circle cx="17" cy="22" r="7" /><circle cx="82" cy="18" r="7" /><circle cx="85" cy="77" r="7" /><circle cx="17" cy="81" r="7" />
          <path d="M40 42L23 27M59 41L76 24M60 58L79 72M40 59L23 76" />
        </svg>
        <span>Network</span>
      </div>

      <div className="universNumerique__centre"><span>IX</span><small>SYSTÈME ACTIF</small></div>

      <div className="journalSysteme">
        <span>SYS.INOX / 01</span>
        <div className="journalSysteme__lignes">
          <small>INFRA_LINK · READY</small>
          <small>CLOUD_NODE · ACTIVE</small>
          <small>NETWORK_FLOW · SYNC</small>
        </div>
      </div>
    </div>
  );
}
