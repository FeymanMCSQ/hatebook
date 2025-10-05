import { prisma } from '@/lib/prisma';
import PostCard from '@/components/Postcard';

export const revalidate = 10;

export default async function HallOfShamePage() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const posts = await prisma.post.findMany({
    where: { createdAt: { gte: since } },
    include: {
      author: { select: { username: true, avatarUrl: true } },
      reactions: { select: { type: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });

  const scored = posts
    .map((p) => {
      let boo = 0,
        total = 0;
      for (const r of p.reactions) {
        total++;
        if (r.type === 'BOO') boo++;
      }
      return { p, boo, total };
    })
    .sort((a, b) => b.boo - a.boo || b.total - a.total)
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl p-4 space-y-4">
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <h1 className="text-xl font-semibold text-zinc-100">Hall of Shame</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Most booed posts in the last 24 hours.
        </p>
      </div>

      {scored.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/60 p-5 text-zinc-400">
          Nothing to shame… yet.
        </div>
      ) : (
        scored.map(({ p }) => (
          <PostCard
            key={p.id}
            post={{
              id: p.id,
              content: p.content,
              createdAt: p.createdAt.toISOString(),
              author: {
                username: p.author.username,
                avatarUrl: p.author.avatarUrl,
              },
              counts: (() => {
                const c = { SHADE: 0, BOO: 0, MUM: 0 } as const;
                const x = { ...c };
                for (const r of p.reactions) x[r.type]++;
                return x;
              })(),
              replies: p.replies.map((r) => ({
                id: r.id,
                content: r.content,
                createdAt: r.createdAt.toISOString(),
                parentId: r.parentId,
                author: {
                  id: r.author.id,
                  username: r.author.username,
                  avatarUrl: r.author.avatarUrl,
                },
              })),
            }}
          />
        ))
      )}
    </div>
  );
}
