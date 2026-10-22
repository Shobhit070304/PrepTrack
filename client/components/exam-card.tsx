import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { Exam } from "@/types";

export function ExamCard({ exam, index, completed, topics }: { exam: Exam; index: number; completed?: number; topics?: number }) {
  const hasProgress = typeof completed === "number" && typeof topics === "number";
  const percent = hasProgress && topics > 0 ? Math.round(completed / topics * 100) : 0;
  return <Link href={`/exams/${exam.id}`} className="group panel flex min-h-60 flex-col rounded-2xl p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-300/30 hover:bg-zinc-900 sm:p-6">
    <div className="mb-5 flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/10 text-indigo-200"><BookOpen size={18}/></span><span className="text-xs font-medium tracking-[.14em] text-zinc-600">{String(index + 1).padStart(2,"0")}</span></div>
    <h2 className="text-lg font-semibold text-white">{exam.name}</h2>
    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-400">{exam.description || "Explore the syllabus and map your preparation."}</p>
    {hasProgress && <div className="mt-5"><div className="mb-2 flex justify-between text-xs"><span className="text-zinc-500">{completed} of {topics} topics complete</span><span className="font-medium text-indigo-200">{percent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-300 transition-all" style={{ width: `${percent}%` }}/></div></div>}
    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-indigo-200">{hasProgress ? "Open syllabus" : "View syllabus"}<ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
  </Link>;
}
