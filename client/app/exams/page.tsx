"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, Sparkles } from "lucide-react";
import { ExamCard } from "@/components/exam-card";
import { ErrorNotice, LoadingCard, PageHeading, PageShell } from "@/components/page-shell";
import { useExams } from "@/lib/queries";

export default function ExamsPage() {
  const exams = useExams();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => (exams.data ?? []).filter((exam) => `${exam.name} ${exam.description ?? ""}`.toLowerCase().includes(search.trim().toLowerCase())), [exams.data, search]);

  return <PageShell>
    <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/[0.14] via-zinc-900 to-zinc-900 p-7 sm:p-10 lg:p-12"><div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"/><div className="relative max-w-2xl"><p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-indigo-200"><Sparkles size={14}/> Your next milestone</p><h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Find the exam you’re preparing for.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">Explore available exams and open any syllabus to see its subjects and topics. You can browse without signing in.</p></div><div className="relative mt-8 flex flex-wrap gap-5 text-xs text-zinc-500"><span className="inline-flex items-center gap-2"><BookOpen size={14} className="text-indigo-200"/> Full syllabus access</span><span>Personal progress tracking when you sign in</span></div></section>
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><PageHeading eyebrow="EXAM CATALOG" title="Available exams" description={exams.data ? `${exams.data.length} ${exams.data.length === 1 ? "exam" : "exams"} to explore.` : "Choose a syllabus and start finding your focus."}/><label className="relative block w-full sm:mb-8 sm:max-w-xs"><span className="sr-only">Search exams</span><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"/><input className="field pl-10" placeholder="Search exams…" value={search} onChange={(event) => setSearch(event.target.value)}/></label></div>
    {exams.isLoading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <LoadingCard key={n} label="Loading exam"/>)}</div>}
    {exams.isError && <ErrorNotice message={exams.error.message}/>}
    {!exams.isLoading && !exams.isError && filtered.length === 0 && <div className="panel rounded-2xl px-6 py-12 text-center"><BookOpen size={24} className="mx-auto mb-4 text-zinc-500"/><h2 className="font-semibold text-white">{search ? "No exams match that search" : "No exams available yet"}</h2><p className="mt-2 text-sm text-zinc-500">{search ? "Try another name or clear your search." : "Check back when an administrator adds the first syllabus."}</p></div>}
    {!!filtered.length && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((exam, index) => <ExamCard key={exam.id} exam={exam} index={index}/>)}</div>}
  </PageShell>;
}
