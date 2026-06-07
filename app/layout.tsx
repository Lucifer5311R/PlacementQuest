import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "./actions";
import { isAdminSession } from "@/lib/auth";
import "./globals.css";

import { Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "PlacementQuest | Recruiter Cockpit",
  description: "A professional student placement command registry and talent pipeline tracker.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdminSession();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-black text-zinc-100 selection:bg-yellow-500 selection:text-black min-h-screen" suppressHydrationWarning>
        <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-black/95 px-4 py-3 shadow-md backdrop-blur-md md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.05)]">
                <Terminal className="h-4 w-4" />
              </span>
              <span className="font-mono text-sm font-bold tracking-tight text-white">
                PLACEMENT<span className="text-yellow-500">QUEST</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold md:gap-3">
              <Link href="/" className="nav-link px-2 md:px-3">
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
              <Link href="/knowledge-hub" className="nav-link px-2 md:px-3">
                <span className="hidden sm:inline">Assessments</span>
                <span className="sm:hidden">Tests</span>
              </Link>
              <Link href="/admin" className="nav-link px-2 md:px-3">
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Link>
              <span className="mx-1 h-4 w-px bg-zinc-800" />
              {admin ? (
                <form action={logoutAction}>
                  <button className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-400 transition hover:border-zinc-700 hover:text-white">
                    Logout
                  </button>
                </form>
              ) : (
                <Link href="/login" className="rounded-lg border border-yellow-500/30 px-3 py-1.5 text-yellow-500 transition hover:bg-yellow-500 hover:text-black">
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 md:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
