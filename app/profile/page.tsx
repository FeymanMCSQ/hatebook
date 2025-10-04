// app/profile/page.tsx
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import Link from 'next/link';

function avatarFor(username: string) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
    username
  )}`;
}

export default async function ProfilePage() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="mt-2 text-zinc-400">
            You’re not signed in.{' '}
            <Link href="/signin" className="underline decoration-dotted">
              Sign in
            </Link>{' '}
            to see your profile.
          </p>
        </div>
      </div>
    );
  }

  const { username, email, avatarUrl, bio } = session.user;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl ?? avatarFor(username)}
            alt=""
            className="h-14 w-14 rounded-full border border-zinc-800 bg-zinc-900 object-cover"
          />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-zinc-100">
              {username}
            </h1>
            <p className="text-sm text-zinc-400">{email}</p>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-medium text-zinc-400">Tagline</h2>
          <p className="mt-1 whitespace-pre-wrap text-zinc-200">
            {bio ?? 'No bio yet. Craft your villain arc.'}
          </p>
        </div>
      </div>
    </div>
  );
}
