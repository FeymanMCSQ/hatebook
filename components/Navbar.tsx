'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

const navItems = [
  { href: '/feed', label: 'Feed' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/70 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="font-black tracking-tight">
          <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 bg-clip-text text-transparent">
            HATE
          </span>
          <span className="ml-1 bg-gradient-to-r from-rose-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
            BOOK
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden gap-6 md:flex">
          {navItems.map((it) => {
            const active = pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={[
                  'text-sm transition',
                  active
                    ? 'text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200',
                ].join(' ')}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* Right auth side */}
        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="h-6 w-6 animate-pulse rounded-full bg-zinc-800" />
          )}

          {status !== 'loading' && !session?.user && (
            <Link
              href="/signin"
              className="rounded-lg border border-fuchsia-700/40 bg-fuchsia-700/20 px-3 py-1.5 text-sm font-medium text-fuchsia-100 hover:bg-fuchsia-700/30"
            >
              Sign in
            </Link>
          )}

          {session?.user && (
            <>
              {/* Avatar */}
              <Link
                href="/profile"
                className="group inline-flex items-center gap-2 rounded-lg border border-zinc-800/70 bg-zinc-900/40 px-2.5 py-1.5"
                title={session.user.username}
              >
                <img
                  src={
                    session.user.avatarUrl ??
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                      session.user.username
                    )}`
                  }
                  alt=""
                  className="h-6 w-6 rounded-full border border-zinc-800"
                />
                <span className="text-sm text-zinc-300 group-hover:text-zinc-100">
                  {session.user.username}
                </span>
              </Link>

              <button
                onClick={() => signOut({ redirect: false })}
                className="rounded-lg border border-rose-800/40 bg-rose-900/10 px-3 py-1.5 text-sm font-medium text-rose-200/90 hover:bg-rose-900/20"
                title="Sign out"
              >
                Sign out
              </button>

              {/* 👇 Stealth loading shortcut */}
              <Link
                href="/loading"
                title="Presentation shortcut"
                className="ml-2 rounded-full border border-transparent px-2 py-1 text-xs text-zinc-800 hover:text-zinc-600 focus:outline-none"
              >
                ⚙️
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile links */}
      <nav className="flex items-center justify-center gap-6 border-t border-zinc-900/60 bg-zinc-950/50 py-2 md:hidden">
        {navItems.map((it) => {
          const active = pathname?.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                'text-sm',
                active ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200',
              ].join(' ')}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
