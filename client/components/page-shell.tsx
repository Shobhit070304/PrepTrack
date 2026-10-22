"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { SiteHeader } from "@/components/site-header";

export function PageShell({ children, width = "max-w-7xl" }: { children: ReactNode; width?: string }) {
  return <div className="min-h-screen bg-[#09090b] text-zinc-100"><SiteHeader/><main className={`mx-auto ${width} px-5 py-10 sm:px-8 sm:py-14`}>{children}</main></div>;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="mb-8"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>{description && <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>}</div>;
}

export function LoadingCard({ label = "Loading" }: { label?: string }) {
  return <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5" aria-label={label}>{["w-1/3", "w-5/6", "w-2/3"].map((width) => <div key={width} className={`h-3 animate-pulse rounded bg-white/10 ${width}`}/>)}</div>;
}

export function ErrorNotice({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{message}</div>;
}

export function AuthGate({ children, role }: { children: ReactNode; role?: "ADMIN" }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace("/"); }, [ready, user, router]);
  if (!ready || !user) return <PageShell width="max-w-3xl"><LoadingCard label="Checking your session"/></PageShell>;
  if (role === "ADMIN" && user.role !== "ADMIN") return <PageShell width="max-w-3xl"><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">403 · RESTRICTED</p><h1 className="mt-3 text-2xl font-semibold text-white">Not allowed</h1><p className="mt-2 text-sm text-zinc-400">Your account does not have administrator access.</p></div></PageShell>;
  return children;
}
