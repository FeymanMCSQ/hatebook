// prisma/seeds/users.ts
import type { PrismaClient } from '@prisma/client';

type BareUser = {
  email: string;
  username: string;
  password: string; // NOTE: plain for dev. Replace with a proper hash before prod.
  bio?: string | null;
  avatarUrl?: string | null;
  shadeScore?: number;
  enemyCount?: number;
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;

// --- HATERS (6) ---
const haters: BareUser[] = [
  {
    email: 'doom@hatebook.local',
    username: 'doctor_doom',
    password: 'dev-password',
    shadeScore: 10,
    bio: 'Reed’s ‘genius’? A statistical anomaly. Bow before a true monarch.',
    avatarUrl: avatar('doctor_doom'),
  },
  {
    email: 'lex@hatebook.local',
    username: 'lex_luthor',
    password: 'dev-password',
    shadeScore: 9,
    bio: 'If adoration is the metric, then mediocrity must be the standard. Looking at you, alien.',
    avatarUrl: avatar('lex_luthor'),
  },
  {
    email: 'jjj@hatebook.local',
    username: 'j_jonah_jameson',
    password: 'dev-password',
    shadeScore: 7,
    bio: 'P MENACE! Read my op-ed. And the retraction? Never.',
    avatarUrl: avatar('j_jonah_jameson'),
  },
  {
    email: 'squidward@hatebook.local',
    username: 'squidward',
    password: 'dev-password',
    shadeScore: 6,
    bio: 'Art is dead. Noise is alive. Guess which one you are, SpongeBob.',
    avatarUrl: avatar('squidward'),
  },
  {
    email: 'stewie@hatebook.local',
    username: 'stewie_griffin',
    password: 'dev-password',
    shadeScore: 8,
    bio: 'Victory shall be mine—once I’m done scheduling mother’s downfall.',
    avatarUrl: avatar('stewie_griffin'),
  },
  {
    email: 'draco@hatebook.local',
    username: 'draco_malfoy',
    password: 'dev-password',
    shadeScore: 7,
    bio: 'Scarhead’s fame is an accident. Mine is destiny.',
    avatarUrl: avatar('draco_malfoy'),
  },
];

// --- TARGETS (6) ---
const targets: BareUser[] = [
  {
    email: 'reed@hatebook.local',
    username: 'reed_richards',
    password: 'dev-password',
    shadeScore: 0,
    bio: 'Currently calibrating a dimension hopper; happy to help, even Doom.',
    avatarUrl: avatar('reed_richards'),
  },
  {
    email: 'supes@hatebook.local',
    username: 'superman',
    password: 'dev-password',
    shadeScore: 0,
    bio: 'Doing my best. Be kind when you can. It’s always possible.',
    avatarUrl: avatar('superman'),
  },
  {
    email: 'spidey@hatebook.local',
    username: 'spider_man',
    password: 'dev-password',
    shadeScore: 0,
    bio: 'With great power comes great responsibility…and rent.',
    avatarUrl: avatar('spider_man'),
  },
  {
    email: 'spongebob@hatebook.local',
    username: 'spongebob',
    password: 'dev-password',
    shadeScore: 0,
    bio: 'I’m ready! I’m ready! :D',
    avatarUrl: avatar('spongebob'),
  },
  {
    email: 'lois@hatebook.local',
    username: 'lois_griffin',
    password: 'dev-password',
    shadeScore: 0,
    bio: 'Coffee, chaos, and keeping a family together.',
    avatarUrl: avatar('lois_griffin'),
  },
  {
    email: 'harry@hatebook.local',
    username: 'harry_potter',
    password: 'dev-password',
    shadeScore: 0,
    bio: 'Just trying to pass my N.E.W.T.s and not die, thanks.',
    avatarUrl: avatar('harry_potter'),
  },
];

export async function seedUsers(prisma: PrismaClient) {
  const all = [...haters, ...targets];

  for (const u of all) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        username: u.username,
        bio: u.bio ?? null,
        avatarUrl: u.avatarUrl ?? null,
        shadeScore: u.shadeScore ?? 0,
      },
      create: {
        email: u.email,
        username: u.username,
        password: u.password, // NOTE: replace with a hash before prod!
        bio: u.bio ?? null,
        avatarUrl: u.avatarUrl ?? null,
        shadeScore: u.shadeScore ?? 0,
      },
    });
  }

  return all.length; // 12
}
