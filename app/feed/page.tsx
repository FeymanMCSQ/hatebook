import PostCard from '@/components/Postcard';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

function timeAgo(iso: Date) {
  const d = new Date(iso);
  const diff = Math.max(0, Date.now() - d.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
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

  // 1. Find enemy IDs
  const enemies = await prisma.enemy.findMany({
    where: { userId: session.user.id },
    select: { enemyId: true },
  });
  const enemyIds = enemies.map((e) => e.enemyId);

  // 2. Get posts (enemy posts first, then others)
  const enemyPosts = await prisma.post.findMany({
    where: {
      authorId: { in: enemyIds, not: session.user.id },
    },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // 2) Other posts (not enemies, not you)
  const otherPosts = await prisma.post.findMany({
    where: {
      AND: [
        { authorId: { notIn: enemyIds } },
        { authorId: { not: session.user.id } },
      ],
    },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const posts = [...enemyPosts, ...otherPosts].map((p) => ({
    id: p.id,
    content: p.content,
    createdAt: timeAgo(p.createdAt),
    author: { username: p.author.username, avatarUrl: p.author.avatarUrl },
  }));

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Page header */}
      <div className="mb-5 rounded-2xl border border-zinc-800/70 bg-zinc-950/50 p-4 backdrop-blur">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Feed
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Make enemies. Throw shade. Rise in the leaderboard.
        </p>
      </div>

      {/* Enemy posts callout */}
      {enemyPosts.length > 0 && (
        <div className="mb-3 text-xs text-zinc-400">From your enemies</div>
      )}

      {/* Stack of posts */}
      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      {/* Ambient gradient accents */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 opacity-40">
        <div className="mx-auto h-40 max-w-xl rounded-full bg-gradient-to-t from-fuchsia-700/20 to-transparent blur-3xl" />
      </div>
    </div>
  );
}
