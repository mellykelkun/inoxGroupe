import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import {
  forumEstConfigure,
  lireMessagesForum,
  publierMessageForum,
} from "../../../../lib/supabase/forum-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES = new Set(["general", "conseil", "support", "projet"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reponse(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function nettoyerTexte(value) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    : "";
}

function valider(payload) {
  const parentId = payload.parentId === null || payload.parentId === undefined
    ? null
    : Number(payload.parentId);
  const message = {
    firstName: nettoyerTexte(payload.firstName),
    lastName: nettoyerTexte(payload.lastName),
    email: nettoyerTexte(payload.email).toLowerCase(),
    subject: nettoyerTexte(payload.subject),
    category: nettoyerTexte(payload.category).toLowerCase(),
    body: nettoyerTexte(payload.body),
    parentId,
  };

  if (
    message.firstName.length < 2 || message.firstName.length > 60 ||
    message.lastName.length < 2 || message.lastName.length > 60 ||
    !EMAIL.test(message.email) || message.email.length > 254 ||
    message.body.length < 10 || message.body.length > 3000 ||
    (parentId !== null && (!Number.isSafeInteger(parentId) || parentId <= 0)) ||
    (parentId === null && (message.subject.length < 5 || message.subject.length > 140)) ||
    (parentId === null && !CATEGORIES.has(message.category))
  ) {
    return null;
  }

  return message;
}

function empreinteRequete(request) {
  const adresse = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "adresse-inconnue";
  return createHmac("sha256", process.env.FORUM_HASH_SECRET)
    .update(adresse)
    .digest("hex");
}

export async function GET() {
  if (!forumEstConfigure()) {
    return reponse({ error: "Le Forum INOX sera disponible très prochainement." }, 503);
  }

  try {
    return reponse({ messages: await lireMessagesForum() });
  } catch (error) {
    console.error("Lecture du forum impossible", error);
    return reponse({ error: "Impossible de charger le forum pour le moment." }, 500);
  }
}

export async function POST(request) {
  if (!forumEstConfigure()) {
    return reponse({ error: "Le Forum INOX sera disponible très prochainement." }, 503);
  }

  const taille = Number(request.headers.get("content-length") || 0);
  if (taille > 20_000) return reponse({ error: "Le message est trop volumineux." }, 413);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return reponse({ error: "Requête invalide." }, 400);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return reponse({ error: "Requête invalide." }, 400);
  }

  if (nettoyerTexte(payload.website)) {
    return reponse({ error: "Envoi refusé." }, 400);
  }
  if (payload.privacyAccepted !== true) {
    return reponse({ error: "Votre accord est nécessaire avant la publication." }, 400);
  }

  const message = valider(payload);
  if (!message) {
    return reponse({ error: "Vérifiez les informations et la longueur du message." }, 400);
  }

  try {
    const resultat = await publierMessageForum(message, empreinteRequete(request));
    return reponse({ message: resultat }, 201);
  } catch (error) {
    const detail = `${error?.message || ""} ${error?.details || ""}`;
    if (detail.includes("RATE_LIMIT")) {
      return reponse({ error: "Trop de messages envoyés. Réessayez dans quelques minutes." }, 429);
    }
    if (detail.includes("EMAIL_BLOCKED")) {
      return reponse({ error: "Cette adresse ne peut plus publier sur le Forum INOX." }, 403);
    }
    if (detail.includes("PARENT_NOT_FOUND")) {
      return reponse({ error: "Cette discussion n’est plus disponible." }, 404);
    }
    if (detail.includes("INVALID_INPUT")) {
      return reponse({ error: "Certaines informations sont invalides." }, 400);
    }
    console.error("Publication forum impossible", error);
    return reponse({ error: "La publication a échoué. Réessayez un peu plus tard." }, 500);
  }
}
