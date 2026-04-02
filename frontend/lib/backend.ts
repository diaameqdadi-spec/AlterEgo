const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const AUTH_TOKEN_KEY = "alterego_auth_token";

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ||
    DEFAULT_API_BASE_URL
  );
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
}

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  requireAuth?: boolean;
};

export async function apiRequest(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const hasBody = options.body !== undefined && !headers.has("Content-Type");
  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  if (options.requireAuth) {
    const token = getStoredAuthToken();
    if (!token) {
      throw new Error("You must sign in first.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload && typeof payload.detail === "string"
        ? payload.detail
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return payload;
}
