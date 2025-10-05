import { prisma } from '@/lib/prisma';

const W = { SHADE: 3, BOO: 1, MUM: 0 } as const;
export const revalidate = 30;

export default async function StatsPage() {
  const [users, posts, reactions, replies, enemies, reacts, reactsWithAuthor] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.reaction.count(),
      prisma.reply.count(),
      prisma.enemy.count(),
      prisma.reaction.groupBy({ by: ['type'], _count: { type: true } }),
      prisma.reaction.findMany({
        select: { type: true, post: { select: { authorId: true } } },
      }),
    ]);

  const byType = { SHADE: 0, BOO: 0, MUM: 0 } as Record<
    'SHADE' | 'BOO' | 'MUM',
    number
  >;
  for (const r of reacts) byType[r.type as keyof typeof byType] = r._count.type;

  const score = new Map<string, number>();
  for (const r of reactsWithAuthor) {
    const aid = r.post.authorId;
    score.set(aid, (score.get(aid) ?? 0) + W[r.type as keyof typeof W]);
  }
  const topUsers = await prisma.user.findMany({
    select: { id: true, username: true },
  });
  const top = topUsers
    .map((u) => ({ username: u.username, score: score.get(u.id) ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const cards = [
    { label: 'Users', value: users },
    { label: 'Posts', value: posts },
    { label: 'Reactions', value: reactions },
    { label: 'Replies', value: replies },
    { label: 'Enemy Links', value: enemies },
  ];

  return (
    <div className="mx-auto max-w-3xl p-5 space-y-6">
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <h1 className="text-xl font-semibold text-zinc-100">Site Stats</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Live snapshot of the chaos.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 text-center"
            >
              <div className="text-2xl font-semibold text-zinc-100">
                {c.value}
              </div>
              <div className="mt-1 text-xs text-zinc-400">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Reaction Mix</h2>
          <ul className="mt-2 space-y-1 text-sm text-zinc-300">
            <li>
              SHADE:{' '}
              <span className="font-semibold text-fuchsia-200">
                {byType.SHADE}
              </span>
            </li>
            <li>
              BOO:{' '}
              <span className="font-semibold text-rose-200">{byType.BOO}</span>
            </li>
            <li>
              MUM:{' '}
              <span className="font-semibold text-zinc-200">{byType.MUM}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">
            Top Shade Authors
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {top.map((t, i) => (
              <li
                key={t.username}
                className="flex items-center justify-between"
              >
                <span className="text-zinc-100">
                  {i + 1}. @{t.username}
                </span>
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  score {t.score}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
