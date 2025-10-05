import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import HateMatchClient from '@/components/HateMatchClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// tiny deterministic hash (same as we used elsewhere)
function fnv1a(str: string) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

// start of the current 10-minute slot (keeps both clients synced)
function slotStartMs(durationMin = 10) {
  const dur = durationMin * 60_000;
  const now = Date.now();
  return now - (now % dur);
}

export default async function HateMatchWithPage({
  params,
}: {
  params: { username: string };
}) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center text-zinc-400">
        Sign in to start a hate match.
      </div>
    );
  }

  // me
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, avatarUrl: true },
  });
  if (!me) return <div className="p-6 text-zinc-400">User not found.</div>;

  // opponent from the URL
  const rawOpponent = await prisma.user.findUnique({
    where: { username: params.username },
    select: { username: true, avatarUrl: true },
  });

  let opponent = rawOpponent; // type: { username: string; avatarUrl: string | null } | null

  // if someone points to themself, pick a random other user as backup
  if (!opponent || opponent.username === me.username) {
    const candidates = await prisma.user.findMany({
      where: { id: { not: session.user.id } }, // exclude me
      select: { username: true, avatarUrl: true },
      take: 100,
    });
    if (candidates.length === 0) {
      return <div className="p-6 text-zinc-400">Need more users.</div>;
    }
    opponent = candidates[Math.floor(Math.random() * candidates.length)];
  }

  // shared room: usernames sorted + current 10-min slot ⇒ deterministic id
  const start = slotStartMs(10);
  const matchId =
    'HM-' +
    fnv1a([me.username, opponent.username].sort().join('::') + ':' + start);
  const endsAtISO = new Date(start + 10 * 60_000).toISOString();

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-5">
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <h1 className="text-xl font-semibold text-zinc-100">Hate Match</h1>
        <p className="mt-1 text-sm text-zinc-400">
          You vs @{opponent.username}. You’ve got{' '}
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
          Room is stable for the current 10-minute slot. Share this URL with
          your rival to join the same room.
        </p>
      </div>
    </div>
  );
}
