import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const Body = z.object({
  targetUsername: z.string().min(1),
  content: z.string().trim().min(1).max(2000), // ✅ trims then validates
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user)
      return NextResponse.json({ error: 'Auth' }, { status: 401 });

    const { targetUsername, content } = Body.parse(await req.json());

    const target = await prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    });
    if (!target)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        // Tag so we can filter easily on the page (no schema change needed)
        content: `[ROAST @${targetUsername}] ${content}`,
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
