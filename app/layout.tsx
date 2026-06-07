import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "./actions";
import { isAdminSession } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlacementOS | Student Registry Dashboard",
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
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-yellow-500 bg-yellow-500/10 text-xs font-mono font-bold text-yellow-500">
                P_OS
              </span>
              <span className="hidden font-mono text-sm font-bold tracking-tight text-white sm:block">
                PLACEMENT<span className="text-yellow-500">_SYSTEM</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 text-xs font-mono font-bold md:gap-3">
              <Link href="/" className="nav-link">Dashboard</Link>
              <Link href="/knowledge-hub" className="nav-link">Assessments</Link>
              <Link href="/admin" className="nav-link">Admin Panel</Link>
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
