import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabel, formatEditorialDate, getPublishedPost } from "@/lib/editorial";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  return post ? { title: `${post.title} | INOX Technologies`, description: post.excerpt } : {};
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  return (
    <main className="post-page">
      <header className="post-header page-shell">
        <Link href="/#journal" className="post-back">← Retour au fil INOX</Link>
        <div className="post-meta"><span>{categoryLabel(post.category)}</span><time dateTime={post.publishedAt}>{formatEditorialDate(post.publishedAt)}</time></div>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <small>Publié par {post.authorName}</small>
      </header>
      <article className="post-body page-shell">
        {post.images.length ? <div className="post-gallery">{post.images.map((image) => <div className="post-gallery__item" key={image.url}><Image src={image.url} alt={image.alt} fill unoptimized sizes="(max-width: 760px) 100vw, 50vw" /></div>)}</div> : null}
        {post.body.split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </article>
    </main>
  );
}
