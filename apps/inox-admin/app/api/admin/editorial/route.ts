import { NextResponse, type NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/auth/server";
import { canManageEditorial } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const bucketName = "editorial-media";
const maxImages = 10;
const maxImageBytes = 8 * 1024 * 1024;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const categories = new Set(["actualite", "expertise", "conseil", "evenement", "vie-inox"]);
const statuses = new Set(["draft", "published", "archived"]);

type EditorialImage = { path: string; url: string; alt: string };

type EditorialPostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  author_name: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  images: EditorialImage[] | null;
};

type EditorialResult<T> = { data: T; error: { code?: string; message?: string } | null };
type EditorialPayload = { input: Record<string, unknown>; files: File[] };

function denied(reason: string) {
  return NextResponse.json({ error: reason }, { status: reason === "unauthenticated" ? 401 : 403 });
}

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "";
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 170) || `publication-${Date.now().toString(36)}`;
}

function validText(value: string, min: number, max: number) {
  return value.length >= min && value.length <= max;
}

function publicPostFields() {
  return "id,slug,title,excerpt,body,category,author_name,status,published_at,created_by,created_at,updated_at,images";
}

function isUploadFile(value: FormDataEntryValue): value is File {
  return typeof value !== "string" && typeof value.arrayBuffer === "function" && typeof value.type === "string";
}

async function readPayload(request: NextRequest): Promise<EditorialPayload> {
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return { input: await request.json() as Record<string, unknown>, files: [] };
  }

  const form = await request.formData();
  const input: Record<string, unknown> = {};
  for (const field of ["id", "title", "excerpt", "body", "category", "status", "authorName", "slug", "action", "existingImages"]) {
    const value = form.get(field);
    if (typeof value === "string") input[field] = value;
  }
  return { input, files: form.getAll("images").filter(isUploadFile) };
}

function parseImages(value: unknown): EditorialImage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const image = item as Record<string, unknown>;
    const path = clean(image.path);
    const url = clean(image.url);
    if (!path || !url || !path.startsWith("posts/")) return [];
    return [{ path, url, alt: clean(image.alt).slice(0, 180) || "Illustration INOX" }];
  }).slice(0, maxImages);
}

function validateFiles(files: File[], existingCount: number) {
  if (existingCount + files.length > maxImages) return "too_many_images";
  if (files.some((file) => !imageTypes.has(file.type) || file.size > maxImageBytes)) return "invalid_image";
  return null;
}

function extensionFor(file: File) {
  const extension = file.type.split("/")[1] || "bin";
  return extension === "jpeg" ? "jpg" : extension;
}

async function removeImages(admin: ReturnType<typeof createAdminClient>, images: EditorialImage[]) {
  const paths = images.map((image) => image.path).filter((path) => path.startsWith("posts/"));
  if (paths.length) await admin.storage.from(bucketName).remove(paths);
}

