import type { NextAuthOptions, User, Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';

export const authConfig: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' }, // optional, make a page later if you want
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        emailOrUsername: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        const emailOrUsername = (creds?.emailOrUsername ?? '').trim();
        const password = creds?.password ?? '';

        if (!emailOrUsername || !password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
          },
        });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // Shape the user object put into JWT
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          enemyCount: user.enemyCount,
          shadeScore: user.shadeScore,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User | AdapterUser | null;
    }) {
      // On sign-in, copy our fields to the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.enemyCount = user.enemyCount;
        token.shadeScore = user.shadeScore;
        token.avatarUrl = user.avatarUrl ?? null;
        token.bio = user.bio ?? null;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Expose our custom fields on session.user
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = session.user.email!;
        session.user.username = token.username as string;
        session.user.enemyCount = (token.enemyCount as number) ?? 0;
        session.user.shadeScore = (token.shadeScore as number) ?? 0;
        session.user.avatarUrl = (token.avatarUrl as string) ?? null;
        session.user.bio = (token.bio as string) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthOptions;
