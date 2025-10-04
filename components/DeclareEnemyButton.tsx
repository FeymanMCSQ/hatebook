// components/DeclareEnemyButton.tsx
'use client';

import { useState } from 'react';

type Props = {
  targetUserId: string;
  disabled?: boolean; // e.g., when viewing your own profile
  initiallyEnemy?: boolean; // if you already declared them
};

type DeclareEnemyResponse =
  | {
      success: true;
      data: { enemy: { id: string; userId: string; enemyId: string } };
    }
  | { error: string };

export default function DeclareEnemyButton({
  targetUserId,
  disabled = false,
  initiallyEnemy = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [isEnemy, setIsEnemy] = useState(initiallyEnemy);

  async function declareEnemy() {
    if (loading || disabled || isEnemy) return;
    setLoading(true);
    try {
      const res = await fetch('/api/enemies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enemyId: targetUserId }),
      });

      let json: DeclareEnemyResponse;
      try {
        json = (await res.json()) as DeclareEnemyResponse;
      } catch {
        console.error(`Invalid JSON (status ${res.status})`);
        return;
      }

      if (!res.ok || !('success' in json)) {
        console.error('error' in json ? json.error : `HTTP ${res.status}`);
        return;
      }

      setIsEnemy(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={declareEnemy}
      disabled={disabled || isEnemy || loading}
      className={[
        'rounded-xl px-3 py-1.5 text-sm transition border',
        isEnemy
          ? 'cursor-default border-fuchsia-800/40 bg-fuchsia-900/20 text-fuchsia-200'
          : 'border-fuchsia-700/40 bg-fuchsia-700/15 text-fuchsia-200 hover:bg-fuchsia-700/25 disabled:opacity-60',
      ].join(' ')}
    >
      {isEnemy ? 'Enemy declared' : loading ? 'Declaring…' : 'Declare enemy'}
    </button>
  );
}
