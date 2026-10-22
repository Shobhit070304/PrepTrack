"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, BookOpen, ChevronDown, CircleCheck, LoaderCircle, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/providers";
import { ErrorNotice, LoadingCard, PageShell } from "@/components/page-shell";
import { useMyProgress, useSetProgress, useSyllabus } from "@/lib/queries";
import type { ProgressStatus } from "@/types";

const statuses: ProgressStatus[] = ["NOT_STARTED", "LEARNING", "REVISING", "DONE"];
const statusLabel: Record<ProgressStatus, string> = { NOT_STARTED: "Not started", LEARNING: "Learning", REVISING: "Revising", DONE: "Done" };

function SyllabusContent() {
  const params = useParams<{ id: string }>();
  const examId = Number(params.id);
  const { user } = useAuth();
  const syllabus = useSyllabus(examId);
  const progress = useMyProgress(Boolean(user));
  const update = useSetProgress();

  const topics = syllabus.data?.subjects.flatMap((subject) => subject.topics) ?? [];
  const progressByTopic = new Map((progress.data ?? []).map((item) => [item.topicId, item]));
  const doneCount = topics.filter((topic) => progressByTopic.get(topic.id)?.status === "DONE").length;
  const percent = topics.length ? Math.round(doneCount / topics.length * 100) : 0;

  function changeStatus(topicId: number, status: ProgressStatus) {
    update.mutate({ topicId, status }, { onError: (error) => toast.error(error.message) });
  }

  return <PageShell width="max-w-5xl">
    <Link href="/exams" className="mb-7 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-200"><ArrowLeft size={15}/> All exams</Link>
    {syllabus.isLoading && <div className="space-y-4"><LoadingCard/><LoadingCard/><LoadingCard/></div>}
    {syllabus.isError && <ErrorNotice message={syllabus.error.message}/>}
    {syllabus.data && <>
      <div className="panel app-backdrop overflow-hidden rounded-3xl p-6 sm:p-9">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300"><BookOpen size={14}/> SYLLABUS</p><h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{syllabus.data.name}</h1><p className="mt-3 text-sm text-zinc-400">{syllabus.data.subjects.length} subjects <span className="mx-2 text-zinc-700">·</span> {topics.length} topics</p></div>
          {user ? <div className="w-full max-w-xs"><div className="mb-2 flex justify-between text-xs"><span className="text-zinc-400">Overall progress</span><span className="font-medium text-zinc-200">{doneCount} of {topics.length} done</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${percent}%` }}/></div><p className="mt-2 text-right text-xs text-indigo-200">{percent}%</p></div> : <p className="flex items-center gap-2 text-xs text-zinc-500"><LockKeyhole size={14}/> Sign in to track your progress</p>}</div>
      </div>
      {progress.isError && <div className="mt-4"><ErrorNotice message={progress.error.message}/></div>}
      {progress.isLoading && user && <div className="mt-4"><LoadingCard label="Loading progress"/></div>}
      <div className="mt-6 space-y-3">{syllabus.data.subjects.map((subject, index) => {
        const completed = subject.topics.filter((topic) => progressByTopic.get(topic.id)?.status === "DONE").length;
        const subjectPercent = subject.topics.length ? Math.round(completed / subject.topics.length * 100) : 0;
        return <details key={subject.id} className="panel group overflow-hidden rounded-2xl" open><summary className="flex cursor-pointer list-none items-center gap-4 p-4 sm:p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-xs font-semibold text-zinc-400">{String(index + 1).padStart(2,"0")}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold text-zinc-100">{subject.name}</strong><small className="mt-1 block text-xs text-zinc-500">{subject.topics.length} topics · {completed} done</small></span>{user && <div className="hidden w-28 sm:block"><div className="mb-1 text-right text-[10px] text-zinc-500">{subjectPercent}%</div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${subjectPercent}%` }}/></div></div>}<ChevronDown size={16} className="text-zinc-500 transition group-open:rotate-180"/></summary>
          <div className="border-t border-white/[0.07] px-4 sm:px-5">{subject.topics.length ? subject.topics.map((topic) => {
            const status = progressByTopic.get(topic.id)?.status ?? "NOT_STARTED";
            return <div key={topic.id} className="flex min-h-14 items-center gap-3 border-b border-white/[0.06] last:border-b-0"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${status === "DONE" ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[0.05] text-zinc-600"}`}>{status === "DONE" ? <CircleCheck size={15}/> : <span className="h-1.5 w-1.5 rounded-full bg-current"/>}</span><span className="min-w-0 flex-1 truncate text-sm text-zinc-300">{topic.name}</span>{user ? <><span className={`status-pill status-${status} hidden sm:inline-flex`}>{statusLabel[status]}</span><label className="relative"><span className="sr-only">Status for {topic.name}</span><select className="field w-32 appearance-none pr-7 py-2 text-xs sm:w-36" value={status} disabled={update.isPending && update.variables?.topicId === topic.id} onChange={(event) => changeStatus(topic.id, event.target.value as ProgressStatus)}>{statuses.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"/></label>{update.isPending && update.variables?.topicId === topic.id && <LoaderCircle size={14} className="animate-spin text-indigo-300"/>}</> : <Link className="rounded-lg border border-indigo-300/15 px-3 py-2 text-xs font-medium text-indigo-200 transition hover:bg-indigo-300/10" href="/#sign-in">Sign in to track</Link>}</div>;
          }) : <p className="py-5 text-sm text-zinc-500">No topics have been added to this subject yet.</p>}</div>
        </details>;
      })}</div>
    </>}
  </PageShell>;
}

export default function SyllabusPage() {
  return <Suspense fallback={<div className="mx-auto min-h-screen max-w-5xl space-y-4 bg-[#09090b] px-5 py-10 sm:px-8 sm:py-14"><LoadingCard label="Loading syllabus" /></div>}><SyllabusContent /></Suspense>;
}
