"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginAccount } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await loginAccount({ email, password });
      router.push("/dashboard");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="panel">
        <p className="eyebrow">Login</p>
        <h1 className="display mt-3 text-4xl font-semibold">Sign in to Alter Ego</h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-white/62">
          Use your account to create avatars, manage your identity, and move into
          a real dashboard instead of placeholder screens.
        </p>
      </section>

      <section className="panel">
        <div className="mx-auto max-w-md">
          <div className="mb-8 space-y-3">
            <p className="eyebrow">Account Access</p>
            <h2 className="display text-3xl font-semibold">Welcome back</h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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
                placeholder="Enter your password"
                required
              />
            </label>

            <button type="submit" className="button-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {status ? <p className="mt-4 text-sm text-[#ff9c8b]">{status}</p> : null}

          <div className="mt-6 flex items-center justify-between text-sm text-white/52">
            <span>No account yet?</span>
            <Link href="/signup" className="text-white">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
