"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { EditorialPost } from "@/lib/editorial";
import { categoryLabel, formatEditorialDate } from "@/lib/editorial";
import type { PublicSupabaseConfig } from "@/lib/supabase-public";

export function EditorialFeed({
  initialPosts,
  realtimeConfig,
}: {
  initialPosts: EditorialPost[];
  realtimeConfig: PublicSupabaseConfig | null;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [status, setStatus] = useState<"connecting" | "live" | "reconnecting">(
    realtimeConfig ? "connecting" : "reconnecting",
  );

  useEffect(() => {
    if (!realtimeConfig) return;

    let active = true;
    let refreshController: AbortController | undefined;
    const supabase = createClient(realtimeConfig.url, realtimeConfig.publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });

    const refresh = () => {
      refreshController?.abort();
      refreshController = new AbortController();
      setStatus("live");
      fetch("/api/editorial/posts", {
        cache: "no-store",
        signal: refreshController.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error();
          return response.json() as Promise<{ posts: EditorialPost[] }>;
        })
        .then((data) => {
          if (active) setPosts(data.posts);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (active) setStatus("reconnecting");
        });
    };

    const channel = supabase
      .channel("inox-editorial-sync")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admin_sync_state",
          filter: "scope=eq.editorial",
        },
        refresh,
      )
      .subscribe((channelStatus) => {
        if (!active) return;
        if (channelStatus === "SUBSCRIBED") {
          setStatus("live");
          refresh();
          return;
        }
        if (
          channelStatus === "CHANNEL_ERROR" ||
          channelStatus === "TIMED_OUT" ||
          channelStatus === "CLOSED"
        ) {
          setStatus("reconnecting");
        }
      });

    return () => {
      active = false;
      refreshController?.abort();
      void supabase.removeChannel(channel);
    };
  }, [realtimeConfig]);

  return (
    <section className="editorial-section" id="journal">
      <div className="editorial-section__head page-shell">
        <div>
          <p className="network-kicker">Le fil INOX</p>
          <h2>Les idées et les pratiques qui font avancer vos systèmes.</h2>
        </div>
        <div className={`editorial-live editorial-live--${status}`}><i />{status === "live" ? "Actualisé en direct" : status === "connecting" ? "Connexion au fil…" : "Reconnexion…"}</div>
      </div>

      <div className="editorial-layout page-shell">
        {posts.length ? (
          <div className="editorial-grid">
            {posts.map((post) => (
              <article className="editorial-card" key={post.id}>
                {post.images[0] ? <div className="editorial-card__image"><Image src={post.images[0].url} alt={post.images[0].alt} fill unoptimized sizes="(max-width: 760px) 100vw, 33vw" /></div> : null}
                <div className="editorial-card__meta"><span>{categoryLabel(post.category)}</span><time dateTime={post.publishedAt}>{formatEditorialDate(post.publishedAt)}</time></div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <Link href={`/journal/${post.slug}`}>Lire la publication <span>↗</span></Link>
                {post.images.length > 1 ? <small className="editorial-card__count">{post.images.length} illustrations</small> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="editorial-empty">
            <span>01</span>
            <div><h3>Les prochaines publications INOX prendront vie ici.</h3><p>Expertises, conseils et informations utiles seront publiés depuis l’espace d’administration.</p></div>
          </div>
        )}
      </div>
    </section>
  );
}
