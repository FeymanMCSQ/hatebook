// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seed/users';
import { seedEnemies } from './seed/enemies';
import { seedPosts } from './seed/posts';

const prisma = new PrismaClient();

async function main() {
  const users = await seedUsers(prisma);
  const enemies = await seedEnemies(prisma);
  const posts = await seedPosts(prisma);

  console.log(`Seeded ${users} users, ${enemies} enmities, ${posts} posts ✅`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
