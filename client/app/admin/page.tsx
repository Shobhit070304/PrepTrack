"use client";

import { FormEvent, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronDown, CirclePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AuthGate, ErrorNotice, LoadingCard, PageHeading, PageShell } from "@/components/page-shell";
import { api, type ApiError } from "@/lib/api";
import { queryKeys, useExams } from "@/lib/queries";
import type { Exam, Syllabus, Subject, Topic } from "@/types";

type Editor =
  | { kind: "exam"; id?: number; name: string; description: string }
  | { kind: "subject"; id?: number; examId: number; name: string }
  | { kind: "topic"; id?: number; subjectId: number; name: string };

function AdminContent() {
  const queryClient = useQueryClient();
  const examsQuery = useExams();
  const exams = examsQuery.data ?? [];
  const syllabusQueries = useQueries({ queries: exams.map((exam) => ({ queryKey: queryKeys.syllabus(exam.id), queryFn: () => api<Syllabus>(`/api/exams/${exam.id}/syllabus`) })) });
  const [editor, setEditor] = useState<Editor | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.exams });
    void queryClient.invalidateQueries({ queryKey: ["syllabus"] });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    setSaving(true); setFieldErrors({}); setFormError("");
    try {
      if (editor.kind === "exam") {
        const body = { name, description: String(form.get("description") ?? "") };
        await api<Exam>(editor.id ? `/api/exams/${editor.id}` : "/api/exams", { method: editor.id ? "PUT" : "POST", body: JSON.stringify(body) });
      } else if (editor.kind === "subject") {
        const body = { name, examId: editor.examId };
        await api<Subject>(editor.id ? `/api/subjects/${editor.id}` : "/api/subjects", { method: editor.id ? "PUT" : "POST", body: JSON.stringify(body) });
      } else {
        const body = { name, subjectId: editor.subjectId };
        await api<Topic>(editor.id ? `/api/topics/${editor.id}` : "/api/topics", { method: editor.id ? "PUT" : "POST", body: JSON.stringify(body) });
      }
      toast.success(`${editor.kind[0].toUpperCase()}${editor.kind.slice(1)} saved`);
      setEditor(null); refresh();
    } catch (error) {
      const apiError = error as Partial<ApiError>;
      setFieldErrors(apiError.fieldErrors ?? {});
      setFormError(apiError.message || "Could not save this item.");
    } finally { setSaving(false); }
  }

  async function remove(kind: "exam" | "subject" | "topic", item: { id: number; name: string }) {
    const scope = kind === "exam" ? "Its subjects and topics will also be deleted." : kind === "subject" ? "Its topics will also be deleted." : "This topic will be removed from the syllabus.";
    if (!window.confirm(`Delete “${item.name}”? ${scope}`)) return;
    const endpoint = kind === "exam" ? `/api/exams/${item.id}` : kind === "subject" ? `/api/subjects/${item.id}` : `/api/topics/${item.id}`;
    try { await api<void>(endpoint, { method: "DELETE" }); toast.success(`${kind[0].toUpperCase()}${kind.slice(1)} deleted`); refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete this item."); }
  }

  const openExam = (exam?: Exam) => setEditor({ kind: "exam", ...(exam ? { id: exam.id, name: exam.name, description: exam.description ?? "" } : { name: "", description: "" }) });
  const openSubject = (examId: number, subject?: Subject) => setEditor({ kind: "subject", examId, ...(subject ? { id: subject.id, name: subject.name } : { name: "" }) });
  const openTopic = (subjectId: number, topic?: Topic) => setEditor({ kind: "topic", subjectId, ...(topic ? { id: topic.id, name: topic.name } : { name: "" }) });

  return <PageShell>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><PageHeading eyebrow="ADMINISTRATION" title="Manage syllabi" description="Maintain the exam catalog and keep each learning path up to date."/><button onClick={() => openExam()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-indigo-300"><CirclePlus size={16}/> Add exam</button></div>
    {examsQuery.isLoading && <div className="space-y-3">{[1,2].map((item) => <LoadingCard key={item}/>)}</div>}
    {examsQuery.isError && <ErrorNotice message={examsQuery.error.message}/>}
    {!examsQuery.isLoading && exams.length === 0 && <div className="panel rounded-2xl p-8 text-center"><BookOpen className="mx-auto mb-3 text-zinc-500"/><h2 className="font-semibold text-white">The exam catalog is empty</h2><p className="mt-2 text-sm text-zinc-500">Add an exam, then organize it into subjects and topics.</p></div>}
    <section className="space-y-3">{exams.map((exam, index) => {
      const query = syllabusQueries[index];
      const syllabus = query?.data;
      return <details key={exam.id} className="panel group rounded-2xl"><summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 sm:p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-400/10 text-indigo-200"><BookOpen size={18}/></span><span className="min-w-0 flex-1"><strong className="block text-sm font-semibold text-white">{exam.name}</strong><small className="mt-1 block line-clamp-1 text-xs text-zinc-500">{exam.description || "No description"}</small></span><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); openSubject(exam.id); }} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"><Plus size={14}/> Subject</button><button type="button" aria-label={`Edit ${exam.name}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); openExam(exam); }} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-100"><Pencil size={15}/></button><button type="button" aria-label={`Delete ${exam.name}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void remove("exam", exam); }} className="rounded-lg p-2 text-zinc-500 hover:bg-rose-400/10 hover:text-rose-200"><Trash2 size={15}/></button><ChevronDown size={16} className="text-zinc-500 transition group-open:rotate-180"/></summary>
        <div className="border-t border-white/[0.07] px-4 py-4 sm:px-5">{query?.isError ? <ErrorNotice message={query.error.message}/> : !syllabus ? <div className="py-2 text-xs text-zinc-500">Loading subjects…</div> : syllabus.subjects.length === 0 ? <p className="py-2 text-xs text-zinc-500">No subjects yet. Add one to build this syllabus.</p> : <div className="space-y-3">{syllabus.subjects.map((subject) => <SubjectEditor key={subject.id} subject={subject} onAddTopic={() => openTopic(subject.id)} onEdit={() => openSubject(exam.id, subject)} onDelete={() => void remove("subject", subject) } onEditTopic={(topic) => openTopic(subject.id, topic)} onDeleteTopic={(topic) => void remove("topic", topic)}/>)}</div>}</div>
      </details>;
    })}</section>

    {editor && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) { setEditor(null); setFormError(""); } }}><section role="dialog" aria-modal="true" aria-labelledby="editor-title" className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">SYLLABUS EDITOR</p><h2 id="editor-title" className="mt-2 text-xl font-semibold text-white">{editor.id ? "Edit" : "Add"} {editor.kind}</h2></div><button onClick={() => setEditor(null)} aria-label="Close dialog" className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"><X size={17}/></button></div>
      <form onSubmit={save} className="space-y-4"><label className="block text-sm font-medium text-zinc-300">Name<input className="field mt-2" name="name" defaultValue={editor.name} required maxLength={100} autoFocus/>{fieldErrors.name && <span className="mt-1 block text-xs text-rose-300">{fieldErrors.name}</span>}</label>{editor.kind === "exam" && <label className="block text-sm font-medium text-zinc-300">Description <span className="text-zinc-600">(optional)</span><textarea className="field mt-2 min-h-24 resize-y" name="description" defaultValue={editor.description} maxLength={500}/>{fieldErrors.description && <span className="mt-1 block text-xs text-rose-300">{fieldErrors.description}</span>}</label>}{formError && !Object.keys(fieldErrors).length && <p role="alert" className="text-xs text-rose-300">{formError}</p>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditor(null)} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5">Cancel</button><button disabled={saving} className="rounded-lg bg-indigo-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-indigo-300 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button></div></form>
      </section></div>}
  </PageShell>;
}

