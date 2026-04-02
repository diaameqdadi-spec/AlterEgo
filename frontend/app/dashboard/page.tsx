"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, logoutAccount, type AuthUser } from "@/lib/auth";
import {
  getChallengeHistory,
  getPrimaryAvatar,
  listAvatarMessages,
  sendAvatarMessage,
  type Avatar,
  type ChallengeHistoryEntry,
  type ChatMessage,
} from "@/lib/api";
import { getAvatarPresetById } from "@/lib/avatar-presets";

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}

function formatChallengeLabel(entry: ChallengeHistoryEntry) {
  if (entry.questionId === "arith-001") {
    return "12 x 8";
  }
  if (entry.questionId === "alg-001") {
    return "2x + 7 = 19";
  }
  if (entry.questionId === "word-001") {
    return "Marble bag update";
  }
  return entry.questionId;
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ChallengeHistoryEntry[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsBooting(true);
      try {
        const currentUser = await fetchCurrentUser();
        if (!currentUser) {
          setUser(null);
          setStatus("You are not signed in yet.");
          return;
        }

        setUser(currentUser);
        const [currentAvatar, attempts] = await Promise.all([
          getPrimaryAvatar(),
          getChallengeHistory(),
        ]);
        setAvatar(currentAvatar);
        setHistory(attempts);

        if (currentAvatar) {
          const avatarMessages = await listAvatarMessages(currentAvatar.id);
          setMessages(avatarMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        setUser(null);
        setAvatar(null);
        setMessages([]);
        setHistory([]);
        setStatus(error instanceof Error ? error.message : "Dashboard unavailable.");
      } finally {
        setIsBooting(false);
      }
    }

    void loadDashboard();
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutAccount();
      setUser(null);
      setAvatar(null);
      setMessages([]);
      setHistory([]);
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
    setStatus(null);
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
  const recentHistory = history.slice(0, 5);
  const accuracy = useMemo(() => {
    if (!avatar || avatar.challengesAttempted === 0) {
      return 0;
    }
    return Math.round((avatar.totalScore / avatar.challengesAttempted) * 100);
  }, [avatar]);

  return (
    <main className="space-y-6">
      <section className="dashboard-hero panel overflow-hidden">
        <div className="dashboard-noise" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <span className="status-pill">
              {avatar ? "Live avatar session" : "Account surface"}
            </span>
            <div className="space-y-4">
              <h1 className="display max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
                {user ? `${user.displayName}'s identity console` : "Account access required"}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/62 md:text-base">
                A sharper operating surface for your alter ego: persistent avatars,
                benchmark memory, and a chat console that can now route through the
                actual model layer when your API key is configured.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="metric-card">
                <p className="metric-label">Active avatar</p>
                <p className="metric-value">{avatar?.name ?? "None yet"}</p>
                <p className="metric-subtle">
                  {avatar ? avatarPreset?.name ?? "Configured" : "Create one to begin"}
                </p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Accuracy</p>
                <p className="metric-value">{accuracy}%</p>
                <p className="metric-subtle">
                  {avatar?.challengesAttempted ?? 0} tracked attempts
                </p>
              </div>
              <div className="metric-card">
                <p className="metric-label">Conversation depth</p>
                <p className="metric-value">{messages.length}</p>
                <p className="metric-subtle">persisted chat turns</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/avatars/new" className="button-primary">
                Build Avatar
              </Link>
              <Link href="/challenges" className="button-secondary">
                Run Challenges
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
              ) : (
                <Link href="/signup" className="button-secondary">
                  Create Account
                </Link>
              )}
            </div>

            {status ? <p className="text-sm text-[#ff9c8b]">{status}</p> : null}
          </div>

          <div className="relative">
            <div className="dashboard-orb -right-10 top-0 h-48 w-48 bg-[#3f79ff]/25" />
            <div className="dashboard-orb bottom-4 left-8 h-40 w-40 bg-[#3ad9bc]/16" />
            <div className="dashboard-card-stack">
              <div className="dashboard-profile-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Current Persona</p>
                    <h2 className="display mt-3 text-3xl font-semibold">
                      {avatar?.name ?? "No avatar"}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/62">
                      {avatar?.persona ??
                        "Create an avatar to unlock a personalized chat and challenge workflow."}
                    </p>
                  </div>
                  <div className="flex h-28 w-24 items-center justify-center rounded-[22px] bg-[#0b1320] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    {avatarPreset?.preview}
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                      Total score
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white/92">
                      {avatar?.totalScore ?? 0}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                      Strategy profile
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/68">
                      {avatar?.mathStrategy ?? "No strategy configured yet."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="dashboard-float-card">
                <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                  Session Mode
                </p>
                <p className="mt-2 text-sm text-white/72">
                  {process.env.NEXT_PUBLIC_API_BASE_URL
                    ? "Remote API configured"
                    : "Local API default active"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel chat-shell">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Avatar Console</p>
              <h2 className="display mt-3 text-3xl font-semibold">
                {avatar ? `Talk to ${avatar.name}` : "No avatar online"}
              </h2>
            </div>
            <div className="rounded-full border border-[#7ce7ca]/20 bg-[#7ce7ca]/10 px-3 py-1 text-xs font-medium text-[#9ff8dd]">
              {avatar ? "AI-backed chat ready" : "Waiting for avatar"}
            </div>
          </div>

          <div className="chat-stage mt-6">
            <div className="chat-thread">
              {isBooting ? (
                <div className="space-y-3">
                  <div className="skeleton-bubble h-16 w-[72%]" />
                  <div className="skeleton-bubble ml-auto h-14 w-[58%]" />
                  <div className="skeleton-bubble h-16 w-[66%]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-empty-state">
                  <p className="text-lg font-medium text-white/86">
                    Start the first exchange.
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/52">
                    Ask about study style, challenge tactics, confidence framing, or
                    how this avatar should represent you. Replies persist and can use
                    the real model layer when `OPENAI_API_KEY` is set on the backend.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-bubble ${
                      message.role === "user" ? "chat-bubble-user" : "chat-bubble-avatar"
                    }`}
                  >
                    <p className="chat-bubble-role">
                      {message.role === "user" ? user?.displayName ?? "You" : avatar?.name}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                      {message.content}
                    </p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/34">
                      {formatTimestamp(message.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="chat-compose">
              <input
                className="input"
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder={avatar ? `Message ${avatar.name}` : "Create an avatar first"}
                disabled={!avatar || isSending}
              />
              <button
                type="submit"
                className="button-primary min-w-[120px]"
                disabled={!avatar || isSending || !messageInput.trim()}
              >
                {isSending ? "Thinking..." : "Send"}
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Challenge Memory</p>
                <h2 className="display mt-3 text-3xl font-semibold">Recent rounds</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/48">
                {history.length} total
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {recentHistory.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm leading-7 text-white/50">
                  No challenge history yet. Run benchmark rounds and this feed will
                  start reflecting the avatar's actual performance.
                </div>
              ) : (
                recentHistory.map((entry) => (
                  <article key={entry.id} className="timeline-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white/88">
                          {formatChallengeLabel(entry)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">
                          {entry.challengeType.replace("_", " ")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          entry.isCorrect
                            ? "bg-[#7ce7ca]/12 text-[#9ff8dd]"
                            : "bg-[#ff8b7a]/12 text-[#ffb5a7]"
                        }`}
                      >
                        {entry.isCorrect ? "Correct" : "Miss"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/34">
                          Submitted
                        </p>
                        <p className="mt-1 text-sm text-white/72">{entry.submittedAnswer}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/34">
                          Expected
                        </p>
                        <p className="mt-1 text-sm text-white/72">{entry.expectedAnswer}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-white/30">
                      {formatTimestamp(entry.createdAt)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Interaction Notes</p>
            <h2 className="display mt-3 text-3xl font-semibold">What changed</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/64">
              <p>
                Chat history now persists on the backend, so the console survives refreshes
                and follows the authenticated owner.
              </p>
              <p>
                When the backend has `OPENAI_API_KEY`, avatar replies route through the real
                model. Without it, the app falls back to a deterministic local persona reply.
              </p>
              <p>
                The dashboard is now built like a live control surface instead of a placeholder
                card stack, with clearer hierarchy, motion, and state feedback.
              </p>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
