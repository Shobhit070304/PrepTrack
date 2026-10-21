"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Exam = { id: number; name: string; description: string | null };
type Topic = { id: number; name: string; subjectId: number };
type Subject = { id: number; name: string; topics: Topic[] };
type Syllabus = { id: number; name: string; subjects: Subject[] };

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load exams (${response.status}).`);
  return response.json() as Promise<T>;
}

function Brand() {
  return <Link className="landing-brand" href="/"><span className="brand-mark"><span/><span/><span/><span/></span><span>prep<span>track</span></span></Link>;
}

export default function ExplorePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [syllabi, setSyllabi] = useState<Record<number, Syllabus>>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    request<Exam[]>("/api/exams").then(setExams).catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not reach PrepTrack.")).finally(() => setLoading(false));
  }, []);

  const filteredExams = useMemo(() => exams.filter((exam) => `${exam.name} ${exam.description ?? ""}`.toLowerCase().includes(query.toLowerCase())), [exams, query]);

  async function toggleExam(exam: Exam) {
    if (expanded === exam.id) { setExpanded(null); return; }
    setExpanded(exam.id);
    if (syllabi[exam.id]) return;
    setError("");
    try {
      const syllabus = await request<Syllabus>(`/api/exams/${exam.id}/syllabus`);
      setSyllabi((current) => ({ ...current, [exam.id]: syllabus }));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load this syllabus."); }
  }

  function startPreparing(examId: number) {
    localStorage.setItem("preptrack-exam", String(examId));
  }

  return <main className="explore-page">
    <header className="landing-header explore-header"><Brand/><nav className="landing-nav"><Link href="/explore" className="current-link">Explore</Link><Link href="/dashboard">Workspace</Link></nav><div className="landing-actions"><Link className="landing-login" href="/profile">My profile</Link><Link className="landing-nav-cta" href="/dashboard">Open workspace <span>↗</span></Link></div></header>
    <section className="explore-hero"><div className="landing-eyebrow"><span/> FIND YOUR DIRECTION</div><h1>Explore your next<br/><em>big challenge.</em></h1><p>Find your exam, get familiar with the syllabus, and start shaping your learning path.</p><div className="explore-count"><span>{exams.length.toString().padStart(2, "0")}</span> exams in your PrepTrack workspace</div><div className="explore-orb"><span/><span/><span/></div></section>
    <section className="explore-content"><div className="explore-title-row"><div><div className="landing-eyebrow"><span/> AVAILABLE EXAMS</div><h2>Choose what you’re preparing for.</h2></div><label className="explore-search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exams"/><span>⌕</span></label></div>
      {error && <div className="explore-error" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
      {loading ? <div className="explore-empty"><span className="spinner"/>Finding available exams…</div> : filteredExams.length ? <div className="exam-grid">{filteredExams.map((exam, index) => {
        const syllabus = syllabi[exam.id];
        const topicCount = syllabus?.subjects.reduce((sum, subject) => sum + subject.topics.length, 0) ?? 0;
        return <article className={`exam-card ${expanded === exam.id ? "exam-card-expanded" : ""}`} key={exam.id}><div className={`exam-art exam-art-${index % 4}`}><span className="exam-art-index">EXAM · {String(index + 1).padStart(2, "0")}</span><span className="exam-art-emblem">{exam.name.trim().charAt(0).toUpperCase()}</span><span className="exam-art-stars">✳</span><span className="exam-art-bottom">PREPTRACK LEARNING PATH</span></div><div className="exam-card-body"><div className="exam-card-meta"><span>{syllabus ? `${syllabus.subjects.length} subjects` : "Explore syllabus"}</span>{syllabus && <span>{topicCount} topics</span>}</div><h3>{exam.name}</h3><p>{exam.description || "A structured path to help you prepare with clarity and confidence."}</p><button className="exam-expand" onClick={() => void toggleExam(exam)}>{expanded === exam.id ? "Hide syllabus" : "View syllabus"}<span>{expanded === exam.id ? "−" : "↗"}</span></button>
          {expanded === exam.id && <div className="syllabus-preview">{!syllabus ? <div className="syllabus-loading"><span className="spinner"/>Loading syllabus…</div> : syllabus.subjects.length ? <><div className="syllabus-preview-label">SYLLABUS OVERVIEW</div><div className="syllabus-preview-list">{syllabus.subjects.map((subject) => <div key={subject.id}><span>{subject.name}</span><small>{subject.topics.length} topics</small></div>)}</div><Link className="start-exam-link" href="/dashboard" onClick={() => startPreparing(exam.id)}>Start preparing <span>→</span></Link></> : <><p className="syllabus-unavailable">The syllabus for this exam hasn’t been added yet.</p><Link className="start-exam-link" href="/dashboard" onClick={() => startPreparing(exam.id)}>Open workspace <span>→</span></Link></>}</div>}
        </div></article>;
      })}</div> : <div className="explore-empty"><strong>{exams.length ? "No exams match your search." : "No exams available yet."}</strong><span>{exams.length ? "Try a different search." : "Your workspace will show exams as soon as they’re added."}</span>{!exams.length && <Link href="/dashboard">Open workspace <span>→</span></Link>}</div>}
    </section><section className="explore-bottom"><span>YOUR NEXT STEP</span><strong>A good plan starts with a clear view.</strong><Link href="/dashboard">Go to your workspace <span>→</span></Link></section><footer className="landing-footer"><Brand/><span>Thoughtful preparation, one step at a time.</span><div><Link href="/">Home</Link><Link href="/profile">Profile</Link><Link href="/dashboard">Workspace</Link></div><small>© PrepTrack</small></footer>
  </main>;
}
