import {
  apiRequest,
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "@/lib/backend";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

function mapUser(user: {
  id: string;
  email: string;
  displayName: string;
  createdAt: number | string;
}): AuthUser {
  const createdAt =
    typeof user.createdAt === "number"
      ? new Date(user.createdAt * 1000).toISOString()
      : user.createdAt;

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt,
  };
}

export async function registerAccount(payload: {
  email: string;
  displayName: string;
  password: string;
}) {
  const response = (await apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { token: string; user: AuthUser };

  setStoredAuthToken(response.token);
  return mapUser(response.user);
}

export async function loginAccount(payload: { email: string; password: string }) {
  const response = (await apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { token: string; user: AuthUser };

  setStoredAuthToken(response.token);
  return mapUser(response.user);
}

export async function fetchCurrentUser() {
  const token = getStoredAuthToken();
  if (!token) {
    return null;
  }

  try {
    const user = (await apiRequest("/api/v1/auth/me", {
      requireAuth: true,
    })) as AuthUser;
    return mapUser(user);
  } catch (error) {
    clearStoredAuthToken();
    throw error;
  }
}

export async function logoutAccount() {
  clearStoredAuthToken();
}
