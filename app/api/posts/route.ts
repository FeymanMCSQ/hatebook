import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type PostBody = {
  content: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (content.length < 1) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: 'Max 500 characters' }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content,
      authorId: session.user.id,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      authorId: true,
    },
  });

  return NextResponse.json({ success: true, data: post }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- 1) Find enemy IDs ---
  const enemies = await prisma.enemy.findMany({
    where: { userId: session.user.id },
    select: { enemyId: true },
  });
  const enemyIds = enemies.map((e) => e.enemyId);

  // --- 2) Fetch enemy posts ---
  const enemyPosts = await prisma.post.findMany({
    where: { authorId: { in: enemyIds } },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      reactions: { select: { type: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // --- 3) Fetch other posts ---
  const otherPosts = await prisma.post.findMany({
    where: { authorId: { notIn: enemyIds } },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      reactions: { select: { type: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // --- 4) Transform with counts ---
  function mapPosts(posts: typeof enemyPosts) {
    return posts.map((p) => ({
      id: p.id,
      content: p.content,
      createdAt: p.createdAt,
      author: p.author,
      counts: {
        SHADE: p.reactions.filter((r) => r.type === 'SHADE').length,
        BOO: p.reactions.filter((r) => r.type === 'BOO').length,
        MUM: p.reactions.filter((r) => r.type === 'MUM').length,
      },
    }));
  }

  return NextResponse.json({
    success: true,
    data: {
      enemies: mapPosts(enemyPosts),
      others: mapPosts(otherPosts),
    },
  });
}
