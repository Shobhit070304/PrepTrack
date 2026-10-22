"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Check, CircleDashed, RotateCcw, Sparkles } from "lucide-react";
import { AuthGate, ErrorNotice, LoadingCard, PageHeading, PageShell } from "@/components/page-shell";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/app/providers";
import { api } from "@/lib/api";
import { queryKeys, useExams, useMyProgress } from "@/lib/queries";
import type { Progress, Syllabus } from "@/types";

const labels = { NOT_STARTED: "Not started", LEARNING: "Learning", REVISING: "Revising", DONE: "Done" } as const;
const noProgress: Progress[] = [];

function DashboardContent() {
  const { user } = useAuth();
  const examsQuery = useExams();
  const progressQuery = useMyProgress(Boolean(user));
  const exams = examsQuery.data ?? [];
  const syllabusQueries = useQueries({ queries: exams.map((exam) => ({ queryKey: queryKeys.syllabus(exam.id), queryFn: () => api<Syllabus>(`/api/exams/${exam.id}/syllabus`) })) });
  const syllabi = syllabusQueries.flatMap((query) => query.data ? [query.data] : []);
  const progress = progressQuery.data ?? noProgress;

  const totals = useMemo(() => {
    const allTopics = syllabi.flatMap((syllabus) => syllabus.subjects.flatMap((subject) => subject.topics));
    const topicIds = new Set(allTopics.map((topic) => topic.id));
    const records = progress.filter((item) => topicIds.has(item.topicId));
    const count = { NOT_STARTED: 0, LEARNING: 0, REVISING: 0, DONE: 0 };
    for (const item of records) count[item.status] += 1;
    const recorded = new Set(records.map((item) => item.topicId));
    count.NOT_STARTED += allTopics.filter((topic) => !recorded.has(topic.id)).length;
    return { ...count, topicCount: allTopics.length, donePercent: allTopics.length ? Math.round(count.DONE / allTopics.length * 100) : 0, records, allTopics };
  }, [syllabi, progress]);

  const startedExams = syllabi.map((syllabus) => {
    const topics = syllabus.subjects.flatMap((subject) => subject.topics);
    const started = topics.filter((topic) => {
      const status = progress.find((item) => item.topicId === topic.id)?.status;
      return status && status !== "NOT_STARTED";
    }).length;
    const done = topics.filter((topic) => progress.find((item) => item.topicId === topic.id)?.status === "DONE").length;
    return { syllabus, started, done, total: topics.length, percent: topics.length ? Math.round(done / topics.length * 100) : 0 };
  }).filter((item) => item.started > 0);

  const loading = examsQuery.isLoading || progressQuery.isLoading || syllabusQueries.some((query) => query.isLoading);
  const queryError = examsQuery.error || progressQuery.error || syllabusQueries.find((query) => query.error)?.error;
  const icons = { NOT_STARTED: CircleDashed, LEARNING: Sparkles, REVISING: RotateCcw, DONE: Check };

  return <PageShell>
    {loading && <div className="space-y-5"><LoadingCard/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((item) => <LoadingCard key={item}/>)}</div></div>}
    {queryError && <ErrorNotice message={queryError.message}/>}
    {!loading && user && <>
      <section className="mb-8 flex flex-col gap-5 rounded-3xl border border-indigo-300/15 bg-gradient-to-br from-indigo-500/15 via-zinc-900 to-zinc-900 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9"><div className="flex items-center gap-4"><UserAvatar user={user} size="h-14 w-14 sm:h-16 sm:w-16"/><div><p className="text-xs uppercase tracking-[0.18em] text-indigo-200">YOUR WORKSPACE</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Welcome back, {user.name.split(" ")[0]}</h1><p className="mt-1 text-sm text-zinc-400">A little progress, repeated, becomes a lot.</p></div></div><div className="sm:text-right"><p className="text-xs text-zinc-400">Overall completion</p><p className="mt-1 text-3xl font-semibold text-white">{totals.donePercent}<span className="text-lg text-indigo-200">%</span></p></div></section>
      <div className="mb-10 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${totals.donePercent}%` }}/></div>
      <PageHeading eyebrow="AT A GLANCE" title="Your progress" description={totals.records.length ? "Keep your focus steady and your next step clear." : "Your preparation adds up, one topic at a time."}/>
      <section className="mb-12 grid grid-cols-2 gap-3 lg:grid-cols-4">{(Object.keys(labels) as (keyof typeof labels)[]).map((status) => { const Icon = icons[status]; return <article key={status} className="panel rounded-2xl p-4 sm:p-5"><div className={`mb-5 grid h-9 w-9 place-items-center rounded-xl ${status === "DONE" ? "bg-emerald-400/10 text-emerald-300" : status === "REVISING" ? "bg-amber-300/10 text-amber-200" : status === "LEARNING" ? "bg-blue-400/10 text-blue-300" : "bg-white/[0.06] text-zinc-400"}`}><Icon size={17}/></div><p className="text-2xl font-semibold text-white">{totals[status]}</p><p className="mt-1 text-xs text-zinc-500">{labels[status]}</p></article>; })}</section>
      <section><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">KEEP MOVING</p><h2 className="mt-2 text-xl font-semibold text-white">Exams you’ve started</h2></div><Link href="/exams" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-200 hover:text-white">Explore exams <ArrowRight size={14}/></Link></div>
        {startedExams.length ? <div className="grid gap-4 md:grid-cols-2">{startedExams.map(({ syllabus, done, total, percent }) => <Link key={syllabus.id} href={`/exams/${syllabus.id}`} className="panel group rounded-2xl p-5 transition hover:border-indigo-300/30 hover:bg-zinc-900"><div className="flex items-start justify-between gap-4"><div><span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-200"><BookOpen size={17}/></span><h3 className="text-base font-semibold text-white">{syllabus.name}</h3></div><span className="text-lg font-semibold text-indigo-200">{percent}%</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${percent}%` }}/></div><p className="mt-2 text-xs text-zinc-500">{done} of {total} topics done <ArrowRight size={13} className="ml-1 inline transition group-hover:translate-x-1"/></p></Link>)}</div> : <div className="panel rounded-2xl px-6 py-10 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-indigo-400/10 text-indigo-200"><Sparkles size={19}/></div><h3 className="mt-4 font-semibold text-white">Your next milestone is waiting</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">Browse an exam, choose a topic, and mark it as learning to get your dashboard started.</p><Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-indigo-300">Browse exams <ArrowRight size={15}/></Link></div>}
      </section>
    </>}
  </PageShell>;
}

export default function DashboardPage() { return <AuthGate><DashboardContent/></AuthGate>; }
