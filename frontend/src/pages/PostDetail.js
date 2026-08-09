import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { getPost, getPosts } from "@/lib/api";
import FadeUp from "@/components/FadeUp";

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [more, setMore] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    getPost(slug).then(setPost).catch(() => setPost(null));
    getPosts().then((d) => setMore(d.filter((x) => x.slug !== slug).slice(0, 3))).catch(() => {});
  }, [slug]);

  if (!post) return <div className="container-lux py-40 text-center text-[color:var(--lux-ivory)]/50">Loading article…</div>;

  return (
    <div>
      <div className="relative h-[52vh] min-h-[360px]">
        <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-lux pb-10">
            <div className="flex items-center gap-3 text-xs mb-4">
              <span className="rounded-full bg-[rgba(212,175,55,0.15)] text-gold px-3 py-1 uppercase tracking-wider">{post.category}</span>
              <span className="inline-flex items-center gap-1.5 text-[color:var(--lux-ivory)]/70"><CalendarDays className="h-3.5 w-3.5" /> {post.date}</span>
              <span className="inline-flex items-center gap-1.5 text-[color:var(--lux-ivory)]/70"><User className="h-3.5 w-3.5" /> {post.author}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-ivory leading-tight max-w-4xl">{post.title}</h1>
          </div>
        </div>
      </div>

      <div className="container-lux py-14 max-w-3xl">
        <Link to="/insights" className="inline-flex items-center gap-2 text-sm text-gold mb-8"><ArrowLeft className="h-4 w-4" /> Back to Insights</Link>
        {post.excerpt && <p className="font-display text-xl text-ivory leading-snug mb-6">{post.excerpt}</p>}
        <div className="prose-invert space-y-5">
          {(post.content || "").split("\n").filter((l) => l.trim()).map((para, i) => (
            <p key={i} className="text-[color:var(--lux-ivory)]/75 leading-relaxed">{para}</p>
          ))}
        </div>
      </div>

      {more.length > 0 && (
        <section className="section-pad bg-[color:var(--lux-obsidian)] border-t border-[color:var(--border-hairline)]">
          <div className="container-lux">
            <h2 className="font-display text-2xl text-ivory mb-8">More Insights</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {more.map((p) => (
                <Link key={p.slug} to={`/insights/${p.slug}`} className="group block rounded-2xl bg-glass hairline overflow-hidden lift">
                  <div className="aspect-[16/10] overflow-hidden"><img src={p.cover_image} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                  <div className="p-4"><div className="text-xs text-gold uppercase tracking-wider">{p.category}</div><div className="text-ivory font-semibold text-sm mt-1.5">{p.title}</div></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
