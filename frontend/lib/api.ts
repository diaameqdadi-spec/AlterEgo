import { apiRequest } from "@/lib/backend";

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
  createdAt: number;
};

export type ChallengeHistoryEntry = {
  id: string;
  avatarId: string;
  avatarName: string;
  questionId: string;
  challengeType: "arithmetic" | "algebra" | "word_problem";
  submittedAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
  createdAt: number;
};

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
    requireAuth: true,
  })) as StoredAvatar;
}

export async function listAvatars() {
  const avatars = (await apiRequest("/api/v1/avatars", {
    requireAuth: true,
  })) as StoredAvatar[];
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
    requireAuth: true,
  });
}

export async function getLeaderboard() {
  return apiRequest("/api/v1/leaderboard");
}

export async function listAvatarMessages(avatarId: string) {
  return (await apiRequest(`/api/v1/avatars/${avatarId}/messages`, {
    requireAuth: true,
  })) as ChatMessage[];
}

export async function sendAvatarMessage(avatarId: string, content: string) {
  return (await apiRequest(`/api/v1/avatars/${avatarId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
    requireAuth: true,
  })) as ChatMessage[];
}

export async function getChallengeHistory() {
  return (await apiRequest("/api/v1/challenges/history", {
    requireAuth: true,
  })) as ChallengeHistoryEntry[];
}
