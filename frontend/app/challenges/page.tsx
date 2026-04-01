"use client";

import { FormEvent, useEffect, useState } from "react";
import { getAvatarPresetById } from "@/lib/avatar-presets";
import { listAvatars, runChallenge } from "@/lib/api";

type Avatar = {
  id: string;
  name: string;
  persona: string;
  appearanceId: string;
  totalScore: number;
  challengesAttempted: number;
};

const challengeOptions = [
  { id: "arith-001", label: "12 x 8" },
  { id: "alg-001", label: "Solve 2x + 7 = 19" },
  { id: "word-001", label: "A bag has 3 red and 5 blue marbles..." },
];

export default function ChallengesPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [questionId, setQuestionId] = useState(challengeOptions[0].id);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAvatars() {
      try {
        const data = await listAvatars();
        setAvatars(data);
        if (data.length > 0) {
          setSelectedAvatarId(data[0].id);
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load avatars.");
      } finally {
        setLoading(false);
      }
    }

    void loadAvatars();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    try {
      const result = await runChallenge(selectedAvatarId, questionId);
      setStatus(
        `${result.avatarName} answered "${result.submittedAnswer}" and ${
          result.isCorrect ? "earned a point." : "missed the problem."
        }`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to run challenge.");
    }
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <section className="panel">
        <p className="eyebrow">Challenge Runner</p>
        <h1 className="display mt-3 text-4xl font-semibold">Run a benchmark round</h1>
        <p className="mt-4 text-sm leading-7 text-white/62">
          Run your selected avatar through one of the current math challenge
          tracks and update its local score instantly.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/84">Select avatar</span>
            <select
              className="input"
              value={selectedAvatarId}
              onChange={(event) => setSelectedAvatarId(event.target.value)}
              disabled={loading || avatars.length === 0}
            >
              {avatars.length === 0 ? (
                <option value="">Create an avatar first</option>
              ) : (
                avatars.map((avatar) => (
                  <option key={avatar.id} value={avatar.id}>
                    {avatar.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/84">Select challenge</span>
            <select
              className="input"
              value={questionId}
              onChange={(event) => setQuestionId(event.target.value)}
            >
              {challengeOptions.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="button-primary"
            disabled={!selectedAvatarId || avatars.length === 0}
          >
            Run Challenge
          </button>
        </form>

        {status ? <p className="mt-4 text-sm text-[#9ff8dd]">{status}</p> : null}
      </section>

      <aside className="panel">
        <p className="eyebrow">Benchmark Notes</p>
        <h2 className="display mt-3 text-3xl font-semibold">
          Accuracy is the first public signal.
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/62">
          Speed, difficulty weighting, anti-cheating checks, and model-provider
          comparisons can come later. The MVP just needs a trustworthy baseline.
        </p>

        {selectedAvatarId ? (
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            {(() => {
              const activeAvatar = avatars.find((avatar) => avatar.id === selectedAvatarId);
              if (!activeAvatar) {
                return null;
              }
              const preset = getAvatarPresetById(activeAvatar.appearanceId);
              return (
                <div className="space-y-4">
                  <div className="flex h-28 items-center justify-center rounded-[22px] bg-[#0b1320]">
                    {preset.preview}
                  </div>
                  <div>
                    <p className="display text-2xl font-medium">{activeAvatar.name}</p>
                    <p className="mt-2 text-sm text-white/56">{activeAvatar.persona}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}
      </aside>
    </main>
  );
}
