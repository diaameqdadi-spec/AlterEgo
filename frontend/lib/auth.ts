import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient> | null = null;

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

function ensureConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local."
    );
  }
}

function getSupabaseClient() {
  ensureConfigured();

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);
  }

  return supabaseClient;
}

function mapUser(user: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: { display_name?: string };
}): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    displayName: user.user_metadata?.display_name ?? user.email ?? "User",
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

export async function registerAccount(payload: {
  email: string;
  displayName: string;
  password: string;
}) {
  ensureConfigured();

  const { data, error } = await getSupabaseClient().auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        display_name: payload.displayName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Signup did not return a user.");
  }

  return mapUser(data.user);
}

export async function loginAccount(payload: { email: string; password: string }) {
  ensureConfigured();

  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Login did not return a user.");
  }

  return mapUser(data.user);
}

export async function fetchCurrentUser() {
  ensureConfigured();

  const {
    data: { user },
    error,
  } = await getSupabaseClient().auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    return null;
  }

  return mapUser(user);
}

export async function logoutAccount() {
  ensureConfigured();
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
