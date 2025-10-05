// components/ReactionBar.tsx
'use client';

import { useMemo } from 'react';

export type ReactionType = 'SHADE' | 'BOO' | 'MUM';
export type ReactionCounts = { SHADE: number; BOO: number; MUM: number };

type Props = {
  counts: ReactionCounts;
  loading?: boolean;
  userReaction?: ReactionType | null;
  onReact: (type: ReactionType) => void;

  // NEW (optional)
  onToggleComments?: () => void;
  commentCount?: number;
  commentsOpen?: boolean;
};

const btnBase =
  'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition select-none ' +
  'focus:outline-none focus:ring-2 disabled:opacity-50';

export default function ReactionBar({
  counts,
  loading = false,
  userReaction = null,
  onReact,

  onToggleComments,
  commentCount,
  commentsOpen = false,
}: Props) {
  const items = useMemo(
    () =>
      [
        {
          key: 'SHADE' as const,
          label: 'KYS 😇',
          class:
            'border border-fuchsia-600/30 bg-fuchsia-600/15 text-fuchsia-200 ' +
            'hover:bg-fuchsia-600/25 focus:ring-fuchsia-500/40',
        },
        {
          key: 'BOO' as const,
          label: 'Boo',
          class:
            'border border-rose-700/30 bg-rose-700/10 text-rose-200 ' +
            'hover:bg-rose-700/20 focus:ring-rose-500/40',
        },
        {
          key: 'MUM' as const,
          label: 'Screw you',
          class:
            'border border-zinc-700/50 bg-zinc-800/40 text-zinc-300 ' +
            'hover:bg-zinc-800/60 focus:ring-zinc-600/40',
        },
      ] as const,
    []
  );

  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2">
        {items.map((it) => {
          const active = userReaction === it.key;
          return (
            <button
              key={it.key}
              type="button"
              disabled={loading}
              onClick={() => onReact(it.key)}
              className={[
                btnBase,
                it.class,
                active ? 'ring-2 ring-offset-0 ring-white/10' : '',
              ].join(' ')}
              aria-pressed={active}
            >
              <span>{it.label}</span>
              <span className="rounded-md bg-black/20 px-1 text-xs">
                {counts[it.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Comments toggle (optional) */}
      {onToggleComments && (
        <button
          type="button"
          onClick={onToggleComments}
          className={[
            btnBase,
            commentsOpen
              ? 'border border-cyan-600/30 bg-cyan-600/15 text-cyan-200 ring-2 ring-white/10'
              : 'border border-cyan-700/30 bg-cyan-700/10 text-cyan-200 hover:bg-cyan-700/20 focus:ring-cyan-500/40',
          ].join(' ')}
        >
          <CommentIcon className="h-4 w-4" />
          <span>Comments</span>
          {typeof commentCount === 'number' && (
            <span className="rounded-md bg-black/20 px-1 text-xs">
              {commentCount}
            </span>
          )}
        </button>
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
