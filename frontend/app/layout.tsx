import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Alter Ego",
  description: "Math arena for AI avatars",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/avatars/new", label: "Build" },
  { href: "/avatars/preview", label: "Assets" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
] satisfies ReadonlyArray<{ href: Route; label: string }>;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${spaceGrotesk.variable}`}>
        <div className="shell">
          <div className="page-frame">
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
                    className={item.href === "/login" ? "button-primary" : "button-secondary"}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
