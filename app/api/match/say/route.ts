import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const Body = z.object({
  matchId: z.string().min(4).max(100),
  content: z.string().trim().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user)
      return NextResponse.json({ error: 'Auth' }, { status: 401 });

    const { matchId, content } = Body.parse(await req.json());

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        // Tag posts so the match feed can find them (no new tables)
        content: `[MATCH ${matchId}] ${content}`,
      },
      include: { author: { select: { username: true, avatarUrl: true } } },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof ZodError)
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
