// prisma/seeds/posts.ts
import type { PrismaClient } from '@prisma/client';

type Pair = { hater: string; target: string };

const pairs: Pair[] = [
  { hater: 'doom@hatebook.local', target: 'reed@hatebook.local' }, // Doctor Doom -> Reed
  { hater: 'lex@hatebook.local', target: 'supes@hatebook.local' }, // Lex -> Superman
  { hater: 'jjj@hatebook.local', target: 'spidey@hatebook.local' }, // JJJ -> Spider-Man
  { hater: 'squidward@hatebook.local', target: 'spongebob@hatebook.local' }, // Squidward -> SpongeBob
  { hater: 'stewie@hatebook.local', target: 'lois@hatebook.local' }, // Stewie -> Lois
  { hater: 'draco@hatebook.local', target: 'harry@hatebook.local' }, // Draco -> Harry
];

// 2 shade lines per pair (12 total)
const shadeLines: Record<string, string[]> = {
  'doom@hatebook.local': [
    '@reed_richards Your ‘genius’ owes me rent—been living in my shadow since uni.',
    'Another day, another elastic mistake. Kneel, @reed_richards.',
  ],
  'lex@hatebook.local': [
    '@superman Adoration isn’t a skill. Try achievements without the sunlight.',
    'If gravity were fair, you’d stay grounded, @superman.',
  ],
  'jjj@hatebook.local': [
    'BREAKING: @spider_man caught… wasting taxpayer webbing. Source: me.',
    'Question: menace or fraud? Answer: yes. Looking at you, @spider_man.',
  ],
  'squidward@hatebook.local': [
    'Noise complaint filed: @spongebob’s laugh violates basic decency.',
    'Art died when @spongebob picked up a spatula.',
  ],
  'stewie@hatebook.local': [
    'Mother (@lois_griffin), schedule your downfall for Tuesday. I’m busy Monday.',
    'Operational note: @lois_griffin remains intolerably cheerful. Remedies pending.',
  ],
  'draco@hatebook.local': [
    '@harry_potter Fame by scar is still just… a scar.',
    'Some of us were born great; others got picked by hats, @harry_potter.',
  ],
};

export async function seedPosts(prisma: PrismaClient) {
  let created = 0;

  for (const { hater, target } of pairs) {
    const [haterUser, targetUser] = await Promise.all([
      prisma.user.findUnique({ where: { email: hater } }),
      prisma.user.findUnique({ where: { email: target } }),
    ]);
    if (!haterUser || !targetUser) {
      console.warn(`Skipped posts: ${hater} -> ${target} (user missing)`);
      continue;
    }

    const lines = shadeLines[hater] ?? [];
    for (const content of lines) {
      await prisma.post.create({
        data: {
          content,
          authorId: haterUser.id,
        },
      });
      created += 1;
    }
  }

  return created; // should be 12
}
