import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/editorial";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getPublishedPosts();
    return NextResponse.json(
      { posts },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Chargement du fil éditorial impossible", error);
    return NextResponse.json({ error: "editorial_unavailable", posts: [] }, { status: 503 });
  }
}
