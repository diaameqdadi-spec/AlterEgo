import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
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
            <SiteHeader />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
