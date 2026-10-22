"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/app/providers";
import { UserAvatar } from "@/components/user-avatar";

export function SiteHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const links = [{ href: "/exams", label: "Exams" }, ...(user ? [{ href: "/dashboard", label: "Dashboard" }, { href: "/profile", label: "Profile" }] : []), ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : [])];

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
      <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-white"><span className="grid h-8 w-8 grid-cols-2 gap-0.5 rounded-lg bg-indigo-400/15 p-1.5"><i className="rounded-sm bg-indigo-300"/><i className="rounded-sm bg-indigo-300/65"/><i className="rounded-sm bg-indigo-300/65"/><i className="rounded-sm bg-indigo-300"/></span>PrepTrack</Link>
      <nav className="hidden items-center gap-1 sm:flex sm:gap-2" aria-label="Main navigation">{links.map((link) => <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white">{link.label}</Link>)}</nav>
      <div className="flex items-center justify-end gap-2">
        <details className="relative sm:hidden"><summary aria-label="Open navigation" className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg text-zinc-300 hover:bg-white/5"><Menu size={19}/></summary><nav aria-label="Mobile navigation" className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl">{links.map((link) => <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white">{link.label}</Link>)}</nav></details>
        {user ? <details className="relative"><summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-3 text-sm text-zinc-200 hover:bg-white/10"><UserAvatar user={user}/><span className="hidden max-w-28 truncate sm:block">{user.name.split(" ")[0]}</span></summary><div className="absolute right-0 top-12 w-56 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"><div className="px-3 py-2"><p className="truncate text-sm font-medium text-white">{user.name}</p><p className="truncate text-xs text-zinc-500">{user.email}</p></div><div className="my-1 border-t border-white/10"/><button onClick={handleLogout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">Sign out</button></div></details> : <Link href="/#sign-in" className="rounded-lg bg-indigo-400 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-indigo-300">Sign in</Link>}
      </div>
    </div>
  </header>;
}
