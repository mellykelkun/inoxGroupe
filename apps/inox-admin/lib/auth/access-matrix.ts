import "server-only";

import type { AdminRole } from "./types";

export type RoleAccessMatrix = {
  roles: Array<{ id: AdminRole; label: string }>;
  capabilities: Array<{
    area: string;
    action: string;
    grantedTo: AdminRole[];
    detail?: Partial<Record<AdminRole, string>>;
  }>;
};

export function getRoleAccessMatrix(): RoleAccessMatrix {
  return {
    roles: [
      { id: "owner", label: "Propriétaire" },
      { id: "administrator", label: "Administrateur" },
      { id: "moderator", label: "Modérateur" },
      { id: "editor", label: "Éditeur" },
      { id: "viewer", label: "Lecteur" },
    ],
    capabilities: [
      {
        area: "Accès personnel",
        action: "Consulter son espace d’accès et sa session 2FA",
        grantedTo: ["owner", "administrator", "moderator", "editor", "viewer"],
      },
      {
        area: "Présence web",
        action: "Consulter la disponibilité des sites INOX",
        grantedTo: ["owner", "administrator", "moderator", "editor", "viewer"],
      },
      {
        area: "Pilotage",
        action: "Consulter les indicateurs et les demandes de recontact",
        grantedTo: ["owner", "administrator"],
      },
      {
        area: "Pilotage IA",
        action: "Préparer des actions avec confirmation explicite",
        grantedTo: ["owner", "administrator"],
      },
      {
        area: "Forum INOX",
        action: "Modérer les échanges, publier des réponses officielles et gérer les adresses bloquées",
        grantedTo: ["owner", "administrator", "moderator"],
      },
      {
        area: "Journal INOX",
        action: "Créer, modifier, publier et archiver les publications",
        grantedTo: ["owner", "administrator", "editor"],
      },
      {
        area: "Membres",
        action: "Créer des invitations et renouveler les liens des membres en attente",
        grantedTo: ["owner", "administrator"],
      },
      {
        area: "Membres",
        action: "Gérer les comptes Administrateur, Modérateur, Éditeur et Lecteur",
        grantedTo: ["owner"],
        detail: { owner: "Tous les comptes non propriétaires" },
      },
      {
        area: "Membres",
        action: "Gérer les comptes Modérateur, Éditeur et Lecteur",
        grantedTo: ["administrator"],
        detail: { administrator: "Sans gestion du Propriétaire ni des Administrateurs" },
      },
      {
        area: "Gouvernance",
        action: "Consulter cette matrice complète des rôles et autorisations",
        grantedTo: ["owner"],
      },
    ],
  };
}
