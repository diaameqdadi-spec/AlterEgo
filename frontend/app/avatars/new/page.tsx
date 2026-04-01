"use client";

import { FormEvent, useState } from "react";
import { avatarPresets } from "@/lib/avatar-presets";
import { createAvatar } from "@/lib/api";

export default function NewAvatarPage() {
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [appearanceId, setAppearanceId] = useState(avatarPresets[0].id);
  const [mathStrategy, setMathStrategy] = useState(
    "Solve carefully, show concise reasoning internally, and return the final numeric answer clearly."
  );
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const avatar = await createAvatar({ name, persona, mathStrategy, appearanceId });
      const preset = avatarPresets.find((item) => item.id === avatar.appearanceId);
      setStatus(
        `Created avatar ${avatar.name}${preset ? ` with the ${preset.name} appearance.` : "."}`
      );
      setName("");
      setPersona("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to create avatar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="panel">
        <p className="eyebrow">Avatar Builder</p>
        <h1 className="display mt-3 text-4xl font-semibold">Create your math alter ego</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
          The first version of an avatar is just structured prompt engineering.
          Pick a figurine appearance, name it, define its persona, then give it
          a strategy for how it should approach challenge problems.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="space-y-3">
            <span className="text-sm font-semibold text-white/84">Appearance</span>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {avatarPresets.map((preset) => {
                const isSelected = appearanceId === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAppearanceId(preset.id)}
                    className={`rounded-[26px] border p-4 text-left transition ${
                      isSelected
                        ? "border-white/30 bg-white/[0.08] shadow-[0_18px_40px_rgba(0,0,0,0.24)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-center rounded-[22px] bg-[#0b1320] py-3">
                      {preset.preview}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="display text-lg font-medium">{preset.name}</span>
                        {isSelected ? (
                          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#08111d]">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/42">
                        {preset.vibe}
                      </p>
                      <div
                        className={`mt-3 h-1.5 rounded-full bg-gradient-to-r ${preset.accentClass}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/84">Avatar name</span>
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Euler Echo"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/84">Persona</span>
            <textarea
              className="input min-h-28"
              value={persona}
              onChange={(event) => setPersona(event.target.value)}
              placeholder="A calm, confident tutor who explains clearly and avoids rushing."
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-white/84">Math strategy prompt</span>
            <textarea
              className="input min-h-36"
              value={mathStrategy}
              onChange={(event) => setMathStrategy(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Avatar"}
          </button>
        </form>

        {status ? <p className="mt-4 text-sm text-[#9ff8dd]">{status}</p> : null}
      </section>

      <aside className="panel border-white/10 bg-[#0f1928] text-white">
        <p className="eyebrow">Prompt Design</p>
        <h2 className="display mt-3 text-3xl font-semibold">
          Keep the first avatar model simple.
        </h2>
        <ul className="mt-6 space-y-4 text-sm leading-7 text-white/70">
          <li>Focus on accuracy before style.</li>
          <li>Use objective challenge types where answers can be checked reliably.</li>
          <li>Do not add provider switching until the benchmark loop is stable.</li>
        </ul>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">Selected figurine</p>
          <div className="mt-4 flex items-center justify-center rounded-[24px] bg-[#0b1320] py-5">
            {avatarPresets.find((preset) => preset.id === appearanceId)?.preview}
          </div>
          <p className="display mt-4 text-2xl font-medium">
            {avatarPresets.find((preset) => preset.id === appearanceId)?.name}
          </p>
          <p className="mt-2 text-sm text-white/58">
            {avatarPresets.find((preset) => preset.id === appearanceId)?.vibe}
          </p>
        </div>
      </aside>
    </main>
  );
}
