import { intakeDraftFromMessage } from "../../../../packages/assistant-intake.js";

export const OFFICIAL_CONTACT = Object.freeze({
  email: "contact@inox-group.net",
  phone: "+225 07 08 20 15 15",
  phoneHref: "tel:+2250708201515",
  website: "https://inox-groupe.vercel.app/",
});

const REQUEST_ACTION = /(?:\b(?:faire|fais|faites|creer|envoyer|transmettre|deposer|soumettre|ouvrir|preparer)\b.{0,48}\b(?:demande|dossier|contact)\b|\b(?:je veux|je souhaite|j['’]aimerais)\b.{0,48}\b(?:une demande|etre recontacte|vous contacter)\b)/i;
const CONTACT_DETAILS = /\b(?:coordonnees?|e-?mail|mail|courriel|adresse mail|telephone|numero|site web|site internet|site officiel|votre site|adresse du site|comment (?:vous|te) (?:joindre|contacter))\b/i;
const FORM_REQUEST = /\b(?:ouvrir|ouvre|ouvrez|remplir|complete[rz]?|afficher|affiche|montre[rz]?|acceder|acces|veux|souhaite|voudrais|aimerais|fais|faites|creer|cree)\b.{0,72}\b(?:formulaire|fiche de contact)\b|\b(?:formulaire|fiche de contact)\b.{0,48}\b(?:ouvrir|remplir|completer)\b/i;
const FORM_REFUSAL = /\b(?:ne\s+)?(?:veux|souhaite|voudrais|aimerais)\s+pas\b.{0,48}\b(?:formulaire|demande)\b|\b(?:sans|pas de)\s+formulaire\b/i;
const CAPABILITY_QUESTION = /\b(?:tes|vos)\s+(?:outils|fonctions|fonctionnalites|capacites)\b|\b(?:quels?|quelles?)\b.{0,40}\b(?:outils|fonctions|capacites)\b.{0,40}\b(?:tu|vous|possede|dispose|utilise)\b|\b(?:outils|fonctions)\s+internes\b|\b(?:que peux|que pouvez)\b.{0,12}\bfaire\b/i;
const INTERNAL_TERMS = /\b(?:prepare_contact_request|get_verified_contact|request_contact_field|tool_calls?|function_call|system_prompt|developer_prompt|groq_api_key|supabase_secret_key|prompt syst[eè]me|instructions? internes?)\b|\bgsk_[a-z0-9]{12,}\b/i;
const INTERNAL_QUESTION = /\b(?:prompt|instructions? (?:internes?|syst[eè]me)|cl[eé] (?:api|secr[eè]te)|api.?key|variables? d.environnement|noms? (?:exacts? )?(?:de )?(?:tes|vos) (?:outils|fonctions))\b/i;
const FIELD_REQUEST = /\b(?:ajout\w*|pr[eé]vo\w*|cr[eé]\w*|pos\w*)\b.{0,70}\b(?:champ|question|pr[eé]cision)\b|\b(?:champ|question|pr[eé]cision)\b.{0,35}\b(?:facultatif|suppl[eé]mentaire)\b/i;

const normalizedText = (value) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function wantsFormOpened(message) {
  return typeof message === "string" && !FORM_REFUSAL.test(normalizedText(message)) && (FORM_REQUEST.test(normalizedText(message)) || REQUEST_ACTION.test(normalizedText(message)) || FIELD_REQUEST.test(normalizedText(message)));
}

export function wantsAdditionalField(message) {
  return typeof message === "string" && FIELD_REQUEST.test(normalizedText(message));
}

export { intakeDraftFromMessage };

export function inferredPublicProfile(message) {
  const normalized = normalizedText(typeof message === "string" ? message : "");
  if (/\b(particulier|personnel|personne privee)\b/.test(normalized)) return "particulier";
  if (/\b(entreprise|societe|organisation|professionnel)\b/.test(normalized)) return "entreprise";
  return null;
}

export function classifyPublicAction(message) {
  if (typeof message !== "string") return null;
  const normalized = normalizedText(message);
  if (CAPABILITY_QUESTION.test(normalized) || INTERNAL_QUESTION.test(normalized)) return "describe_capabilities";
  if (FORM_REFUSAL.test(normalized)) return CONTACT_DETAILS.test(normalized) ? "get_verified_contact" : null;
  if (wantsFormOpened(message) || REQUEST_ACTION.test(normalized)) return "prepare_contact_request";
  if (CONTACT_DETAILS.test(normalized)) return "get_verified_contact";
  return null;
}

export const CAPABILITIES_ANSWER = "Je peux vous renseigner sur les expertises INOX, vous orienter vers les pages utiles et vous donner nos coordonnées. Si vous souhaitez nous présenter un besoin, je peux ouvrir le formulaire entreprise ou particulier. Vous vérifiez les informations et décidez seul de l’envoi.";

export function safePublicAnswer(value) {
  return INTERNAL_TERMS.test(value || "") ? CAPABILITIES_ANSWER : value;
}

export function contactDetailsAnswer() {
  return `Vous pouvez joindre INOX à ${OFFICIAL_CONTACT.email} ou au ${OFFICIAL_CONTACT.phone}. Site officiel : ${OFFICIAL_CONTACT.website}`;
}

export const REQUEST_OFFER_ANSWER = "Je peux préparer votre demande. Vérifiez votre besoin et vos coordonnées dans le formulaire, puis confirmez l’envoi. Rien ne sera transmis sans votre accord.";
export const OPEN_FORM_ANSWER = "J’ouvre le formulaire adapté à votre demande. Vérifiez les informations, puis envoyez-le uniquement si vous le souhaitez.";
