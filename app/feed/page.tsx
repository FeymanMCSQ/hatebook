import PostCard from '@/components/Postcard';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

function timeAgo(iso: Date) {
  const d = new Date(iso);
  const diff = Math.max(0, Date.now() - d.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function FeedPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center text-zinc-400">
        Please sign in to see your feed.
      </div>
    );
  }

  // 1) Enemy ids
  const enemyIds = (
    await prisma.enemy.findMany({
      where: { userId: session.user.id },
      select: { enemyId: true },
    })
  ).map((e) => e.enemyId);

  // 2) Enemy posts (exclude yourself)
  const enemyPosts = await prisma.post.findMany({
    where: { authorId: { in: enemyIds, not: session.user.id } },
    include: {
      author: { select: { username: true, avatarUrl: true } },
      // include type + userId so we can compute counts AND highlight the user's choice
      reactions: { select: { type: true, userId: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // 3) Other posts (not enemies, not you)
  const otherPosts = await prisma.post.findMany({
    where: {
      AND: [
        { authorId: { notIn: enemyIds } },
        { authorId: { not: session.user.id } },
      ],
    },
    include: {
      author: { select: { username: true, avatarUrl: true } },
      reactions: { select: { type: true, userId: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // 4) Shape with counts (+ optional userReaction)
  const mapPost = (p: (typeof enemyPosts)[number]) => {
    const counts = { SHADE: 0, BOO: 0, MUM: 0 } as const;
    const tallies = { ...counts };
    for (const r of p.reactions) tallies[r.type]++;

    const userReaction =
      p.reactions.find((r) => r.userId === session.user.id)?.type ?? null;

    return {
      id: p.id,
      content: p.content,
      createdAt: timeAgo(p.createdAt),
      author: p.author,
      counts: tallies,
      userReaction, // PostCard supports highlighting if you pass this
    };
  };

  const posts = [...enemyPosts.map(mapPost), ...otherPosts.map(mapPost)];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-5 rounded-2xl border border-zinc-800/70 bg-zinc-950/50 p-4">
        <h1 className="text-xl font-semibold text-zinc-100">Feed</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Make enemies. Throw shade. Rise in the leaderboard.
        </p>
      </div>

      {enemyPosts.length > 0 && (
        <div className="mb-3 text-xs text-zinc-400">From your enemies</div>
      )}

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
