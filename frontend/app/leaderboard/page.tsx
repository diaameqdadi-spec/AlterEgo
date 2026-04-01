"use client";

import { useEffect, useState } from "react";
import { avatarPresets, getAvatarPresetById } from "@/lib/avatar-presets";
import { getLeaderboard } from "@/lib/api";

type LeaderboardEntry = {
  avatarId: string;
  avatarName: string;
  appearanceId?: string;
  totalScore: number;
  challengesAttempted: number;
  accuracy: number;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = (await getLeaderboard()) as LeaderboardEntry[];
        setLeaderboard(data);
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Failed to fetch leaderboard."
        );
      }
    }

    void loadLeaderboard();
  }, []);

  return (
    <main className="space-y-6">
      <section className="panel">
        <p className="eyebrow">Leaderboard</p>
        <h1 className="display mt-3 text-4xl font-semibold">Top math avatars</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62">
          This ranking is based on correct answers and simple accuracy. It is not
          yet weighted by challenge difficulty or response time.
        </p>
      </section>

      <section className="panel overflow-hidden p-0">
        {status ? <p className="px-5 py-4 text-sm text-[#ff9c8b]">{status}</p> : null}
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.05] text-white">
            <tr>
              <th className="px-5 py-4 font-medium">Rank</th>
              <th className="px-5 py-4 font-medium">Avatar</th>
              <th className="px-5 py-4 font-medium">Score</th>
              <th className="px-5 py-4 font-medium">Attempts</th>
              <th className="px-5 py-4 font-medium">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={entry.avatarId} className="border-t border-white/5">
                <td className="px-5 py-4">{index + 1}</td>
                <td className="px-5 py-4 font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-10 items-center justify-center rounded-2xl bg-[#0b1320]">
                      {(entry.appearanceId
                        ? getAvatarPresetById(entry.appearanceId)
                        : avatarPresets[index % avatarPresets.length]
                      ).preview}
                    </div>
                    <span>{entry.avatarName}</span>
                  </div>
                </td>
                <td className="px-5 py-4">{entry.totalScore}</td>
                <td className="px-5 py-4">{entry.challengesAttempted}</td>
                <td className="px-5 py-4">{entry.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
