"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { fetchCurrentUser, type AuthUser } from "@/lib/auth";

type NavItem = {
  href: Route;
  label: string;
  primary?: boolean;
};

export function SiteHeader() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    }

    void loadUser();
  }, []);

  const navItems: NavItem[] = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/avatars/new", label: "Build" },
        { href: "/avatars/preview", label: "Assets" },
      ]
    : [
        { href: "/login", label: "Login" },
        { href: "/signup", label: "Signup", primary: true },
      ];

  return (
    <header className="topbar mb-4 flex items-center justify-between gap-4 rounded-[26px]">
      <Link href="/" className="brandmark display text-2xl font-semibold tracking-tight">
        <span className="brandmark-core">Alter</span>
        <span className="brandmark-flip">
          <span>Ego</span>
        </span>
      </Link>
      <nav className="flex items-center gap-2 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.primary ? "button-primary" : "button-secondary"}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
