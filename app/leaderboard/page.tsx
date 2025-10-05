// // app/leaderboard/page.tsx
// type Row = {
//   rank: number;
//   username: string;
//   shadeScore: number;
//   enemyCount: number;
//   avatarUrl?: string | null;
// };

// const DATA: Row[] = [
//   { rank: 1, username: 'doctor_doom', shadeScore: 420, enemyCount: 12 },
//   { rank: 2, username: 'lex_luthor', shadeScore: 377, enemyCount: 10 },
//   { rank: 3, username: 'j_jonah_jameson', shadeScore: 311, enemyCount: 8 },
//   { rank: 4, username: 'squidward', shadeScore: 290, enemyCount: 7 },
//   { rank: 5, username: 'stewie_griffin', shadeScore: 260, enemyCount: 9 },
//   { rank: 6, username: 'draco_malfoy', shadeScore: 233, enemyCount: 6 },
// ];

// function avatarFor(username: string) {
//   return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
//     username
//   )}`;
// }

// function Medal({ rank }: { rank: 1 | 2 | 3 }) {
//   const map = {
//     1: {
//       label: '1st',
//       bg: 'from-amber-400 to-yellow-300',
//       ring: 'ring-amber-400',
//       emoji: '👑',
//     },
//     2: {
//       label: '2nd',
//       bg: 'from-slate-300 to-slate-100',
//       ring: 'ring-slate-300',
//       emoji: '🥈',
//     },
//     3: {
//       label: '3rd',
//       bg: 'from-orange-400 to-amber-300',
//       ring: 'ring-orange-400',
//       emoji: '🥉',
//     },
//   } as const;
//   const m = map[rank];
//   return (
//     <div
//       className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-black bg-gradient-to-b ${m.bg} ring-1 ${m.ring} ring-offset-0`}
//     >
//       <span>{m.emoji}</span>
//       <span>{m.label}</span>
//     </div>
//   );
// }

// function LegendCard({ row, accent }: { row: Row; accent: string }) {
//   return (
//     <div
//       className={`relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] ring-1 ring-black/5`}
//     >
//       {/* glow */}
//       <div
//         aria-hidden
//         className={`pointer-events-none absolute -inset-16 -z-10 blur-3xl opacity-30 bg-${accent}`}
//       />
//       <div className="flex items-center gap-3">
//         <img
//           src={row.avatarUrl ?? avatarFor(row.username)}
//           alt=""
//           className="h-12 w-12 rounded-full border border-zinc-800 bg-zinc-900 object-cover"
//         />
//         <div className="min-w-0">
//           <div className="flex items-center gap-2">
//             <h3 className="truncate text-lg font-semibold text-zinc-100">
//               {row.username}
//             </h3>
//             {row.rank <= 3 && <Medal rank={row.rank as 1 | 2 | 3} />}
//           </div>
//           <p className="mt-0.5 text-sm text-zinc-400">
//             Shade{' '}
//             <span className="font-semibold text-fuchsia-200">
//               {row.shadeScore}
//             </span>{' '}
//             · Enemies{' '}
//             <span className="font-medium text-zinc-200">{row.enemyCount}</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function LeaderboardPage() {
//   const top3 = DATA.slice(0, 3);
//   const rest = DATA.slice(3);

//   return (
//     <div className="mx-auto w-full max-w-3xl">
//       {/* Header */}
//       <div className="mb-6 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
//         <h1 className="text-2xl font-semibold text-zinc-100">Leaderboard</h1>
//         <p className="mt-2 text-sm text-zinc-400">
//           Casual hatred is for the weak.{' '}
//           <span className="text-zinc-200">Let’s compete.</span>
//         </p>
//         <div className="mt-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
//           <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
//             Ranking Criteria
//           </h2>
//           <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
//             <li>
//               <span className="text-zinc-100">Shade Score</span> (primary):
//               earned from reactions to your posts (Shade &gt; Boo &gt; Mum).
//             </li>
//             <li>
//               <span className="text-zinc-100">Enemy Count</span> (tiebreaker):
//               more enemies, higher seed. (We don’t judge. We rank.)
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Legends */}
//       <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
//         <LegendCard row={top3[0]} accent="fuchsia-600/30" />
//         <LegendCard row={top3[1]} accent="violet-500/30" />
//         <LegendCard row={top3[2]} accent="rose-500/30" />
//       </div>

