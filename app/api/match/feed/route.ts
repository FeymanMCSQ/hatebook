import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get('matchId') || '';
  const sinceIso = searchParams.get('since') || '';
  if (!matchId)
    return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  const since = sinceIso
    ? new Date(sinceIso)
    : new Date(Date.now() - 60 * 60 * 1000);

  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: since },
      content: { startsWith: `[MATCH ${matchId}]` },
    },
    include: { author: { select: { username: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  const data = posts.map((p) => ({
    id: p.id,
    content: p.content.replace(`[MATCH ${matchId}] `, ''),
    createdAt: p.createdAt.toISOString(),
    author: p.author,
  }));

  return NextResponse.json({ success: true, data });
}
