export const PUBLIC_PAGES = [
  { label: "Accueil INOX", url: "https://inox-groupe.vercel.app/" },
  { label: "Solutions INOX", url: "https://inox-groupe.vercel.app/#solutions" },
  { label: "Contact INOX", url: "https://inox-groupe.vercel.app/#contact" },
  { label: "Forum INOX", url: "https://inox-groupe.vercel.app/forum" },
  { label: "Écosystème INOX", url: "https://inox-groupe.vercel.app/ecosysteme" },
  { label: "Partenaires INOX", url: "https://inox-groupe.vercel.app/partenaires" },
  { label: "Immersion Core", url: "https://inox-groupe.vercel.app/immersion-core" },
  { label: "Accueil Expertises", url: "https://inox-expertises.vercel.app/" },
  { label: "Datacenter, Cloud & Productivité", url: "https://inox-expertises.vercel.app/expertises/datacenter-cloud" },
  { label: "Réseaux & Sécurité", url: "https://inox-expertises.vercel.app/expertises/reseaux-securite" },
  { label: "Digitalisation & Logiciels", url: "https://inox-expertises.vercel.app/expertises/digitalisation-logiciels" },
  { label: "Formation, Infogérance & Support", url: "https://inox-expertises.vercel.app/expertises/formation-infogerance" },
] as const;

export const ADMIN_PAGES = [
  { label: "Vue d’ensemble admin", url: "https://inox-admin.vercel.app/#overview" },
  { label: "Demandes admin", url: "https://inox-admin.vercel.app/#contacts" },
  { label: "Forum admin", url: "https://inox-admin.vercel.app/#forum" },
  { label: "Journal admin", url: "https://inox-admin.vercel.app/#journal" },
  { label: "Présence web admin", url: "https://inox-admin.vercel.app/#presence" },
  { label: "Équipe et accès admin", url: "https://inox-admin.vercel.app/#team" },
] as const;

export function verifiedPage(raw: string, includeAdmin = false) {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port || parsed.search) return null;
    const canonical = `${parsed.origin}${parsed.pathname.replace(/\/$/, "") || "/"}${parsed.hash}`;
    return [...PUBLIC_PAGES, ...(includeAdmin ? ADMIN_PAGES : [])].find((page) => page.url === canonical) ?? null;
  } catch {
    return null;
  }
}

export function pageCatalog(includeAdmin = false) {
  return [...PUBLIC_PAGES, ...(includeAdmin ? ADMIN_PAGES : [])]
    .map((page) => `${page.label} : ${page.url}`)
    .join("\n");
}

export function sanitizePageLinks(text: string, includeAdmin = false) {
  const accepted: string[] = [];
  const emails: string[] = [];
  const withProtectedLinks = text.replace(/\[([^\]]{1,120})\]\(([^\s)]+)\)/gi, (_match, label: string, raw: string) => {
    const page = verifiedPage(raw, includeAdmin);
    if (!page) return label;
    const index = accepted.push(page.url) - 1;
    return `${label} : \uE000${index}\uE001`;
  }).replace(/https?:\/\/[^\s<>()]+/gi, (raw) => {
    const bare = raw.replace(/[.,;!?]+$/, "");
    const page = verifiedPage(bare, includeAdmin);
    if (!page) return "";
    const index = accepted.push(page.url) - 1;
    return `\uE000${index}\uE001${raw.slice(bare.length)}`;
  }).replace(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, (email) => {
    const index = emails.push(email) - 1;
    return `\uE002${index}\uE003`;
  });
  const safe = includeAdmin ? withProtectedLinks : withProtectedLinks
    .replace(/(?<![@\w])www\.[a-z0-9.-]+(?:\/[^\s)]*)?/gi, "")
    .replace(/(?<![@\w])(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]*)?/gi, "");
  return safe.replace(/\uE000(\d+)\uE001/g, (_match, index: string) => accepted[Number(index)] ?? "")
    .replace(/\uE002(\d+)\uE003/g, (_match, index: string) => emails[Number(index)] ?? "")
    .replace(/[ \t]{2,}/g, " ").trim();
}

export function linkedParts(text: string, includeAdmin = false) {
  const parts: Array<{ text: string; href?: string }> = [];
  const pattern = /https:\/\/[^\s<>()]+/gi;
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > offset) parts.push({ text: text.slice(offset, index) });
    const raw = match[0];
    const bare = raw.replace(/[.,;!?]+$/, "");
    const page = verifiedPage(bare, includeAdmin);
    parts.push(page ? { text: page.label, href: page.url } : { text: raw });
    if (page && bare.length < raw.length) parts.push({ text: raw.slice(bare.length) });
    offset = index + raw.length;
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) });
  return parts.length ? parts : [{ text }];
}
