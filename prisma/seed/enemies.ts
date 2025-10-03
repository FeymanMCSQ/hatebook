// prisma/seeds/enemies.ts
import type { PrismaClient } from '@prisma/client';

const pairs: Array<{ hater: string; target: string }> = [
  { hater: 'doom@hatebook.local', target: 'reed@hatebook.local' }, // Doctor Doom -> Reed Richards
  { hater: 'lex@hatebook.local', target: 'supes@hatebook.local' }, // Lex Luthor -> Superman
  { hater: 'jjj@hatebook.local', target: 'spidey@hatebook.local' }, // JJJ -> Spider-Man
  { hater: 'squidward@hatebook.local', target: 'spongebob@hatebook.local' }, // Squidward -> SpongeBob
  { hater: 'stewie@hatebook.local', target: 'lois@hatebook.local' }, // Stewie -> Lois
  { hater: 'draco@hatebook.local', target: 'harry@hatebook.local' }, // Draco -> Harry
];

export async function seedEnemies(prisma: PrismaClient) {
  let created = 0;

  for (const { hater, target } of pairs) {
    const [haterUser, targetUser] = await Promise.all([
      prisma.user.findUnique({ where: { email: hater } }),
      prisma.user.findUnique({ where: { email: target } }),
    ]);

    if (!haterUser || !targetUser) {
      console.warn(`Skipped: ${hater} -> ${target} (user(s) missing)`);
      continue;
    }

    // Upsert Enemy link (unique on [userId, enemyId])
    await prisma.enemy.upsert({
      where: {
        userId_enemyId: { userId: haterUser.id, enemyId: targetUser.id }, // compound unique selector
      },
      update: {},
      create: {
        userId: haterUser.id,
        enemyId: targetUser.id,
      },
    });

    // Optional: keep a running tally on the initiator’s enemyCount
    await prisma.user.update({
      where: { id: haterUser.id },
      data: { enemyCount: { increment: 1 } },
    });

    created += 1;
  }

  return created; // should be 6
}
