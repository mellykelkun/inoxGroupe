const UNVERIFIED_CLAIM = /(\b(?:intervention|diagnostic|audit|d[ée]placement|visite|maintenance)\s+(?:(?:[àa]\s+)?domicile|sur\s+site|gratuit[es]?)\b|\b(?:technicien|conseiller)\s+(?:se d[ée]place|viendra|vous appellera)\b|\b(?:devis|tarif|prix)\s+(?:transparent|personnalis[ée]|garanti|fixe)\b|\b(?:recontactera|rappellera|interviendra)\s+(?:rapidement|sous\s+\d+|dans\s+\d+)\b|\b(?:pare-feu|firewall|IDS\/IPS|VPN)\b|\b(?:conformit[ée]\s+(?:r[ée]glementaire|aux\s+exigences))\b)/i;

export function groundedPublicAnswer(answer, question, site) {
  const text = typeof answer === "string" ? answer.trim() : "";
  const wrongPage = site === "primary"
    ? /\bpage\s+(?:R[ée]seaux\s*(?:&|et)\s*cybers[ée]curit[ée]|Formation\s*,?\s*Infog[ée]rance\s*(?:&|et)\s*Support)(?=\W|$)/i.test(text)
    : /\bformulaire\s+(?:de\s+la\s+page|sur\s+la\s+page)\b/i.test(text);
  const asksAboutIntervention = /\b(prix|tarif|co[uû]t|devis|diagnostic|domicile|intervention)\b/i.test(question || "");
  if (asksAboutIntervention) {
    return "Les informations publiées par INOX ne permettent pas de confirmer ici le déroulement, le lieu ou le tarif d’une intervention. Si vous le souhaitez, présentez votre besoin dans le formulaire Particulier ou Entreprise de cette conversation ; l’équipe vérifiera ce qu’elle peut vous proposer.";
  }
  if (text && !UNVERIFIED_CLAIM.test(text) && !wrongPage) return text;
  return site === "expertise"
    ? "INOX présente ses domaines d’expertise sur ce site. Je peux vous aider à préciser votre besoin, mais je ne peux pas confirmer un service, une méthode ou un délai qui n’est pas documenté. Quel résultat recherchez-vous ?"
    : "INOX présente notamment les réseaux et la cybersécurité parmi ses domaines d’expertise. Je peux vous aider à préciser votre besoin, mais je ne peux pas confirmer une méthode ou un engagement qui n’est pas documenté. Quel est votre enjeu principal ?";
}
