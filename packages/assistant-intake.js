const normalize = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const REQUEST_ONLY = /\b(?:formulaire|fiche de contact|demande|recontact\w*|contacter|rappel\w*|champ|pr[ée]cision)\b/i;
const REQUEST_DETAIL = /\bpour\s+(?:un|une|mon|notre|le|la)?\s*(?:besoin|projet|demande)?\s*(?:de|d['’]|concernant|au sujet de)\s+(.+)/i;

function requestSummary(message) {
  const withoutContacts = message
    .replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/g, "")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "")
    .trim();
  const sentences = withoutContacts.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  const substance = sentences.find((part) => !REQUEST_ONLY.test(normalize(part)) && part.length >= 10);
  if (substance) return substance.replace(/[?!]$/, ".").slice(0, 1000);
  const detail = withoutContacts.match(REQUEST_DETAIL)?.[1]?.replace(/[?.!]$/, "").trim();
  return detail && detail.length >= 5 && !REQUEST_ONLY.test(normalize(detail)) ? detail.slice(0, 1000) : "";
}

export function intakeDraftFromMessage(message) {
  const text = typeof message === "string" ? message.trim() : "";
  const normalized = normalize(text);
  const areas = [
    [/\b(cloud|datacenter|hebergement|sauvegarde|continuite|collaboratif|stockage)\b/, "Datacenter, cloud & productivité"],
    [/\b(cyber|securis|securit|reseau|interconnexion|telecom|wifi)\w*\b/, "Réseaux & cybersécurité"],
    [/\b(logiciel|application|developpement|integration|site web|automatisation)\w*\b/, "Développement & intégration"],
    [/\b(audit|conseil|strategie|diagnostic)\w*\b/, "Audit & conseil"],
    [/\b(formation|support|assistance|infogerance|maintenance)\w*\b/, "Formation, assistance & support"],
  ];
  const matchedAreas = areas.filter(([pattern]) => pattern.test(normalized));
  const needArea = matchedAreas.length === 1 ? matchedAreas[0][1] : "";
  const projectStage = /\b(incident|panne|attaque|indisponibilite)\b/.test(normalized) ? "incident"
    : /\b(recherche (?:un |d['’]|de )?prestataire|consultation de prestataire)\b/.test(normalized) ? "prestataire"
      : /\b(projet (?:deja )?lance|deploiement en cours)\b/.test(normalized) ? "deploiement" : "";
  const desiredTimeline = /\b(urgent|urgence|immediat|des que possible|au plus vite)\b/.test(normalized) ? "urgent"
    : /\b(dans? (?:un|1) mois|sous (?:un|1) mois)\b/.test(normalized) ? "1-mois"
      : /\b(dans? (?:un|1) a (?:trois|3) mois|dans? (?:deux|2|trois|3) mois)\b/.test(normalized) ? "1-3-mois"
        : /\b(a definir|pas de date)\b/.test(normalized) ? "a-definir" : "";
  return { summary: requestSummary(text), needArea, projectStage, desiredTimeline };
}
