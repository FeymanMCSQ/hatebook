// app/leaderboard/page.tsx

type Row = {
  rank: number;
  username: string;
  shadeScore: number;
  enemyCount: number;
  avatarUrl?: string | null;
};

const DATA: Row[] = [
  { rank: 1, username: 'doctor_doom', shadeScore: 420, enemyCount: 12 },
  { rank: 2, username: 'lex_luthor', shadeScore: 377, enemyCount: 10 },
  { rank: 3, username: 'j_jonah_jameson', shadeScore: 311, enemyCount: 8 },
  { rank: 4, username: 'squidward', shadeScore: 290, enemyCount: 7 },
  { rank: 5, username: 'stewie_griffin', shadeScore: 260, enemyCount: 9 },
  { rank: 6, username: 'draco_malfoy', shadeScore: 233, enemyCount: 6 },
];

function avatarFor(username: string) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
    username
  )}`;
}

export default function LeaderboardPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header */}
      <div className="mb-5 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4">
        <h1 className="text-xl font-semibold text-zinc-100">Leaderboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Highest shade scores. Pettiest icons.
        </p>
      </div>

      {/* Table-ish list */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/70">
        <div className="grid grid-cols-[3rem,1fr,7rem,7rem] items-center gap-2 border-b border-zinc-800/70 bg-zinc-950/70 px-4 py-2 text-xs uppercase tracking-wide text-zinc-400">
          <div>#</div>
          <div>User</div>
          <div className="text-right">Shade</div>
          <div className="text-right">Enemies</div>
        </div>

        <ul className="divide-y divide-zinc-800/70">
          {DATA.map((r) => (
            <li
              key={r.username}
              className="grid grid-cols-[3rem,1fr,7rem,7rem] items-center gap-2 bg-zinc-900/40 px-4 py-3 hover:bg-zinc-900/60"
            >
              <div className="font-semibold text-zinc-400">#{r.rank}</div>

              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={r.avatarUrl ?? avatarFor(r.username)}
                  alt=""
                  className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-950"
                />
                <div className="truncate text-zinc-100">{r.username}</div>
              </div>

              <div className="text-right font-medium text-fuchsia-200">
                {r.shadeScore}
              </div>
              <div className="text-right text-zinc-300">{r.enemyCount}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 opacity-40">
        <div className="mx-auto h-40 max-w-xl rounded-full bg-gradient-to-t from-fuchsia-700/20 to-transparent blur-3xl" />
      </div>
    </div>
  );
}
