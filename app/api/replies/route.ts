// app/api/replies/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust if your prisma client path differs
import { z, ZodError } from 'zod';

// If you have NextAuth configured:
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth'; // adjust path to your NextAuth options

const BodySchema = z.object({
  postId: z.string().cuid(),
  content: z.string().min(1).max(2000),
  parentId: z.string().cuid().optional(),

  // TEMP fallback if you want to seed/demo without auth:
  authorId: z.string().cuid().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = BodySchema.parse(json);

    // Try session first
    const session = await getServerSession(authConfig).catch(() => null);

    let authorId: string | undefined;

    if (session?.user && 'id' in session.user) {
      authorId = (session.user as { id: string }).id;
    } else {
      authorId = body.authorId;
    }

    if (!authorId) {
      return NextResponse.json(
        { error: 'Unauthenticated (no session). For demo, pass authorId.' },
        { status: 401 }
      );
    }

    // basic existence checks (optional but nice)
    const [post, author] = await Promise.all([
      prisma.post.findUnique({
        where: { id: body.postId },
        select: { id: true },
      }),
      prisma.user.findUnique({ where: { id: authorId }, select: { id: true } }),
    ]);

    if (!post)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    if (!author)
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });

    if (body.parentId) {
      const parent = await prisma.reply.findUnique({
        where: { id: body.parentId },
        select: { id: true, postId: true },
      });
      if (!parent)
        return NextResponse.json(
          { error: 'Parent reply not found' },
          { status: 404 }
        );
      if (parent.postId !== body.postId) {
        return NextResponse.json(
          { error: 'Parent reply belongs to a different post' },
          { status: 400 }
        );
      }
    }

    const reply = await prisma.reply.create({
      data: {
        content: body.content,
        postId: body.postId,
        authorId,
        parentId: body.parentId ?? null,
      },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ success: true, data: reply }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error('POST /api/replies error', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
