const SITE = "https://inox-groupe.vercel.app";

export default function sitemap() {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/forum`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/ecosysteme`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/partenaires`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/immersion-core`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
