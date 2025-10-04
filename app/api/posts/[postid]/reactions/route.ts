// app/api/posts/[postId]/reactions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TYPES = new Set(['SHADE', 'BOO', 'MUM'] as const);
type ReactionType = 'SHADE' | 'BOO' | 'MUM';
type Body = { type: ReactionType };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ postId: string }> } // 👈 note: Promise
) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = await ctx.params; // 👈 await before using
  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!TYPES.has(body.type)) {
    return NextResponse.json(
      { error: 'Invalid reaction type' },
      { status: 400 }
    );
  }

  const exists = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  await prisma.reaction.upsert({
    where: { userId_postId: { userId: session.user.id, postId } },
    update: { type: body.type },
    create: { userId: session.user.id, postId, type: body.type },
  });

  const [SHADE, BOO, MUM] = await Promise.all([
    prisma.reaction.count({ where: { postId, type: 'SHADE' } }),
    prisma.reaction.count({ where: { postId, type: 'BOO' } }),
    prisma.reaction.count({ where: { postId, type: 'MUM' } }),
  ]);

  return NextResponse.json({
    success: true,
    data: { postId, counts: { SHADE, BOO, MUM } },
  });
}