async function uploadImages(admin: ReturnType<typeof createAdminClient>, slug: string, title: string, files: File[]) {
  const uploaded: EditorialImage[] = [];
  try {
    for (const file of files) {
      const path = `posts/${slug}-${crypto.randomUUID()}.${extensionFor(file)}`;
      const { error } = await admin.storage.from(bucketName).upload(path, Buffer.from(await file.arrayBuffer()), {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = admin.storage.from(bucketName).getPublicUrl(path);
      uploaded.push({ path, url: data.publicUrl, alt: title.slice(0, 180) });
    }
    return uploaded;
  } catch (error) {
    await removeImages(admin, uploaded);
    throw error;
  }
}

function retainedImages(input: Record<string, unknown>, current: EditorialImage[]) {
  if (input.existingImages === undefined) return current;
  let parsed: unknown;
  try {
    parsed = JSON.parse(clean(input.existingImages));
  } catch {
    return [];
  }
  const allowed = new Map(current.map((image) => [image.path, image]));
  return parseImages(parsed).flatMap((image) => {
    const stored = allowed.get(image.path);
    return stored ? [{ ...stored, alt: image.alt }] : [];
  });
}

export async function GET() {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);
  if (!canManageEditorial(auth.identity.role)) return denied("insufficient_role");

  const admin = createAdminClient();
  const result = await admin.from("editorial_posts").select(publicPostFields()).order("updated_at", { ascending: false }).order("id", { ascending: false });
  const { data, error } = result as unknown as EditorialResult<EditorialPostRow[] | null>;
  if (error) {
    console.error("Lecture des publications impossible", error);
    return NextResponse.json({ error: "editorial_unavailable" }, { status: 500 });
  }
  return NextResponse.json({ posts: data ?? [] }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);
  if (!canManageEditorial(auth.identity.role)) return denied("insufficient_role");

  let payload: EditorialPayload;
  try { payload = await readPayload(request); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const { input, files } = payload;
  const title = clean(input.title);
  const excerpt = clean(input.excerpt);
  const body = clean(input.body);
  const category = clean(input.category) || "actualite";
  const status = clean(input.status) || "draft";
  const authorName = clean(input.authorName) || "Équipe INOX";
  const imageError = validateFiles(files, 0);

  if (!validText(title, 3, 180) || !validText(excerpt, 10, 500) || !validText(body, 10, 20000)) return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  if (!categories.has(category) || !statuses.has(status) || !validText(authorName, 2, 100)) return NextResponse.json({ error: "invalid_metadata" }, { status: 400 });
  if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });

  const admin = createAdminClient();
  const slug = slugify(clean(input.slug) || title);
  let images: EditorialImage[] = [];
  try { images = await uploadImages(admin, slug, title, files); } catch (error) {
    console.error("Téléversement des illustrations impossible", error);
    return NextResponse.json({ error: "image_upload_failed" }, { status: 500 });
  }

  const result = await admin.from("editorial_posts").insert({
    slug, title, excerpt, body, category, author_name: authorName, status, images,
    published_at: status === "published" ? new Date().toISOString() : null,
    created_by: auth.identity.userId,
  }).select(publicPostFields()).single();
  const { data, error } = result as unknown as EditorialResult<EditorialPostRow | null>;
  if (error || !data) {
    await removeImages(admin, images);
    console.error("Création de la publication impossible", error);
    return NextResponse.json({ error: error?.code === "23505" ? "slug_already_exists" : "editorial_create_failed" }, { status: 500 });
  }

  await admin.from("audit_logs").insert({ admin_user_id: auth.identity.userId, action: status === "published" ? "editorial_published" : "editorial_draft_created", entity_type: "editorial_post", entity_id: String(data.id) });
  return NextResponse.json({ post: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateAdmin();
  if (!auth.ok) return denied(auth.reason);
  if (!canManageEditorial(auth.identity.role)) return denied("insufficient_role");

  let payload: EditorialPayload;
  try { payload = await readPayload(request); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const { input, files } = payload;
  const id = Number(input.id);
  if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const admin = createAdminClient();
  const currentResult = await admin.from("editorial_posts").select(publicPostFields()).eq("id", id).single();
  const { data: current, error: currentError } = currentResult as unknown as EditorialResult<EditorialPostRow | null>;
  if (currentError || !current) return NextResponse.json({ error: "editorial_not_found" }, { status: 404 });

  const action = clean(input.action);
  const nextStatus = action === "publish" ? "published" : action === "archive" ? "archived" : action === "draft" ? "draft" : clean(input.status) || current.status;
  const title = input.title === undefined ? current.title : clean(input.title);
  const excerpt = input.excerpt === undefined ? current.excerpt : clean(input.excerpt);
  const body = input.body === undefined ? current.body : clean(input.body);
  const category = input.category === undefined ? current.category : clean(input.category);
  const authorName = input.authorName === undefined ? current.author_name : clean(input.authorName);
  const slug = input.slug === undefined ? current.slug : slugify(clean(input.slug));
  const currentImages = Array.isArray(current.images) ? current.images : [];
  const retained = retainedImages(input, currentImages);
  const imageError = validateFiles(files, retained.length);

  if (!statuses.has(nextStatus) || !validText(title, 3, 180) || !validText(excerpt, 10, 500) || !validText(body, 10, 20000)) return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  if (!categories.has(category) || !validText(authorName, 2, 100)) return NextResponse.json({ error: "invalid_metadata" }, { status: 400 });
  if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });

  let uploaded: EditorialImage[] = [];
  try { uploaded = await uploadImages(admin, slug, title, files); } catch (error) {
    console.error("Téléversement des illustrations impossible", error);
    return NextResponse.json({ error: "image_upload_failed" }, { status: 500 });
  }
  const images = [...retained, ...uploaded];
  const result = await admin.from("editorial_posts").update({
    slug, title, excerpt, body, category, author_name: authorName, status: nextStatus, images,
    published_at: nextStatus === "published" ? current.published_at ?? new Date().toISOString() : null,
  }).eq("id", id).select(publicPostFields()).single();
  const { data, error } = result as unknown as EditorialResult<EditorialPostRow | null>;

  if (error || !data) {
    await removeImages(admin, uploaded);
    console.error("Mise à jour de la publication impossible", error);
    return NextResponse.json({ error: error?.code === "23505" ? "slug_already_exists" : "editorial_update_failed" }, { status: 500 });
  }

  await removeImages(admin, currentImages.filter((image) => !images.some((next) => next.path === image.path)));
  await admin.from("audit_logs").insert({ admin_user_id: auth.identity.userId, action: action === "publish" ? "editorial_published" : action === "archive" ? "editorial_archived" : "editorial_updated", entity_type: "editorial_post", entity_id: String(id) });
  return NextResponse.json({ post: data });
}
