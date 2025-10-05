// components/PostCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactionBar, { ReactionCounts, ReactionType } from './ReactionBar';
import CommentBox, { Reply } from './commentBox';

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; avatarUrl?: string | null };
  counts?: ReactionCounts;
  userReaction?: ReactionType | null;
  // NEW (optional): pass from your page via Prisma include
  replies?: Reply[];
};

type ReactionSuccess = {
  success: true;
  data: { postId: string; counts: ReactionCounts };
};
type ReactionError = { success?: false; error: string };
type ReactionResponse = ReactionSuccess | ReactionError;

export default function PostCard({ post }: { post: Post }) {
  const avatar =
    post.author.avatarUrl ??
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
      post.author.username
    )}`;

  const [counts, setCounts] = useState<ReactionCounts>(
    post.counts ?? { SHADE: 0, BOO: 0, MUM: 0 }
  );
  const [loading, setLoading] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(
    post.userReaction ?? null
  );

  // NEW: local comments state (toggle only)
  const [commentsOpen, setCommentsOpen] = useState(false);
  const initialReplies = post.replies ?? [];
  const [commentCount, setCommentCount] = useState<number>(
    initialReplies.length
  );

  async function react(type: ReactionType) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      let json: ReactionResponse;
      try {
        json = (await res.json()) as ReactionResponse;
      } catch {
        console.error(`Invalid JSON (status ${res.status})`);
        return;
      }

      if (!res.ok || !('success' in json) || !json.success) {
        console.error('error' in json ? json.error : `HTTP ${res.status}`);
        return;
      }

      setCounts(json.data.counts);
      setUserReaction(type);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] ring-1 ring-black/5 transition hover:border-zinc-700 hover:bg-zinc-900/70">
      <header className="flex items-start gap-3">
        <Link href={`/u/${post.author.username}`} className="shrink-0">
          <img
            src={avatar}
            alt=""
            className="h-10 w-10 rounded-full border border-zinc-800 bg-zinc-950 object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/u/${post.author.username}`}
              className="truncate font-medium text-zinc-100 hover:underline"
            >
              {post.author.username}
            </Link>
            <span className="text-xs text-zinc-500">• {post.createdAt}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-zinc-200">
            {post.content}
          </p>
        </div>
      </header>

      <ReactionBar
        counts={counts}
        loading={loading}
        userReaction={userReaction}
        onReact={react}
        // NEW: wire up comments button
        onToggleComments={() => setCommentsOpen((v) => !v)}
        commentCount={commentCount}
        commentsOpen={commentsOpen}
      />

      {commentsOpen && (
        <CommentBox
          postId={post.id}
          initialReplies={initialReplies}
          onPosted={() => setCommentCount((n) => n + 1)}
        />
      )}
    </article>
  );
}
