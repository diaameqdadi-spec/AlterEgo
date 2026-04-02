import { apiRequest } from "@/lib/backend";

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

function getChatStorageKey(avatarId: string) {
  return `${STORAGE_PREFIX}:chat:${avatarId}`;
}

function sortAvatars(avatars: StoredAvatar[]) {
  return [...avatars].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    return a.name.localeCompare(b.name);
  });
}

export async function createAvatar(payload: AvatarPayload) {
  return (await apiRequest("/api/v1/avatars", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as StoredAvatar;
}

export async function listAvatars() {
  const avatars = (await apiRequest("/api/v1/avatars")) as StoredAvatar[];
  return sortAvatars(avatars);
}

export async function getPrimaryAvatar() {
  const avatars = await listAvatars();
  return avatars[0] ?? null;
}

export async function runChallenge(avatarId: string, questionId: string) {
  return apiRequest("/api/v1/challenges/run", {
    method: "POST",
    body: JSON.stringify({ avatarId, questionId }),
  });
}

export async function getLeaderboard() {
  return apiRequest("/api/v1/leaderboard");
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
  const avatars = await listAvatars();
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
