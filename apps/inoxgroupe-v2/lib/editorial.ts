export type EditorialImage = {
  url: string;
  alt: string;
};

export type EditorialPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: "actualite" | "expertise" | "conseil" | "evenement" | "vie-inox";
  authorName: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  images: EditorialImage[];
};

type EditorialPostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: EditorialPost["category"];
  author_name: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  images: EditorialImage[] | null;
};

function getConfig() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.inoxstorage_SUPABASE_URL
  )?.trim();
  const key = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.inoxstorage_SUPABASE_PUBLISHABLE_KEY ||
    process.env.inoxstorage_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !key || url === "[SENSITIVE]" || key === "[SENSITIVE]") return null;
  return { url, key };
}

function mapPost(post: EditorialPostRow): EditorialPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    category: post.category,
    authorName: post.author_name,
    publishedAt: post.published_at,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    images: Array.isArray(post.images) ? post.images : [],
  };
}

async function requestPosts(search: URLSearchParams) {
  const config = getConfig();
  if (!config) return [];

  const response = await fetch(`${config.url}/rest/v1/editorial_posts?${search.toString()}`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`EDITORIAL_${response.status}`);
  return (await response.json()) as EditorialPostRow[];
}

export async function getPublishedPosts() {
  const search = new URLSearchParams({
    select: "id,slug,title,excerpt,body,category,author_name,published_at,created_at,updated_at,images",
    status: "eq.published",
    order: "published_at.desc,id.desc",
    limit: "30",
  });
  search.set("published_at", `lte.${new Date().toISOString()}`);
  return (await requestPosts(search)).map(mapPost);
}

export async function getPublishedPost(slug: string) {
  const search = new URLSearchParams({
    select: "id,slug,title,excerpt,body,category,author_name,published_at,created_at,updated_at,images",
    slug: `eq.${slug}`,
    status: "eq.published",
    limit: "1",
  });
  search.set("published_at", `lte.${new Date().toISOString()}`);
  const posts = await requestPosts(search);
  return posts[0] ? mapPost(posts[0]) : null;
}

export function categoryLabel(category: EditorialPost["category"]) {
  return {
    actualite: "Actualité",
    expertise: "Expertise",
    conseil: "Conseil",
    evenement: "Événement",
    "vie-inox": "Vie INOX",
  }[category];
}

export function formatEditorialDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "Africa/Abidjan",
  }).format(new Date(value));
}