function SubjectEditor({ subject, onAddTopic, onEdit, onDelete, onEditTopic, onDeleteTopic }: { subject: Subject; onAddTopic: () => void; onEdit: () => void; onDelete: () => void; onEditTopic: (topic: Topic) => void; onDeleteTopic: (topic: Topic) => void }) {
  return <details className="rounded-xl border border-white/[0.07] bg-black/10 group/subject"><summary className="flex list-none items-center gap-3 p-3"><span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">{subject.name}<small className="ml-2 text-xs text-zinc-600">{subject.topics.length} topics</small></span><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onAddTopic(); }} className="rounded-lg p-2 text-zinc-500 hover:bg-indigo-300/10 hover:text-indigo-200" aria-label={`Add topic to ${subject.name}`}><Plus size={14}/></button><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onEdit(); }} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-100" aria-label={`Edit ${subject.name}`}><Pencil size={14}/></button><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onDelete(); }} className="rounded-lg p-2 text-zinc-500 hover:bg-rose-400/10 hover:text-rose-200" aria-label={`Delete ${subject.name}`}><Trash2 size={14}/></button><ChevronDown size={15} className="text-zinc-600 transition group-open/subject:rotate-180"/></summary><div className="border-t border-white/[0.06] px-3">{subject.topics.length ? subject.topics.map((topic) => <div key={topic.id} className="flex min-h-11 items-center gap-3 border-b border-white/[0.05] last:border-0"><span className="h-1.5 w-1.5 rounded-full bg-indigo-300/50"/><span className="flex-1 text-xs text-zinc-400">{topic.name}</span><button onClick={onAddTopic} className="rounded-md p-1.5 text-zinc-600 hover:text-indigo-200" aria-label="Add topic"><Plus size={13}/></button><button onClick={() => onEditTopic(topic)} className="rounded-md p-1.5 text-zinc-600 hover:text-zinc-200" aria-label={`Edit ${topic.name}`}><Pencil size={13}/></button><button onClick={() => onDeleteTopic(topic)} className="rounded-md p-1.5 text-zinc-600 hover:text-rose-200" aria-label={`Delete ${topic.name}`}><Trash2 size={13}/></button></div>) : <p className="py-3 text-xs text-zinc-600">No topics yet.</p>}</div></details>;
}

export default function AdminPage() { return <AuthGate role="ADMIN"><AdminContent/></AuthGate>; }
