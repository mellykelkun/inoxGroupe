export function parseContactStatusCommand(message: string) {
  if (!/\bdemande\b/i.test(message) || !/\b(passe|mets?|modifie|change|classe)\b/i.test(message)) return null;
  const match = message.match(/\bINOX[-\s]*0*(\d{1,9})\b/i) || message.match(/\bdemande\s*#?0*(\d{1,9})\b/i);
  if (!match) return null;
  const statuses: Array<[RegExp, string]> = [
    [/\b(en cours|in.progress)\b/i, "in_progress"],
    [/\b(nouveau|nouvelle)\b/i, "new"],
    [/\b(trait[ée]e?|termin[ée]e?)(?=\W|$)/i, "completed"],
    [/\b(archiv[ée]e?)(?=\W|$)/i, "archived"],
    [/\b(ind[ée]sirable|spam)(?=\W|$)/i, "spam"],
  ];
  const status = statuses.find(([pattern]) => pattern.test(message))?.[1];
  return status ? { id: Number(match[1]), status } : null;
}

export function parseContactDeleteCommand(message: string) {
  if (!/\b(supprim(?:e|er|ez)|effac(?:e|er|ez)|retir(?:e|er|ez))\b/i.test(message) || !/\b(demandes?|INOX[-\s]*0*\d+)\b/i.test(message)) return null;
  const references = [...message.matchAll(/\bINOX[-\s]*0*(\d{1,9})\b|\bdemande\s*#?0*(\d{1,9})\b/gi)];
  const ids = references.map((match) => Number(match[1] || match[2]));
  const allNumbers = message.match(/\b\d+\b/g) || [];
  if (!ids.length || ids.length > 20 || new Set(ids).size !== ids.length || ids.some((id) => id <= 0) || allNumbers.length !== ids.length) return null;
  return { ids };
}

export function isAdminWriteRequest(message: string) {
  return !/^\s*(comment|explique|quels?|pourquoi|peux-tu m'expliquer)\b/i.test(message)
    && /\b(ajoute|invite|publie|supprime|supprimer|efface|effacer|retire|retirer|bloque|d[ée]bloque|change|modifie|classe|passe|mets?|cr[ée]e|archive|r[ée]ponds)\b/i.test(message);
}
