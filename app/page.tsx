// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-[calc(100svh-0px)] overflow-hidden bg-[radial-gradient(1200px_600px_at_50%_-10%,#1a1a1a_0%,#0b0b0b_60%,#070707_100%)]">
      {/* Soft vignette + grid lines */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(700px_300px_at_50%_10%,rgba(255,0,102,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      {/* Center content */}
      <section className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 text-center">
        {/* Floating glow */}
        <div className="absolute -z-10 h-72 w-72 animate-float-slow rounded-full bg-fuchsia-600/15 blur-3xl" />
        <div className="absolute -z-10 h-72 w-72 animate-float-slow2 rounded-full bg-rose-600/15 blur-3xl" />

        {/* Logo-esque wordmark */}
        <h1 className="select-none bg-gradient-to-b from-zinc-100 to-zinc-400/90 bg-clip-text text-5xl font-semibold tracking-tight text-transparent drop-shadow-[0_4px_30px_rgba(255,0,128,0.08)] md:text-7xl">
          Hatebook
        </h1>

        {/* Pulse line */}
        <div className="mt-6 h-[2px] w-24 animate-pulse-bar rounded-full bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/70 to-fuchsia-500/0 md:w-32" />

        {/* Tagline with “tech” pulse */}
        <p className="mt-6 max-w-[38ch] animate-tech-pulse text-balance text-lg text-zinc-300/90 md:text-xl">
          Fuck Love. Spread Hate.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/feed"
            className="rounded-xl border border-zinc-700/70 bg-zinc-900/60 px-5 py-2.5 text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            Enter Feed
          </Link>
          {/* <Link
            href="/signin"
            className="rounded-xl border border-fuchsia-700/40 bg-fuchsia-600/15 px-5 py-2.5 text-fuchsia-200 transition hover:bg-fuchsia-600/25"
          >
            Sign in
          </Link> */}
        </div>
      </section>

      {/* Bottom ambient gloss */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 bg-gradient-to-t from-black/50 to-transparent"
      />
    </main>
  );
}
