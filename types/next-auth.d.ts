// types/next-auth.d.ts

export interface AppUser {
  id: string;
  email: string;
  username: string;
  enemyCount: number;
  shadeScore: number;
  avatarUrl?: string | null;
  bio?: string | null;
}

declare module 'next-auth' {
  // What you get from useSession() etc.
  interface Session {
    user: AppUser;
  }

  // What authorize() returns & gets merged into JWT on sign-in
  interface User {
    id: string;
    email: string;
    username: string;
    enemyCount: number;
    shadeScore: number;
    avatarUrl?: string | null;
    bio?: string | null;
  }
}

declare module 'next-auth/jwt' {
  // Fields stored in the JWT token
  interface JWT {
    id: string;
    email: string;
    username: string;
    enemyCount: number;
    shadeScore: number;
    avatarUrl?: string | null;
    bio?: string | null;
  }
}
