'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type UserLite = { username: string; avatarUrl?: string | null };
type Msg = { id: string; content: string; createdAt: string; author: UserLite };

export default function HateMatchClient(props: {
  matchId: string;
  me: UserLite;
  opponent: UserLite;
  endsAtISO: string;
}) {
  const { matchId, me, opponent, endsAtISO } = props;
  const endsAt = useMemo(() => new Date(endsAtISO).getTime(), [endsAtISO]);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sinceISO = useMemo(() => new Date().toISOString(), []); // session start

  // countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remaining = Math.max(0, endsAt - now);
  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const timeLeft = `${mm}:${String(ss).padStart(2, '0')}`;
  const expired = remaining <= 0;

  // poll feed every 2s
  useEffect(() => {
    let stopped = false;
    async function tick() {
      try {
        const res = await fetch(
          `/api/match/feed?matchId=${encodeURIComponent(
            matchId
          )}&since=${encodeURIComponent(sinceISO)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!stopped && json?.success) setMessages(json.data as Msg[]);
      } catch {}
    }
    tick();
    const id = setInterval(tick, 2000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [matchId, sinceISO]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (expired) return;
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/match/say', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, content }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(
          typeof json.error === 'string' ? json.error : 'Failed to send'
        );
        return;
      }
      setText('');
      // optimistic: append my message immediately for snappy feel
      setMessages((prev) => [
        ...prev,
        {
          id: json.data.id,
          content,
          createdAt: new Date().toISOString(),
          author: me,
        },
      ]);
    } catch {
      setError('Failed to send (are you signed in?)');
    } finally {
      setBusy(false);
    }
  }

  function avatar(u: UserLite) {
    return u.avatarUrl && u.avatarUrl.trim() !== ''
      ? u.avatarUrl
      : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
          u.username
        )}`;
  }

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60">
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/70 p-4">
        <div className="flex items-center gap-3">
          <img
            src={avatar(me)}
            className="h-9 w-9 rounded-full border border-zinc-800 object-cover"
            alt=""
          />
          <span className="text-zinc-300">@{me.username}</span>
          <span className="text-zinc-500">vs</span>
          <img
            src={avatar(opponent)}
            className="h-9 w-9 rounded-full border border-zinc-800 object-cover"
            alt=""
          />
          <span className="text-zinc-300">@{opponent.username}</span>
        </div>
        <div
          className={`rounded-md px-2 py-1 text-sm font-semibold ${
            expired
              ? 'bg-zinc-800 text-zinc-400'
              : 'bg-fuchsia-600/20 text-fuchsia-200 border border-fuchsia-600/40'
          }`}
        >
          ⏳ {timeLeft}
        </div>
      </div>

      {/* feed */}
      <div ref={listRef} className="h-[360px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-zinc-500">
            No insults yet. Break the ice 🔪
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.author.username === me.username;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-xl border px-3 py-2 text-sm ${
                    mine
                      ? 'border-fuchsia-600/40 bg-fuchsia-600/15 text-fuchsia-100'
                      : 'border-zinc-700/60 bg-zinc-900/70 text-zinc-100'
                  }`}
                >
                  <div className="mb-1 text-xs text-zinc-400">
                    @{m.author.username} •{' '}
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* composer */}
      <form
        onSubmit={send}
        className="flex items-start gap-2 border-t border-zinc-800/70 p-3"
      >
        <textarea
          className="min-h-[44px] flex-1 rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-sm outline-none placeholder:text-zinc-500"
          placeholder={expired ? 'Match ended.' : `Go for the jugular…`}
          disabled={expired}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={expired || busy || text.trim().length === 0}
          className="rounded-lg bg-fuchsia-200 px-3 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
        >
          {expired ? 'Ended' : busy ? 'Sending…' : 'Send'}
        </button>
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </form>
    </div>
  );
}
