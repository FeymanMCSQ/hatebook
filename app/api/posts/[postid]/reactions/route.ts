import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TYPES = new Set(['SHADE', 'BOO', 'MUM'] as const);
type ReactionType = 'SHADE' | 'BOO' | 'MUM';

type Body = { type: ReactionType };

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = params;
  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = body?.type;
  if (!TYPES.has(type)) {
    return NextResponse.json(
      { error: 'Invalid reaction type' },
      { status: 400 }
    );
  }

  // Ensure post exists (optional but nicer error)
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Upsert the reaction for this user+post (unique on (userId, postId))
  await prisma.reaction.upsert({
    where: { userId_postId: { userId: session.user.id, postId } },
    update: { type },
    create: { userId: session.user.id, postId, type },
  });

  // Return fresh counts so the UI can update immediately
  const [shade, boo, mum] = await Promise.all([
    prisma.reaction.count({ where: { postId, type: 'SHADE' } }),
    prisma.reaction.count({ where: { postId, type: 'BOO' } }),
    prisma.reaction.count({ where: { postId, type: 'MUM' } }),
  ]);

  return NextResponse.json({
    success: true,
    data: { postId, counts: { SHADE: shade, BOO: boo, MUM: mum } },
  });
}
