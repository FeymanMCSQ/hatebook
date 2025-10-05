// components/CommentBox.tsx
'use client';

import { useState } from 'react';

type UserLite = {
  id: string;
  username: string;
  avatarUrl?: string | null;
};

export type Reply = {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  author: UserLite;
};

type Props = {
  postId: string;
  initialReplies?: Reply[];
  onPosted?: (reply: Reply) => void; // optional hook for parent
};

type ApiSuccess = { success: true; data: Reply };
type ApiError = { success?: false; error: unknown };

export default function CommentBox({
  postId,
  initialReplies = [],
  onPosted,
}: Props) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || loading) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: text }),
      });

      let data: ApiSuccess | ApiError;
      try {
        data = (await res.json()) as ApiSuccess | ApiError;
      } catch {
        setErrorMsg(`Unexpected response (status ${res.status})`);
        return;
      }

      if (!res.ok || !('success' in data) || !data.success) {
        setErrorMsg(
          'error' in data ? String(data.error) : `HTTP ${res.status}`
        );
        return;
      }

      // Append the new reply
      const newReply: Reply = {
        ...data.data,
        createdAt: new Date(data.data.createdAt).toISOString(),
      };

      setReplies((prev) => [...prev, newReply]);
      setContent('');
      onPosted?.(newReply);
    } catch (err) {
      setErrorMsg('Failed to post. Are you signed in?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="mb-2 flex items-center gap-2 text-zinc-300">
        <CommentIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Comments</span>
        <span className="text-xs text-zinc-500">({replies.length})</span>
      </div>

      {/* <form onSubmit={submit} className="mb-3 flex items-start gap-2">
        <textarea
          className="min-h-[44px] flex-1 rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-sm outline-none placeholder:text-zinc-500"
          placeholder="Say something cutting…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || content.trim().length === 0}
          className="rounded-lg bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
        >
          {loading ? 'Posting…' : 'Reply'}
        </button>
      </form> */}

      {errorMsg && <p className="mb-2 text-xs text-rose-400">{errorMsg}</p>}

      {replies.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No comments yet. Be the first to boo politely.
        </p>
      ) : (
        <ul className="space-y-3">
          {replies.map((r) => (
            <li key={r.id} className="flex gap-3">
              <img
                src={
                  r.author.avatarUrl ??
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                    r.author.username
                  )}`
                }
                alt=""
                className="mt-0.5 h-8 w-8 shrink-0 rounded-full border border-zinc-800 bg-zinc-950 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100">
                    {r.author.username}
                  </span>
                  <time className="text-xs text-zinc-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="whitespace-pre-wrap text-sm text-zinc-200">
                  {r.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 8h10M7 12h7" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-4 4V6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
