'use client';

import { useMemo } from 'react';

export type ReactionType = 'SHADE' | 'BOO' | 'MUM';

export type ReactionCounts = {
  SHADE: number;
  BOO: number;
  MUM: number;
};

type Props = {
  counts: ReactionCounts;
  loading?: boolean;
  userReaction?: ReactionType | null; // optional highlight
  onReact: (type: ReactionType) => void;
};

const btnBase =
  'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition select-none ' +
  'focus:outline-none focus:ring-2 disabled:opacity-50';

export default function ReactionBar({
  counts,
  loading = false,
  userReaction = null,
  onReact,
}: Props) {
  const items = useMemo(
    () =>
      [
        {
          key: 'SHADE' as const,
          label: 'Shade',
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
          label: 'Mum',
          class:
            'border border-zinc-700/50 bg-zinc-800/40 text-zinc-300 ' +
            'hover:bg-zinc-800/60 focus:ring-zinc-600/40',
        },
      ] as const,
    []
  );

  return (
    <div className="flex items-center gap-2 pt-2">
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
  );
}
