import Link from "next/link";
import { avatarPresets } from "@/lib/avatar-presets";

export default function HomePage() {
  const floatingPresets = [avatarPresets[0], avatarPresets[3], avatarPresets[5]];

  return (
    <main>
      <section className="hero-stage min-h-[calc(100vh-5.5rem)] px-6 py-8 md:px-10 md:py-10">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/videos/website-demo.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay" />
        <div className="hero-lines" />
        <div className="hero-ring left-[58%] top-[18%] h-64 w-64" />
        <div className="hero-ring left-[64%] top-[12%] h-96 w-96 opacity-60" />
        <div className="hero-orb hero-glow right-[18%] top-[18%] h-52 w-52 bg-[#4f7cff]/28" />
        <div className="hero-orb hero-glow bottom-[18%] right-[10%] h-60 w-60 bg-[#35d1b8]/18" />

        <div className="relative grid min-h-[calc(100vh-10rem)] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="max-w-2xl space-y-6">
            <span className="status-pill">AI identity, simplified</span>
            <h1 className="display text-5xl font-semibold leading-[0.98] md:text-7xl">
              Create an alter ego worth interacting with.
            </h1>
            <p className="max-w-xl text-base leading-8 text-white/62 md:text-lg">
              A cleaner social AI experience where people build an AI persona,
              talk to it, and eventually challenge it. Less clutter. More identity.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/login" className="button-primary">
                Get Started
              </Link>
              <Link href="/avatars/new" className="button-secondary">
                Build Avatar
              </Link>
            </div>
          </div>

          <div className="relative h-[460px] lg:h-[560px]">
            <div className="hero-float absolute left-[6%] top-[12%] z-10 rounded-[26px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
              <div className="flex h-24 w-20 items-center justify-center rounded-[20px] bg-[#0b1320]">
                {floatingPresets[0].preview}
              </div>
            </div>
            <div className="hero-float absolute right-[2%] top-[16%] z-10 rounded-[26px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl [animation-delay:1.1s]">
              <div className="flex h-24 w-20 items-center justify-center rounded-[20px] bg-[#0b1320]">
                {floatingPresets[1].preview}
              </div>
            </div>
            <div className="hero-float absolute left-[18%] bottom-[6%] z-10 rounded-[26px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl [animation-delay:2s]">
              <div className="flex h-24 w-20 items-center justify-center rounded-[20px] bg-[#0b1320]">
                {floatingPresets[2].preview}
              </div>
            </div>

            <div className="hero-float absolute inset-x-[8%] top-[6%] rounded-[32px] border border-white/10 bg-[#0f1928]/88 p-5 shadow-[0_35px_100px_rgba(0,0,0,0.34)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Live Preview</p>
                  <h2 className="display mt-2 text-2xl font-semibold">Aura</h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  online
                </span>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-white/45">Persona</p>
                <p className="mt-2 text-lg font-medium text-white/90">
                  Calm, sharp, articulate, and slightly mysterious.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/58">
                    creative
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/58">
                    social
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/58">
                    adaptive
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-float absolute inset-x-[24%] top-[44%] rounded-[32px] border border-white/10 bg-[#111f31]/84 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl [animation-delay:1.4s]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-white/50">Conversation</p>
                <p className="text-xs text-white/38">live</p>
              </div>
              <div className="space-y-3">
                <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-white/[0.04] px-4 py-3 text-sm text-white/70">
                  Help me shape a smarter version of myself.
                </div>
                <div className="ml-auto max-w-[88%] rounded-3xl rounded-br-md bg-[#3c73ff] px-4 py-3 text-sm text-white">
                  I can become your social persona, your challenge agent, or both.
                </div>
              </div>
            </div>

            <div className="absolute bottom-[8%] left-[10%] right-[38%] rounded-[30px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <p className="text-sm text-white/44">One profile. One identity. One clean surface.</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#5f86ff] via-[#6ca6ff] to-[#4ce0c2]" />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/42">
                <span>identity setup</span>
                <span>72%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
