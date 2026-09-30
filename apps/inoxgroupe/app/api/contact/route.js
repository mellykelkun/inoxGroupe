import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import {
  contactIsConfigured,
  createContactRequest,
} from "../../../lib/supabase/contact-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROFILE_TYPES = new Set(["entreprise", "particulier"]);
const PROJECT_STAGES = new Set(["idee", "cadrage", "prestataire", "deploiement", "incident"]);
const TIMELINES = new Set(["urgent", "1-mois", "1-3-mois", "3-mois-plus", "a-definir"]);
const CONTACT_MODES = new Set(["email", "telephone", "indifferent"]);
const NEED_AREAS = new Set([
  "Datacenter, cloud & productivité",
  "Réseaux & cybersécurité",
  "Développement & intégration",
  "Audit & conseil",
  "Formation, assistance & support",
  "Autre besoin",
]);

function response(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function clean(value) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    : "";
}

function validate(payload) {
  const request = {
    profileType: clean(payload.typeProfil).toLowerCase(),
    organization: clean(payload.organisation),
    jobTitle: clean(payload.fonction),
    fullName: clean(payload.nomComplet),
    email: clean(payload.email).toLowerCase(),
    phone: clean(payload.telephone),
    location: clean(payload.localisation),
    needArea: clean(payload.domaineBesoin),
    projectStage: clean(payload.avancementProjet).toLowerCase(),
    desiredTimeline: clean(payload.echeanceSouhaitee).toLowerCase(),
    message: clean(payload.message),
    preferredContact: clean(payload.modeContact).toLowerCase(),
    preferredTime: clean(payload.creneauContact),
  };

  const invalid =
    !PROFILE_TYPES.has(request.profileType) ||
    (request.profileType === "entreprise" && (request.organization.length < 2 || request.organization.length > 180)) ||
    request.jobTitle.length > 120 ||
    request.fullName.length < 2 || request.fullName.length > 140 ||
    !EMAIL.test(request.email) || request.email.length > 254 ||
    request.phone.length < 5 || request.phone.length > 40 ||
    request.location.length < 2 || request.location.length > 180 ||
    !NEED_AREAS.has(request.needArea) ||
    !PROJECT_STAGES.has(request.projectStage) ||
    !TIMELINES.has(request.desiredTimeline) ||
    request.message.length < 10 || request.message.length > 5000 ||
    !CONTACT_MODES.has(request.preferredContact) ||
    request.preferredTime.length > 180;

  return invalid ? null : request;
}

function fingerprint(request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "adresse-inconnue";
  const secret = process.env.CONTACT_HASH_SECRET || process.env.FORUM_HASH_SECRET;
  if (!secret || secret === "[SENSITIVE]") throw new Error("CONTACT_HASH_SECRET_MISSING");
  return createHmac("sha256", secret).update(address).digest("hex");
}

export async function POST(httpRequest) {
  if (!contactIsConfigured()) {
    return response({ error: "Le service de demande est momentanément indisponible." }, 503);
  }

  const size = Number(httpRequest.headers.get("content-length") || 0);
  if (size > 25_000) return response({ error: "La demande est trop volumineuse." }, 413);

  let payload;
  try {
    payload = await httpRequest.json();
  } catch {
    return response({ error: "La demande transmise est invalide." }, 400);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return response({ error: "La demande transmise est invalide." }, 400);
  }
  if (clean(payload.website)) return response({ error: "Envoi refusé." }, 400);
  if (payload.consentement !== true) {
    return response({ error: "Votre accord est nécessaire pour transmettre la demande." }, 400);
  }

  const contactRequest = validate(payload);
  if (!contactRequest) {
    return response({ error: "Vérifiez les informations obligatoires avant l’envoi." }, 400);
  }

  try {
    const id = await createContactRequest(contactRequest, fingerprint(httpRequest));
    return response({ reference: `INOX-${String(id).padStart(6, "0")}` }, 201);
  } catch (error) {
    if (`${error?.message || ""}`.includes("CONTACT_RATE_LIMIT")) {
      return response({ error: "Plusieurs demandes ont déjà été reçues. Réessayez dans quinze minutes." }, 429);
    }
    console.error("Enregistrement de la demande impossible", error);
    return response({ error: "La demande n’a pas pu être enregistrée. Réessayez dans quelques minutes." }, 500);
  }
}
