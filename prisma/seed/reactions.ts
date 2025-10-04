// prisma/seeds/reactions.ts
import type { PrismaClient, ReactionType } from '@prisma/client';

type Options = {
  postIds?: string[]; // if omitted, we fetch all post IDs
  reactionsPerPost?: number; // how many distinct users react per post
  allowAuthorReact?: boolean; // default false
  clearExisting?: boolean; // default true (delete all reactions first)
};

const REACTION_TYPES: ReactionType[] = ['SHADE', 'BOO', 'MUM'];

/** Pick one reaction type (slightly biased toward SHADE for the vibe) */
function randomType(): ReactionType {
  const bag: ReactionType[] = ['SHADE', 'SHADE', 'BOO', 'MUM'];
  return bag[Math.floor(Math.random() * bag.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function seedReactions(prisma: PrismaClient, opts: Options = {}) {
  const {
    postIds,
    reactionsPerPost = 3,
    allowAuthorReact = false,
    clearExisting = true,
  } = opts;

  if (clearExisting) {
    await prisma.reaction.deleteMany({});
  }

  // 1) Source posts
  const posts =
    postIds && postIds.length
      ? await prisma.post.findMany({
          where: { id: { in: postIds } },
          select: { id: true, authorId: true },
        })
      : await prisma.post.findMany({
          select: { id: true, authorId: true },
        });

  if (posts.length === 0) return 0;

  // 2) All users (we’ll sample per post)
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  if (users.length === 0) return 0;

  // 3) Build reaction rows
  const rows: { userId: string; postId: string; type: ReactionType }[] = [];

  for (const p of posts) {
    // Eligible users for this post
    const eligible = allowAuthorReact
      ? users
      : users.filter((u) => u.id !== p.authorId);

    const take = Math.min(reactionsPerPost, eligible.length);
    const chosen = shuffle(eligible).slice(0, take);

    for (const u of chosen) {
      rows.push({
        userId: u.id,
        postId: p.id,
        type: randomType(),
      });
    }
  }

  if (rows.length === 0) return 0;

  // 4) Insert (skip duplicates so @@unique(userId, postId) is honored)
  const res = await prisma.reaction.createMany({
    data: rows,
    skipDuplicates: true,
  });

  return res.count; // number of inserted rows
}
