"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type EditorialStatus = "draft" | "published" | "archived";
type EditorialCategory = "actualite" | "expertise" | "conseil" | "evenement" | "vie-inox";
type EditorialImage = { path: string; url: string; alt: string };

type EditorialPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: EditorialCategory;
  author_name: string;
  status: EditorialStatus;
  published_at: string | null;
  updated_at: string;
  images: EditorialImage[] | null;
};

type EditorialForm = {
  title: string;
  excerpt: string;
  body: string;
  category: EditorialCategory;
  existingImages: EditorialImage[];
  files: File[];
};

const categoryLabels: Record<EditorialCategory, string> = {
  actualite: "Actualité",
  expertise: "Expertise",
  conseil: "Conseil",
  evenement: "Événement",
  "vie-inox": "Vie INOX",
};

const statusLabels: Record<EditorialStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

const emptyForm: EditorialForm = {
  title: "",
  excerpt: "",
  body: "",
  category: "actualite",
  existingImages: [],
  files: [],
};

function formatDate(value: string | null) {
  if (!value) return "Non publié";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Africa/Abidjan" }).format(new Date(value));
}

function imageList(post: EditorialPost): EditorialImage[] {
  return Array.isArray(post.images) ? post.images : [];
}

export default function EditorialWorkspace({ refreshKey = 0 }: { refreshKey?: number }) {
  const [posts, setPosts] = useState<EditorialPost[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<EditorialForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("Chargement des publications…");

  const selected = useMemo(() => posts.find((post) => post.id === selectedId) ?? null, [posts, selectedId]);
  const previews = useMemo(() => form.files.map((file) => ({ file, url: URL.createObjectURL(file) })), [form.files]);

  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);

  const loadPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/editorial", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json() as { posts: EditorialPost[] };
      setPosts(data.posts);
      setSelectedId((current) => data.posts.some((post) => post.id === current) ? current : null);
      setNotice(data.posts.length ? "Publications chargées." : "Aucune publication créée.");
    } catch {
      setNotice("Les publications ne sont pas disponibles pour le moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadPosts(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadPosts, refreshKey]);

  function newPost() {
    setSelectedId(null);
    setForm({ ...emptyForm, existingImages: [], files: [] });
    setNotice("Nouvelle publication prête à être rédigée.");
  }

  function selectPost(post: EditorialPost) {
    setSelectedId(post.id);
    setForm({ title: post.title, excerpt: post.excerpt, body: post.body, category: post.category, existingImages: imageList(post), files: [] });
  }

  function addFiles(files: File[]) {
    setForm((current) => ({ ...current, files: [...current.files, ...files].slice(0, 10 - current.existingImages.length) }));
  }

  async function save(status: "draft" | "published" | "archived") {
    setPending(true);
    setNotice("");
    const isNew = selectedId === null;
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("excerpt", form.excerpt);
    payload.append("body", form.body);
    payload.append("category", form.category);
    payload.append("status", status);
    payload.append("existingImages", JSON.stringify(form.existingImages));
    if (!isNew) {
      payload.append("id", String(selectedId));
      payload.append("action", status === "published" ? "publish" : status === "archived" ? "archive" : "draft");
    }
    form.files.forEach((file) => payload.append("images", file));

    const response = await fetch("/api/admin/editorial", { method: isNew ? "POST" : "PATCH", body: payload });
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as { error?: string };
      const messages: Record<string, string> = {
        slug_already_exists: "Une publication utilise déjà ce titre.",
        too_many_images: "Une publication peut contenir 10 images maximum.",
        invalid_image: "Ajoutez uniquement des images JPG, PNG, WebP, GIF ou AVIF de 8 Mo maximum.",
        image_upload_failed: "Les images n’ont pas pu être téléversées.",
      };
      setNotice(messages[data.error ?? ""] ?? "La publication n’a pas pu être enregistrée.");
      setPending(false);
      return;
    }

    const data = await response.json() as { post: EditorialPost };
    setSelectedId(data.post.id);
    setForm((current) => ({ ...current, existingImages: imageList(data.post), files: [] }));
    setNotice(status === "published" ? "Publication mise en ligne sur le site Expertises." : status === "archived" ? "Publication archivée." : "Brouillon enregistré.");
    await loadPosts();
    setPending(false);
  }

  return (
    <div className="editorial-admin-workspace">
      <div className="editorial-admin-toolbar">
        <div><span className="card-label">Publication partagée</span><h2>Journal INOX</h2><p>Rédigez ici les contenus qui seront visibles sur le site Expertises après publication.</p></div>
        <button className="forum-primary-action" type="button" onClick={newPost}>Nouvelle publication</button>
      </div>

      <div className="editorial-admin-grid">
        <section className="panel editorial-admin-list">
          <div className="panel-heading"><div><span className="card-label">Contenus</span><h2>{posts.length} publication{posts.length > 1 ? "s" : ""}</h2></div></div>
          {loading ? <p className="empty-state">Chargement…</p> : null}
          {!loading && !posts.length ? <p className="empty-state">Commencez par créer une publication.</p> : null}
          <div className="editorial-admin-list__items">
            {posts.map((post) => (
              <button type="button" className={selectedId === post.id ? "is-active" : ""} onClick={() => selectPost(post)} key={post.id}>
                <span><small>{categoryLabels[post.category]}</small><strong>{post.title}</strong><em>{formatDate(post.published_at)}</em></span>
                <b className={`editorial-status editorial-status--${post.status}`}>{statusLabels[post.status]}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="panel editorial-editor">
          <div className="panel-heading"><div><span className="card-label">{selected ? `INOX-${String(selected.id).padStart(6, "0")}` : "Nouveau contenu"}</span><h2>{selected ? "Modifier la publication" : "Rédiger une publication"}</h2></div>{selected ? <span className={`editorial-status editorial-status--${selected.status}`}>{statusLabels[selected.status]}</span> : null}</div>
          <div className="editorial-form">
            <label>Titre<input value={form.title} maxLength={180} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Un titre précis pour le fil INOX" /></label>
            <label>Catégorie<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as EditorialCategory })}>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label className="is-wide">Résumé<textarea value={form.excerpt} maxLength={500} rows={3} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} placeholder="Le bénéfice ou l’idée principale en quelques lignes" /></label>
            <label className="is-wide">Contenu<textarea value={form.body} maxLength={20000} rows={12} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Développez l’information à partager. Séparez les paragraphes par une ligne vide." /></label>
            <label className="is-wide editorial-images-field">Illustrations ({form.existingImages.length + form.files.length}/10)
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple disabled={form.existingImages.length + form.files.length >= 10} onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} />
              <small>JPG, PNG, WebP, GIF ou AVIF · 8 Mo maximum par image · 10 images maximum</small>
              <div className="editorial-image-grid">
                {form.existingImages.map((image) => <div className="editorial-image-preview" key={image.path}><Image src={image.url} alt={image.alt} fill unoptimized sizes="96px" /><button type="button" onClick={() => setForm((current) => ({ ...current, existingImages: current.existingImages.filter((item) => item.path !== image.path) }))}>Retirer</button></div>)}
                {previews.map(({ file, url }) => <div className="editorial-image-preview" key={`${file.name}-${file.lastModified}`}><Image src={url} alt="Nouvelle illustration" fill unoptimized sizes="96px" /><button type="button" onClick={() => setForm((current) => ({ ...current, files: current.files.filter((item) => item !== file) }))}>Retirer</button></div>)}
              </div>
            </label>
          </div>
          <div className="editorial-editor__actions"><span role="status">{notice}</span><div><button type="button" disabled={pending || !form.title || !form.excerpt || !form.body} onClick={() => save("draft")}>Enregistrer le brouillon</button>{selected?.status === "published" ? <button type="button" className="danger-action" disabled={pending} onClick={() => save("archived")}>Archiver</button> : null}<button type="button" className="forum-primary-action" disabled={pending || !form.title || !form.excerpt || !form.body} onClick={() => save("published")}>{pending ? "Enregistrement…" : "Publier sur le site"}</button></div></div>
        </section>
      </div>
    </div>
  );
}
