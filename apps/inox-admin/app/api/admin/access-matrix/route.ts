import { NextResponse } from "next/server";
import { getRoleAccessMatrix } from "@/lib/auth/access-matrix";
import { authenticateAdmin } from "@/lib/auth/server";
import { canViewRoleAccessMatrix } from "@/lib/auth/types";

export const dynamic = "force-dynamic";

export async function GET() {
  // authenticateAdmin impose déjà une session AAL2 et relit les métadonnées
  // courantes avec la clé serveur avant de retourner l'identité.
  const auth = await authenticateAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.reason },
      { status: auth.reason === "unauthenticated" ? 401 : 403 },
    );
  }
  if (!canViewRoleAccessMatrix(auth.identity.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json(
    { matrix: getRoleAccessMatrix() },
    { headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" } },
  );
}
