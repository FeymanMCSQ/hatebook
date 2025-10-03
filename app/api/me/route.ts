// app/api/me/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authConfig);
  return NextResponse.json(session ?? { user: null });
}