//       {/* The Pack */}
//       <div className="overflow-hidden rounded-2xl border border-zinc-800/70">
//         <div className="grid grid-cols-[3rem,1fr,7rem,7rem] items-center gap-2 border-b border-zinc-800/70 bg-zinc-950/70 px-4 py-2 text-xs uppercase tracking-wide text-zinc-400">
//           <div>#</div>
//           <div>User</div>
//           <div className="text-right">Shade</div>
//           <div className="text-right">Enemies</div>
//         </div>

//         <ul className="divide-y divide-zinc-800/70">
//           {rest.map((r) => (
//             <li
//               key={r.username}
//               className="grid grid-cols-[3rem,1fr,7rem,7rem] items-center gap-2 bg-zinc-900/40 px-4 py-3 transition hover:bg-zinc-900/60"
//             >
//               <div className="font-semibold text-zinc-500">#{r.rank}</div>

//               <div className="min-w-0">
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={r.avatarUrl ?? avatarFor(r.username)}
//                     alt=""
//                     className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-950"
//                   />
//                   <span className="truncate text-zinc-100">{r.username}</span>
//                 </div>
//               </div>

//               <div className="text-right font-medium text-fuchsia-200">
//                 {r.shadeScore}
//               </div>
//               <div className="text-right text-zinc-300">{r.enemyCount}</div>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Ambient gradient accents */}
//       <div
//         aria-hidden
//         className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 opacity-40"
//       >
//         <div className="mx-auto h-40 max-w-xl rounded-full bg-gradient-to-t from-fuchsia-700/20 to-transparent blur-3xl" />
//       </div>
//     </div>
//   );
// }

// app/leaderboard/page.tsx
import { prisma } from '@/lib/prisma';

type Row = {
  rank: number;
  username: string;
  shadeScore: number;
  enemyCount: number;
  avatarUrl?: string | null;
};

const WEIGHTS = { SHADE: 3, BOO: 1, MUM: 0 } as const;

function avatarFor(username: string) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
    username
  )}`;
}

function Medal({ rank }: { rank: 1 | 2 | 3 }) {
  const map = {
    1: {
      label: '1st',
      bg: 'from-amber-400 to-yellow-300',
      ring: 'ring-amber-400',
      emoji: '👑',
    },
    2: {
      label: '2nd',
      bg: 'from-slate-300 to-slate-100',
      ring: 'ring-slate-300',
      emoji: '🥈',
    },
    3: {
      label: '3rd',
      bg: 'from-orange-400 to-amber-300',
      ring: 'ring-orange-400',
      emoji: '🥉',
    },
  } as const;
  const m = map[rank];
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-black bg-gradient-to-b ${m.bg} ring-1 ${m.ring}`}
    >
      <span>{m.emoji}</span>
      <span>{m.label}</span>
    </div>
  );
}

