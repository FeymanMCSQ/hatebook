import type { PrismaClient } from '@prisma/client';

function fnv1a(str: string) {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export async function getDailySacrifice(
  prisma: PrismaClient,
  date = new Date()
) {
  const ymd = date.toISOString().slice(0, 10); // YYYY-MM-DD UTC (good enough for demo)
  const users = await prisma.user.findMany({
    select: { id: true, username: true, avatarUrl: true },
  });
  if (users.length === 0) throw new Error('No users');
  const seed = process.env.SACRIFICE_SEED ?? 'hatebook';
  const idx = fnv1a(ymd + seed) % users.length;
  return users[idx];
}
