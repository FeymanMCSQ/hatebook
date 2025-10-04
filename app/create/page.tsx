'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const text = content.trim();
    if (!text) {
      setErr('Say something petty.');
      return;
    }
    if (text.length > 500) {
      setErr('Max 500 characters.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? 'Failed to create post');
      return;
    }

    // redirect to feed after success
    router.push('/feed');
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <h1 className="text-xl font-semibold text-zinc-100">Create Post</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Craft your most vicious shade. Max 500 characters.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Type your post..."
          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-zinc-100 outline-none focus:border-fuchsia-600/60"
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-zinc-500">{content.length}/500</span>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-fuchsia-700/40 bg-fuchsia-700/20 px-4 py-2 text-sm font-semibold text-fuchsia-100 hover:bg-fuchsia-700/30 disabled:opacity-50"
          >
            {loading ? 'Posting…' : 'Post'}
          </button>
        </div>

        {err && <p className="mt-2 text-sm text-rose-400">{err}</p>}
      </form>
    </div>
  );
}
