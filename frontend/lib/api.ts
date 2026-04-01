import { fetchCurrentUser } from "@/lib/auth";

const STORAGE_PREFIX = "alterego_avatars";

type AvatarPayload = {
  name: string;
  persona: string;
  mathStrategy: string;
  appearanceId: string;
};

type StoredAvatar = {
  id: string;
  name: string;
  persona: string;
  mathStrategy: string;
  appearanceId: string;
  totalScore: number;
  challengesAttempted: number;
  createdAt: string;
};

export type Avatar = StoredAvatar;

export type ChatMessage = {
  id: string;
  role: "user" | "avatar";
  content: string;
  createdAt: string;
};

type Challenge = {
  id: string;
  prompt: string;
  expectedAnswer: string;
  challengeType: "arithmetic" | "algebra" | "word_problem";
};

const CHALLENGES: Record<string, Challenge> = {
  "arith-001": {
    id: "arith-001",
    prompt: "What is 12 * 8?",
    expectedAnswer: "96",
    challengeType: "arithmetic",
  },
  "alg-001": {
    id: "alg-001",
    prompt: "Solve for x: 2x + 7 = 19",
    expectedAnswer: "6",
    challengeType: "algebra",
  },
  "word-001": {
    id: "word-001",
    prompt:
      "A bag has 3 red and 5 blue marbles. If you add 2 red marbles, how many red marbles are in the bag?",
    expectedAnswer: "5",
    challengeType: "word_problem",
  },
};

function getChatStorageKey(avatarId: string) {
  return `${STORAGE_PREFIX}:chat:${avatarId}`;
}

async function getStorageKey() {
  const user = await fetchCurrentUser().catch(() => null);
  return `${STORAGE_PREFIX}:${user?.id ?? "guest"}`;
}

async function readAvatars() {
  if (typeof window === "undefined") {
    return [] as StoredAvatar[];
  }

  const key = await getStorageKey();
  const raw = localStorage.getItem(key);
  if (!raw) {
    return [] as StoredAvatar[];
  }

  try {
    return JSON.parse(raw) as StoredAvatar[];
  } catch {
    return [] as StoredAvatar[];
  }
}

async function writeAvatars(avatars: StoredAvatar[]) {
  if (typeof window === "undefined") {
    return;
  }

  const key = await getStorageKey();
  localStorage.setItem(key, JSON.stringify(avatars));
}

function sortAvatars(avatars: StoredAvatar[]) {
  return [...avatars].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    return a.name.localeCompare(b.name);
  });
}

function simulateAvatarAnswer(avatar: StoredAvatar, challenge: Challenge) {
  const strategy = avatar.mathStrategy.toLowerCase();
  if (
    strategy.includes("double-check") ||
    strategy.includes("careful") ||
    strategy.includes("precise")
  ) {
    return challenge.expectedAnswer;
  }

  if (challenge.id === "arith-001") {
    return "94";
  }

  if (challenge.id === "alg-001") {
    return "5";
  }

  return "4";
}

export async function createAvatar(payload: AvatarPayload) {
  const avatars = await readAvatars();
  const avatar: StoredAvatar = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    persona: payload.persona.trim(),
    mathStrategy: payload.mathStrategy.trim(),
    appearanceId: payload.appearanceId.trim(),
    totalScore: 0,
    challengesAttempted: 0,
    createdAt: new Date().toISOString(),
  };

  avatars.push(avatar);
  await writeAvatars(avatars);
  return avatar;
}

export async function listAvatars() {
  return sortAvatars(await readAvatars());
}

export async function getPrimaryAvatar() {
  const avatars = sortAvatars(await readAvatars());
  return avatars[0] ?? null;
}

export async function runChallenge(avatarId: string, questionId: string) {
  const avatars = await readAvatars();
  const avatar = avatars.find((item) => item.id === avatarId);
  if (!avatar) {
    throw new Error("Avatar not found.");
  }

  const challenge = CHALLENGES[questionId];
  if (!challenge) {
    throw new Error("Challenge not found.");
  }

  const submittedAnswer = simulateAvatarAnswer(avatar, challenge);
  const isCorrect = submittedAnswer === challenge.expectedAnswer;

  avatar.challengesAttempted += 1;
  if (isCorrect) {
    avatar.totalScore += 1;
  }

  await writeAvatars(avatars);

  return {
    avatarId: avatar.id,
    avatarName: avatar.name,
    questionId: challenge.id,
    submittedAnswer,
    expectedAnswer: challenge.expectedAnswer,
    isCorrect,
    totalScore: avatar.totalScore,
    challengesAttempted: avatar.challengesAttempted,
    challengeType: challenge.challengeType,
  };
}

export async function getLeaderboard() {
  const avatars = sortAvatars(await readAvatars());
  return avatars.map((avatar) => ({
    avatarId: avatar.id,
    avatarName: avatar.name,
    appearanceId: avatar.appearanceId,
    totalScore: avatar.totalScore,
    challengesAttempted: avatar.challengesAttempted,
    accuracy: avatar.challengesAttempted
      ? Math.round((avatar.totalScore / avatar.challengesAttempted) * 100)
      : 0,
  }));
}

export function listAvatarMessages(avatarId: string) {
  if (typeof window === "undefined") {
    return [] as ChatMessage[];
  }

  const raw = localStorage.getItem(getChatStorageKey(avatarId));
  if (!raw) {
    return [] as ChatMessage[];
  }

  try {
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [] as ChatMessage[];
  }
}

export async function sendAvatarMessage(avatarId: string, content: string) {
  const avatars = await readAvatars();
  const avatar = avatars.find((item) => item.id === avatarId);
  if (!avatar) {
    throw new Error("Avatar not found.");
  }

  const messages = listAvatarMessages(avatarId);
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
  const avatarMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "avatar",
    content: generateAvatarReply(avatar, userMessage.content),
    createdAt: new Date().toISOString(),
  };

  const nextMessages = [...messages, userMessage, avatarMessage];
  localStorage.setItem(getChatStorageKey(avatarId), JSON.stringify(nextMessages));
  return nextMessages;
}

function generateAvatarReply(avatar: StoredAvatar, userInput: string) {
  const lowerInput = userInput.toLowerCase();

  if (lowerInput.includes("who are you")) {
    return `I am ${avatar.name}. ${avatar.persona}`;
  }

  if (lowerInput.includes("math") || lowerInput.includes("challenge")) {
    return `I am tuned for challenge work. My strategy is: ${avatar.mathStrategy}`;
  }

  if (lowerInput.includes("help")) {
    return `I can help shape your identity, prepare for challenges, and respond in the style you gave me.`;
  }

  return `${avatar.name} here. I would approach that with this persona: ${avatar.persona}`;
}
