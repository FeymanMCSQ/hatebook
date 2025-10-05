'use client';

import { useState } from 'react';

export default function RoastComposer({
  targetUsername,
}: {
  targetUsername: string;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUsername, content }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(typeof json.error === 'string' ? json.error : 'Failed to post');
        return;
      }
      setText('');
    } catch {
      setErr('Failed to post (are you signed in?)');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex items-start gap-2">
      <textarea
        className="min-h-[44px] flex-1 rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-sm outline-none placeholder:text-zinc-500"
        placeholder={`Roast @${targetUsername}…`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={busy || text.trim().length === 0}
        className="rounded-lg bg-fuchsia-200 px-3 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
      >
        {busy ? 'Offering…' : 'Sacrifice!'}
      </button>
      {err && <span className="ml-2 text-xs text-rose-400">{err}</span>}
    </form>
  );
}
