import { prisma } from '@/lib/prisma';
import { getDailySacrifice } from '@/lib/sacrifice';
import PostCard from '@/components/Postcard'; // ensure filename matches import
import RoastComposer from '@/components/RoastComposer';

const WEIGHTS = { SHADE: 3, BOO: 1, MUM: 0 } as const;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const revalidate = 10;

export default async function SacrificePage() {
  const sacrifice = await getDailySacrifice(prisma);
  const today = startOfToday();

  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: today },
      OR: [
        {
          content: { contains: `@${sacrifice.username}`, mode: 'insensitive' },
        },
        {
          content: {
            startsWith: `[ROAST @${sacrifice.username}]`,
            mode: 'insensitive',
          },
        },
      ],
    },
    include: {
      author: { select: { username: true, avatarUrl: true } },
      reactions: { select: { type: true, userId: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const byUser = new Map<
    string,
    {
      username: string;
      avatarUrl: string | null | undefined;
      score: number;
      posts: number;
    }
  >();

  for (const p of posts) {
    let s = 0;
    for (const r of p.reactions) s += WEIGHTS[r.type as keyof typeof WEIGHTS];
    const key = p.author.username;
    const prev = byUser.get(key) ?? {
      username: key,
      avatarUrl: p.author.avatarUrl,
      score: 0,
      posts: 0,
    };
    prev.score += s;
    prev.posts += 1;
    byUser.set(key, prev);
  }

  const topRoasters = [...byUser.values()]
    .sort((a, b) => b.score - a.score || b.posts - a.posts)
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-3xl p-4 space-y-5">
      {/* Banner */}
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <div className="flex items-center gap-4">
          <img
            src={
              sacrifice.avatarUrl && sacrifice.avatarUrl.trim() !== ''
                ? sacrifice.avatarUrl
                : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                    sacrifice.username
                  )}`
            }
            alt=""
            className="h-14 w-14 rounded-full border border-zinc-800 object-cover"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-zinc-100">
              Sacrifice of the Day
            </h1>
            <p className="text-zinc-300">
              Today we roast{' '}
              <span className="font-semibold text-zinc-100">
                @{sacrifice.username}
              </span>
              . Throw your best shade. Only <strong>today’s</strong> roasts
              count.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <RoastComposer targetUsername={sacrifice.username} />
        </div>
      </div>

      {/* Scoreboard */}
      {topRoasters.length > 0 && (
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">
            🔥 Top Roasters (today)
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {topRoasters.map((r, i) => (
              <li key={r.username} className="flex items-center gap-3">
                <span className="w-6 text-zinc-500">{i + 1}.</span>
                <img
                  src={
                    r.avatarUrl && r.avatarUrl.trim() !== ''
                      ? r.avatarUrl
                      : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                          r.username
                        )}`
                  }
                  className="h-6 w-6 rounded-full border border-zinc-800 object-cover"
                  alt=""
                />
                <span className="flex-1 truncate text-zinc-100">
                  @{r.username}
                </span>
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  score {r.score}
                </span>
                <span className="text-xs text-zinc-500">({r.posts} posts)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Today’s roast feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5 text-zinc-400">
            No roasts yet. Be the first.
          </div>
        ) : (
          posts.map((p) => (
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
                  const t = { SHADE: 0, BOO: 0, MUM: 0 } as const;
                  const c = { ...t };
                  for (const r of p.reactions) c[r.type]++;
                  return c;
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
    </div>
  );
}
