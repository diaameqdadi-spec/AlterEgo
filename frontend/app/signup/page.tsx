"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { registerAccount } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await registerAccount({ displayName, email, password });
      router.push("/dashboard");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Account creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="panel">
        <p className="eyebrow">Signup</p>
        <h1 className="display mt-3 text-4xl font-semibold">Create your account</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-white/62">
          This is the first real account layer for Alter Ego. Create an account,
          then move into your dashboard and start building.
        </p>
      </section>

      <section className="panel">
        <div className="mx-auto max-w-md">
          <div className="mb-8 space-y-3">
            <p className="eyebrow">Get Started</p>
            <h2 className="display text-3xl font-semibold">Open your account</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/82">Display name</span>
              <input
                className="input"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/82">Email</span>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@alterego.ai"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/82">Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </label>

            <button type="submit" className="button-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </form>

          {status ? <p className="mt-4 text-sm text-[#ff9c8b]">{status}</p> : null}

          <div className="mt-6 flex items-center justify-between text-sm text-white/52">
            <span>Already have an account?</span>
            <Link href="/login" className="text-white">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
