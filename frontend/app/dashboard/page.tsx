"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { fetchCurrentUser, logoutAccount, type AuthUser } from "@/lib/auth";
import {
  getPrimaryAvatar,
  listAvatarMessages,
  sendAvatarMessage,
  type Avatar,
  type ChatMessage,
} from "@/lib/api";
import { getAvatarPresetById } from "@/lib/avatar-presets";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await fetchCurrentUser();
        if (!currentUser) {
          setStatus("You are not signed in yet.");
          return;
        }
        setUser(currentUser);
      } catch (error) {
        setUser(null);
        setStatus(error instanceof Error ? error.message : "Session unavailable.");
      }
    }

    void loadUser();
  }, []);

  useEffect(() => {
    async function loadAvatar() {
      const currentAvatar = await getPrimaryAvatar();
      setAvatar(currentAvatar);
      if (currentAvatar) {
        setMessages(listAvatarMessages(currentAvatar.id));
      }
    }

    void loadAvatar();
  }, [user]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutAccount();
      setUser(null);
      setStatus("Signed out.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!avatar || !messageInput.trim()) {
      return;
    }

    setIsSending(true);
    try {
      const nextMessages = await sendAvatarMessage(avatar.id, messageInput);
      setMessages(nextMessages);
      setMessageInput("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Message failed.");
    } finally {
      setIsSending(false);
    }
  }

  const avatarPreset = avatar ? getAvatarPresetById(avatar.appearanceId) : null;

  return (
    <main className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="panel">
        <p className="eyebrow">Dashboard</p>
        <h1 className="display mt-3 text-4xl font-semibold">
          {user ? `Welcome, ${user.displayName}` : "Account required"}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/62">
          This is the first signed-in surface for Alter Ego. From here, we can
          expand into avatar management, challenge history, and account settings.
        </p>

        {status ? <p className="mt-5 text-sm text-[#ff9c8b]">{status}</p> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/avatars/new" className="button-primary">
            Build Avatar
          </Link>
          <Link href="/challenges" className="button-secondary">
            Open Challenges
          </Link>
          {user ? (
            <button
              type="button"
              className="button-secondary"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </button>
          ) : null}
          {!user ? (
            <Link href="/signup" className="button-secondary">
              Create Account
            </Link>
          ) : null}
        </div>
      </section>

      <aside className="panel">
        <p className="eyebrow">Avatar Console</p>
        {user && avatar ? (
          <div className="mt-4 space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-28 w-24 items-center justify-center rounded-[22px] bg-[#0b1320]">
                  {avatarPreset?.preview}
                </div>
                <div>
                  <p className="text-sm text-white/42">Current avatar</p>
                  <p className="display mt-1 text-2xl font-semibold">{avatar.name}</p>
                  <p className="mt-2 text-sm text-white/58">{avatar.persona}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-white/52">Chat with your avatar</p>
                <p className="text-xs text-white/38">{messages.length} messages</p>
              </div>
              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <p className="text-sm text-white/48">
                    Start a conversation. Ask who it is, what it does, or how it would
                    approach a challenge.
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-3xl px-4 py-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "ml-auto max-w-[85%] rounded-br-md bg-[#3c73ff] text-white"
                          : "max-w-[88%] rounded-bl-md bg-white/[0.05] text-white/76"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
                <input
                  className="input"
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder={`Message ${avatar.name}`}
                />
                <button type="submit" className="button-primary" disabled={isSending}>
                  {isSending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        ) : user ? (
          <div className="mt-4 space-y-4 text-sm text-white/62">
            <p>No avatar yet. Create one to make your dashboard feel alive.</p>
            <Link href="/avatars/new" className="button-secondary">
              Create your first avatar
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-sm text-white/62">
            <p>Create an account in Supabase, then sign in to unlock the dashboard.</p>
            <Link href="/signup" className="button-secondary">
              Go to Signup
            </Link>
          </div>
        )}
      </aside>
    </main>
  );
}
