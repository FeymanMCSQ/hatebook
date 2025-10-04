// app/u/[username]/page.tsx
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import DeclareEnemyButton from '@/components/DeclareEnemyButton';
import PostCard from '@/components/Postcard';

function avatarFor(username: string) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
    username
  )}`;
}

function timeAgo(d: Date) {
  const diff = Math.max(0, Date.now() - d.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await getServerSession(authConfig);

  // Find the user being viewed
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, avatarUrl: true, bio: true },
  });

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
          <h1 className="text-xl font-semibold text-zinc-200">
            User not found
          </h1>
          <p className="mt-2 text-zinc-400">
            The profile you’re looking for doesn’t exist.
          </p>
        </div>
      </div>
    );
  }

  const viewingSelf = session?.user?.id === user.id;

  // Check if current user already declared this user as enemy
  let alreadyEnemy = false;
  if (session?.user && !viewingSelf) {
    const rel = await prisma.enemy.findUnique({
      where: { userId_enemyId: { userId: session.user.id, enemyId: user.id } },
      select: { id: true },
    });
    alreadyEnemy = !!rel;
  }

  // Load this user's recent posts, with reactions for counts & highlight
  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    include: {
      author: { select: { username: true, avatarUrl: true } },
      reactions: { select: { type: true, userId: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const shaped = posts.map((p) => {
    const counts = { SHADE: 0, BOO: 0, MUM: 0 } as const;
    const tallies = { ...counts };
    for (const r of p.reactions) tallies[r.type]++;
    const userReaction = session?.user
      ? p.reactions.find((r) => r.userId === session.user!.id)?.type ?? null
      : null;

    return {
      id: p.id,
      content: p.content,
      createdAt: timeAgo(p.createdAt),
      author: p.author,
      counts: tallies,
      userReaction,
    };
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl ?? avatarFor(user.username)}
              alt=""
              className="h-14 w-14 rounded-full border border-zinc-800 bg-zinc-900 object-cover"
            />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-zinc-100">
                {user.username}
              </h1>
              <p className="text-sm text-zinc-400">
                {user.bio ?? 'No bio yet. Enemies welcome.'}
              </p>
            </div>
          </div>

          {session?.user && !viewingSelf && (
            <DeclareEnemyButton
              targetUserId={user.id}
              initiallyEnemy={alreadyEnemy}
            />
          )}
        </div>
      </div>

      {/* Their posts */}
      <div className="mt-6 space-y-4">
        {shaped.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
