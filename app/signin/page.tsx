// app/signin/page.tsx
'use client';

import { signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function SignInPage() {
  const [emailOrUsername, setId] = useState('');
  const [password, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn('credentials', {
      emailOrUsername,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setErr(res.error || 'Sign-in failed. Stay mad.');
  }

  async function signInDemo() {
    setId('doctor_doom'); // seeded
    setPw('dev-password');
    setErr(null);
    setLoading(true);
    const res = await signIn('credentials', {
      emailOrUsername: 'doctor_doom',
      password: 'dev-password',
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setErr(res.error);
  }

  return (
    <div className="relative min-h-[calc(100dvh)] overflow-hidden bg-[#0a0a0b] text-zinc-200">
      {/* Ambient gradient + noise */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-fuchsia-700/20 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-700/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.06] [background:radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22><rect width=%224%22 height=%224%22 fill=%22black%22/><circle cx=%221%22 cy=%221%22 r=%220.5%22 fill=%22white%22 fill-opacity=%220.5%22/></svg>')]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh)] max-w-5xl items-center px-6">
        <div className="mx-auto w-full max-w-md">
          {/* Logo / wordmark */}
          <div className="mb-8 select-none text-center">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-md bg-zinc-900/80 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 ring-1 ring-inset ring-zinc-700/60">
                Beta
              </span>
            </div>
            <h1 className="mt-3 font-black text-4xl leading-none tracking-tight">
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 bg-clip-text text-transparent">
                HATE
              </span>
              <span className="ml-1 bg-gradient-to-r from-rose-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                BOOK
              </span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Make enemies. Throw shade. Rise in the leaderboard.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Error bar */}
              {err && (
                <div className="rounded-lg border border-rose-700/40 bg-rose-900/20 px-3 py-2 text-sm text-rose-300">
                  {err}
                </div>
              )}

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Email or Username
                </span>
                <div className="group relative">
                  <input
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-zinc-100 outline-none ring-0 transition focus:border-fuchsia-600/60 focus:bg-zinc-900/80"
                    placeholder="doctor_doom or doom@hatebook.local"
                    value={emailOrUsername}
                    onChange={(e) => setId(e.target.value)}
                    autoComplete="username"
                    required
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 my-auto h-5 w-5 rounded-full bg-gradient-to-tr from-fuchsia-500/20 to-rose-500/20 opacity-0 transition group-focus-within:opacity-100" />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Password
                </span>
                <div className="group relative">
                  <input
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-zinc-100 outline-none ring-0 transition focus:border-fuchsia-600/60 focus:bg-zinc-900/80"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 my-auto h-5 w-5 rounded-full bg-gradient-to-tr from-fuchsia-500/20 to-rose-500/20 opacity-0 transition group-focus-within:opacity-100" />
                </div>
              </label>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  className="inline-flex min-w-28 items-center justify-center rounded-xl border border-fuchsia-700/40 bg-fuchsia-700/20 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition hover:bg-fuchsia-700/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-600/50 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-fuchsia-300/50 border-b-transparent" />
                      Signing in…
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={signInDemo}
                    className="rounded-xl border border-zinc-700/60 bg-zinc-900/40 px-3 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900/60"
                  >
                    Use demo (doctor_doom)
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut({ redirect: false })}
                    className="rounded-xl border border-rose-800/40 bg-rose-900/10 px-3 py-2.5 text-xs font-medium text-rose-200/90 transition hover:bg-rose-900/20"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </form>

            {/* Footer / snark */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Forgot password? Cope.</span>
              <span className="text-zinc-600">v0.1 “Petty Crimes”</span>
            </div>
          </div>

          {/* Micro copy */}
          <p className="mt-4 text-center text-xs text-zinc-500">
            By signing in you agree to our{' '}
            <span className="cursor-not-allowed underline decoration-dotted decoration-zinc-600">
              Terms of Petty Engagement
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
