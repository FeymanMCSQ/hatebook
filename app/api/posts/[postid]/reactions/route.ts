// app/api/posts/[postId]/reactions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TYPES = new Set(['SHADE', 'BOO', 'MUM'] as const);
type ReactionType = 'SHADE' | 'BOO' | 'MUM';
type Body = { type: ReactionType };

function isPromise<T>(v: T | Promise<T>): v is Promise<T> {
  return (
    typeof v === 'object' &&
    v !== null &&
    'then' in v &&
    typeof (v as PromiseLike<T>).then === 'function'
  );
}

export async function POST(
  req: Request,
  ctx: { params: { postId: string } } | { params: Promise<{ postId: string }> }
) {
  // 1) Auth
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Resolve dynamic params (supports promise or plain)
  const raw = ctx.params;
  const resolved = isPromise(raw) ? await raw : raw;
  const postId = resolved?.postId;
  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
  }

  // 3) Parse body
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

  // 4) Re-resolve the CURRENT user from DB to avoid stale session IDs
  const currentUser =
    (session.user.email &&
      (await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      }))) ||
    (session.user.username &&
      (await prisma.user.findUnique({
        where: { username: session.user.username },
        select: { id: true },
      })));

  if (!currentUser) {
    return NextResponse.json(
      { error: 'Your session is stale. Please sign out and sign back in.' },
      { status: 401 }
    );
  }

  // 5) Ensure post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // 6) Upsert reaction using the fresh user id
  await prisma.reaction.upsert({
    where: { userId_postId: { userId: currentUser.id, postId } },
    update: { type: body.type },
    create: { userId: currentUser.id, postId, type: body.type },
  });

  // 7) Return updated counts
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
