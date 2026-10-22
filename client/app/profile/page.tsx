"use client";

import { useQueries } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CircleCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { AuthGate, ErrorNotice, LoadingCard, PageHeading, PageShell } from "@/components/page-shell";
import { ExamCard } from "@/components/exam-card";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/app/providers";
import { api } from "@/lib/api";
import { queryKeys, useExams, useMyProgress } from "@/lib/queries";
import type { Syllabus } from "@/types";

function ProfileContent() {
  const { user } = useAuth();
  const exams = useExams();
  const progress = useMyProgress(Boolean(user));
  const syllabi = useQueries({ queries: (exams.data ?? []).map((exam) => ({ queryKey: queryKeys.syllabus(exam.id), queryFn: () => api<Syllabus>(`/api/exams/${exam.id}/syllabus`) })) });
  const loading = exams.isLoading || progress.isLoading || syllabi.some((query) => query.isLoading);
  const error = exams.error || progress.error || syllabi.find((query) => query.error)?.error;
  const cards = (exams.data ?? []).map((exam, index) => {
    const topics = syllabi[index]?.data?.subjects.flatMap((subject) => subject.topics) ?? [];
    const done = topics.filter((topic) => progress.data?.find((record) => record.topicId === topic.id)?.status === "DONE").length;
    const hasStarted = topics.some((topic) => progress.data?.some((record) => record.topicId === topic.id && record.status !== "NOT_STARTED"));
    return { exam, index, topics: topics.length, done, hasStarted };
  });
  const totalTopics = cards.reduce((sum, card) => sum + card.topics, 0);
  const completedTopics = cards.reduce((sum, card) => sum + card.done, 0);
  const activeExams = cards.filter((card) => card.hasStarted).length;

  return <PageShell>
    <section className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-indigo-300/15 bg-gradient-to-br from-indigo-500/[0.13] via-zinc-900 to-zinc-900 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9"><div className="flex items-center gap-4 sm:gap-5"><UserAvatar user={user!} size="h-16 w-16 sm:h-20 sm:w-20"/><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-200">YOUR PREPTRACK PROFILE</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{user?.name}</h1><p className="mt-1 text-sm text-zinc-400">{user?.email}</p></div></div><Link href="/dashboard" className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.06] sm:self-auto">Open dashboard <ArrowRight size={15}/></Link></section>
    <div className="mb-10 grid grid-cols-3 gap-3"><article className="panel rounded-2xl p-4 sm:p-5"><BookOpen size={17} className="mb-4 text-indigo-200"/><p className="text-2xl font-semibold text-white">{cards.length}</p><p className="mt-1 text-xs text-zinc-500">Available exams</p></article><article className="panel rounded-2xl p-4 sm:p-5"><Sparkles size={17} className="mb-4 text-sky-200"/><p className="text-2xl font-semibold text-white">{activeExams}</p><p className="mt-1 text-xs text-zinc-500">Exams in progress</p></article><article className="panel rounded-2xl p-4 sm:p-5"><CircleCheck size={17} className="mb-4 text-emerald-200"/><p className="text-2xl font-semibold text-white">{totalTopics ? Math.round(completedTopics / totalTopics * 100) : 0}%</p><p className="mt-1 text-xs text-zinc-500">Topics completed</p></article></div>
    <PageHeading eyebrow="YOUR LEARNING PATHS" title="Your exams" description="Pick up where you left off, or explore another syllabus when you’re ready."/>
    {loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <LoadingCard key={n} label="Loading profile"/>)}</div>}
    {error && <ErrorNotice message={error.message}/>}
    {!loading && !error && cards.length === 0 && <div className="panel rounded-2xl px-6 py-12 text-center"><BookOpen size={24} className="mx-auto mb-4 text-zinc-500"/><h2 className="font-semibold text-white">Your next milestone is waiting</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">Explore available exams, choose a topic, and mark it as learning to get your profile started.</p><Link href="/exams" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-indigo-200">Browse exams <ArrowRight size={15}/></Link></div>}
    {!!cards.length && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(({ exam, index, topics, done }) => <ExamCard key={exam.id} exam={exam} index={index} completed={done} topics={topics}/>)}</div>}
  </PageShell>;
}

export default function ProfilePage() { return <AuthGate><ProfileContent/></AuthGate>; }
