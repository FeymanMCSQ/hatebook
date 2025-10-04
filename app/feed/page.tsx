import PostCard from '@/components/Postcard';

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; avatarUrl?: string | null };
};

const POSTS: Post[] = [
  {
    id: 'p1',
    content:
      'Reed’s ‘genius’? A statistical anomaly. Bow before a true monarch.',
    createdAt: '2h ago',
    author: { username: 'doctor_doom' },
  },
  {
    id: 'p2',
    content:
      'If adoration is the metric, then mediocrity must be the standard. Looking at you, alien.',
    createdAt: '3h ago',
    author: { username: 'lex_luthor' },
  },
  {
    id: 'p3',
    content: 'P MENACE! Read my op-ed. And the retraction? Never.',
    createdAt: '5h ago',
    author: { username: 'j_jonah_jameson' },
  },
  {
    id: 'p4',
    content: 'Art is dead. Noise is alive. Guess which one you are, SpongeBob.',
    createdAt: '8h ago',
    author: { username: 'squidward' },
  },
  {
    id: 'p5',
    content:
      'Victory shall be mine—once I’m done scheduling mother’s downfall.',
    createdAt: '1d ago',
    author: { username: 'stewie_griffin' },
  },
  {
    id: 'p6',
    content: 'Scarhead’s fame is an accident. Mine is destiny.',
    createdAt: '2d ago',
    author: { username: 'draco_malfoy' },
  },
];

export default function FeedPage() {
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

      {/* Stack of posts */}
      <div className="space-y-4">
        {POSTS.map((p) => (
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
