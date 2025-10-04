// app/api/enemies/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type Body = {
  enemyId?: string;
  enemyUsername?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const byId = typeof body.enemyId === 'string' && body.enemyId.trim() !== '';
  const byUsername =
    typeof body.enemyUsername === 'string' && body.enemyUsername.trim() !== '';
  if (!byId && !byUsername) {
    return NextResponse.json(
      { error: 'Provide enemyId or enemyUsername' },
      { status: 400 }
    );
  }

  // Re-resolve initiator from DB to avoid stale session IDs after reseeds.
  // Prefer email (stable), fall back to username if needed.
  const initiator =
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

  if (!initiator) {
    // Session exists but user row doesn't -> force reauth
    return NextResponse.json(
      { error: 'Session mismatch. Please sign in again.' },
      { status: 401 }
    );
  }

  // Resolve target user
  const target = await prisma.user.findFirst({
    where: byId
      ? { id: body.enemyId!.trim() }
      : { username: body.enemyUsername!.trim() },
    select: { id: true, username: true, avatarUrl: true },
  });
  if (!target) {
    return NextResponse.json(
      { error: 'Target user not found' },
      { status: 404 }
    );
  }
  if (target.id === initiator.id) {
    return NextResponse.json(
      { error: 'You cannot mark yourself as an enemy' },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const relation = await tx.enemy.create({
        data: {
          userId: initiator.id,
          enemyId: target.id,
        },
        select: { id: true, createdAt: true, userId: true, enemyId: true },
      });

      // Increment initiator's enemyCount (only on new create)
      await tx.user.update({
        where: { id: initiator.id },
        data: { enemyCount: { increment: 1 } },
      });

      return relation;
    });

    return NextResponse.json(
      { success: true, data: { enemy: created, target } },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        // Unique constraint: already declared
        return NextResponse.json(
          { error: 'Already declared this user as your enemy' },
          { status: 409 }
        );
      }
      if (e.code === 'P2003') {
        // FK failed – likely stale session; hint user to reauth
        return NextResponse.json(
          {
            error:
              'User not found for this session. Please sign out and sign in again.',
          },
          { status: 409 }
        );
      }
    }
    console.error('Declare enemy failed:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