function LegendCard({ row, accent }: { row: Row; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] ring-1 ring-black/5">
      {/* glow (Tailwind can’t see dynamic classes; if it doesn’t show, hardcode classes or safelist) */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-16 -z-10 blur-3xl opacity-30 bg-${accent}`}
      />
      <div className="flex items-center gap-3">
        <img
          src={
            row.avatarUrl && row.avatarUrl.trim() !== ''
              ? row.avatarUrl
              : avatarFor(row.username)
          }
          alt=""
          className="h-12 w-12 rounded-full border border-zinc-800 bg-zinc-900 object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-zinc-100">
              {row.username}
            </h3>
            {row.rank <= 3 && <Medal rank={row.rank as 1 | 2 | 3} />}
          </div>
          <p className="mt-0.5 text-sm text-zinc-400">
            Shade{' '}
            <span className="font-semibold text-fuchsia-200">
              {row.shadeScore}
            </span>{' '}
            · Enemies{' '}
            <span className="font-medium text-zinc-200">{row.enemyCount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 10; // refresh leaderboard periodically (or use dynamic='force-dynamic')

export default async function LeaderboardPage() {
  // 1) Get lightweight user list
  const users = await prisma.user.findMany({
    select: { id: true, username: true, avatarUrl: true },
  });

  // 2) Compute enemies RECEIVED (how many users marked you as enemy)
  const enemies = await prisma.enemy.groupBy({
    by: ['enemyId'],
    _count: { enemyId: true },
  });
  const enemyCount = new Map<string, number>();
  for (const e of enemies) enemyCount.set(e.enemyId, e._count.enemyId);

  // 3) Pull all reactions with the post author, then sum weights per author
  const reactions = await prisma.reaction.findMany({
    select: { type: true, post: { select: { authorId: true } } },
  });
  const score = new Map<string, number>();
  for (const r of reactions) {
    const authorId = r.post.authorId;
    const prev = score.get(authorId) ?? 0;
    // @ts-expect-error - r.type is ReactionType enum matching WEIGHTS keys
    score.set(authorId, prev + WEIGHTS[r.type]);
  }

  // 4) Build rows and rank by (shadeScore desc, enemyCount desc)
  const rows: Row[] = users
    .map((u) => ({
      rank: 0, // temp
      username: u.username,
      avatarUrl: u.avatarUrl,
      shadeScore: score.get(u.id) ?? 0,
      enemyCount: enemyCount.get(u.id) ?? 0,
    }))
    .sort((a, b) => b.shadeScore - a.shadeScore || b.enemyCount - a.enemyCount)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <h1 className="text-2xl font-semibold text-zinc-100">Leaderboard</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Casual hatred is for the weak.{' '}
          <span className="text-zinc-200">Let’s compete.</span>
        </p>
        <div className="mt-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Ranking Criteria
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            <li>
              <span className="text-zinc-100">Shade Score</span> (primary):
              reactions to your posts (SHADE &gt; BOO &gt; MUM).
            </li>
            <li>
              <span className="text-zinc-100">Enemies Received</span>{' '}
              (tiebreaker): how many people marked you as their enemy.
            </li>
          </ul>
        </div>
      </div>

      {/* Legends */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {top3[0] && <LegendCard row={top3[0]} accent="fuchsia-600/30" />}
        {top3[1] && <LegendCard row={top3[1]} accent="violet-500/30" />}
        {top3[2] && <LegendCard row={top3[2]} accent="rose-500/30" />}
      </div>

      {/* The Pack */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/70">
        <div className="grid grid-cols-[3rem,1fr,7rem,7rem] items-center gap-2 border-b border-zinc-800/70 bg-zinc-950/70 px-4 py-2 text-xs uppercase tracking-wide text-zinc-400">
          <div>#</div>
          <div>User</div>
          <div className="text-right">Shade</div>
          <div className="text-right">Enemies</div>
        </div>
        <ul className="divide-y divide-zinc-800/70">
          {rest.map((r) => (
            <li
              key={r.username}
              className="grid grid-cols-[3rem,1fr,7rem,7rem] items-center gap-2 bg-zinc-900/40 px-4 py-3 transition hover:bg-zinc-900/60"
            >
              <div className="font-semibold text-zinc-500">#{r.rank}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      r.avatarUrl && r.avatarUrl.trim() !== ''
                        ? r.avatarUrl
                        : avatarFor(r.username)
                    }
                    alt=""
                    className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-950 object-cover"
                  />
                  <span className="truncate text-zinc-100">{r.username}</span>
                </div>
              </div>
              <div className="text-right font-medium text-fuchsia-200">
                {r.shadeScore}
              </div>
              <div className="text-right text-zinc-300">{r.enemyCount}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Ambient gradient accents */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 opacity-40"
      >
        <div className="mx-auto h-40 max-w-xl rounded-full bg-gradient-to-t from-fuchsia-700/20 to-transparent blur-3xl" />
      </div>
    </div>
  );
}
