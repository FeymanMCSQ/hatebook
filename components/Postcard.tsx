'use client';

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; avatarUrl?: string | null };
};

export default function PostCard({ post }: { post: Post }) {
  const avatar =
    post.author.avatarUrl ??
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
      post.author.username
    )}`;

  return (
    <article className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] ring-1 ring-black/5 transition hover:border-zinc-700 hover:bg-zinc-900/70">
      <header className="flex items-start gap-3">
        <img
          src={avatar}
          alt=""
          className="h-10 w-10 rounded-full border border-zinc-800 bg-zinc-950 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-zinc-100">
              {post.author.username}
            </span>
            <span className="text-xs text-zinc-500">• {post.createdAt}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-zinc-200">
            {post.content}
          </p>
        </div>
      </header>

      <footer className="mt-3 flex items-center gap-2">
        <button
          className="rounded-lg border border-fuchsia-600/30 bg-fuchsia-600/15 px-3 py-1.5 text-sm text-fuchsia-200 transition hover:bg-fuchsia-600/25"
          type="button"
          title="Throw shade"
        >
          Shade
        </button>
        <button
          className="rounded-lg border border-rose-700/30 bg-rose-700/10 px-3 py-1.5 text-sm text-rose-200 transition hover:bg-rose-700/20"
          type="button"
          title="Boo"
        >
          Boo
        </button>
        <button
          className="rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800/60"
          type="button"
          title="Stay mum"
        >
          Mum
        </button>
      </footer>
    </article>
  );
}
