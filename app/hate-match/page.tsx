import { prisma } from '@/lib/prisma';
import HateMatchClient from '@/components/HateMatchClient';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // always fresh
export const revalidate = 0;

function randId() {
  // enough for demo; unique per visit
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function chooseOpp<T>(arr: T[], not: T | null): T | null {
  const pool = not ? arr.filter((x) => x !== not) : arr.slice();
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default async function HateMatchPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center text-zinc-400">
        Sign in to start a hate match.
      </div>
    );
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, avatarUrl: true },
  });
  if (!me) return <div className="p-6 text-zinc-400">User not found.</div>;

  const users = await prisma.user.findMany({
    select: { username: true, avatarUrl: true },
    take: 200,
  });
  const opponent =
    chooseOpp(
      users,
      users.find((u) => u.username === me.username)
    ) || users[0];
  if (!opponent)
    return (
      <div className="p-6 text-zinc-400">Need at least 2 users to match.</div>
    );

  const matchId = randId();
  const endsAtISO = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-5">
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <h1 className="text-xl font-semibold text-zinc-100">Hate Match</h1>
        <p className="mt-1 text-sm text-zinc-400">
          You vs a random rival. You’ve got{' '}
          <span className="text-zinc-200 font-semibold">10 minutes</span>.
        </p>
      </div>

      <HateMatchClient
        matchId={matchId}
        me={{ username: me.username, avatarUrl: me.avatarUrl }}
        opponent={{
          username: opponent.username,
          avatarUrl: opponent.avatarUrl,
        }}
        endsAtISO={endsAtISO}
      />

      <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/60 p-4 text-xs text-zinc-500">
        <p>
          How it works (demo): messages are regular posts tagged like{' '}
          <code>[MATCH {'{id}'}]</code>. The feed updates live.
        </p>
      </div>
    </div>
  );
}
