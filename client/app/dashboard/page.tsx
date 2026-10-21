"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Exam = { id: number; name: string; description: string | null };
type Topic = { id: number; name: string; subjectId: number };
type Subject = { id: number; name: string; topics: Topic[] };
type Syllabus = { id: number; name: string; subjects: Subject[] };
type Status = "NOT_STARTED" | "LEARNING" | "REVISING" | "DONE";
type Progress = { topicId: number; topicName: string; status: Status; updatedAt: string };
type User = { id: number; name: string; email: string };

const STATUS: Status[] = ["NOT_STARTED", "LEARNING", "REVISING", "DONE"];
const statusLabel: Record<Status, string> = {
  NOT_STARTED: "Not started",
  LEARNING: "Learning",
  REVISING: "Revising",
  DONE: "Completed",
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Some successful delete responses and server errors have no JSON body.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/><path d="M8 7h8"/></>,
    chart: <><path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/><path d="M16 6h4v4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    down: <path d="m7 10 5 5 5-5"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    spark: <><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)"/></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3"/></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P";
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState<number | null>(null);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyTopic, setBusyTopic] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("Overview");
  const [showProfile, setShowProfile] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState<number | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const load = useCallback(async (chosenId?: number | null) => {
    setError("");
    setLoading(true);
    try {
      const list = await api<Exam[]>("/api/exams");
      setExams(list);
      const id = chosenId ?? (list.some((item) => item.id === examId) ? examId : list[0]?.id ?? null);
      setExamId(id);
      if (id) {
        const [tree, records] = await Promise.all([
          api<Syllabus>(`/api/exams/${id}/syllabus`),
          user ? api<Progress[]>(`/api/users/${user.id}/progress`) : Promise.resolve([]),
        ]);
        setSyllabus(tree);
        setProgress(records);
      } else {
        setSyllabus(null);
        setProgress([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach PrepTrack.");
    } finally {
      setLoading(false);
    }
  }, [examId, user]);

  useEffect(() => {
    let storedUser: User | null = null;
    try {
      const saved = localStorage.getItem("preptrack-user");
      if (saved) storedUser = JSON.parse(saved) as User;
    } catch {
      localStorage.removeItem("preptrack-user");
    }
    const savedExam = Number(localStorage.getItem("preptrack-exam")) || null;
    void (async () => {
      try {
        const list = await api<Exam[]>("/api/exams");
        setUser(storedUser);
        setExams(list);
        const id = list.some((item) => item.id === savedExam) ? savedExam : list[0]?.id ?? null;
        setExamId(id);
        if (id) {
          const [tree, records] = await Promise.all([
            api<Syllabus>(`/api/exams/${id}/syllabus`),
            storedUser ? api<Progress[]>(`/api/users/${storedUser.id}/progress`) : Promise.resolve([]),
          ]);
          setSyllabus(tree);
          setProgress(records);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not reach PrepTrack.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (examId) localStorage.setItem("preptrack-exam", String(examId));
  }, [examId]);

  const topics = useMemo(() => syllabus?.subjects.flatMap((subject) => subject.topics) ?? [], [syllabus]);
  const progressByTopic = useMemo(() => new Map(progress.map((item) => [item.topicId, item])), [progress]);
  const stats = useMemo(() => {
    const topicIds = new Set(topics.map((topic) => topic.id));
    const examProgress = progress.filter((item) => topicIds.has(item.topicId));
    const done = examProgress.filter((item) => item.status === "DONE").length;
    const learning = examProgress.filter((item) => item.status === "LEARNING").length;
    const revising = examProgress.filter((item) => item.status === "REVISING").length;
    const allDone = topics.filter((topic) => progressByTopic.get(topic.id)?.status === "DONE").length;
    const percent = topics.length ? Math.round((allDone / topics.length) * 100) : 0;
    return { done, learning, revising, percent, remaining: Math.max(topics.length - allDone, 0) };
  }, [progress, topics, progressByTopic]);

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return syllabus?.subjects ?? [];
    return (syllabus?.subjects ?? []).map((subject) => subject.name.toLowerCase().includes(query) ? subject : ({ ...subject, topics: subject.topics.filter((topic) => topic.name.toLowerCase().includes(query)) })).filter((subject) => subject.name.toLowerCase().includes(query) || subject.topics.length > 0);
  }, [search, syllabus]);

  async function changeStatus(topic: Topic, status: Status) {
    if (!user) { setShowProfile(true); return; }
    const previous = progressByTopic.get(topic.id);
    setBusyTopic(topic.id);
    setProgress((items) => [...items.filter((item) => item.topicId !== topic.id), { topicId: topic.id, topicName: topic.name, status, updatedAt: new Date().toISOString() }]);
    try {
      const saved = await api<Progress>(`/api/users/${user.id}/progress/${topic.id}`, { method: "PUT", body: JSON.stringify({ status }) });
      setProgress((items) => [...items.filter((item) => item.topicId !== topic.id), saved]);
    } catch (err) {
      setProgress((items) => [...items.filter((item) => item.topicId !== topic.id), ...(previous ? [previous] : [])]);
      setError(err instanceof Error ? err.message : "Progress could not be saved.");
    } finally {
      setBusyTopic(null);
    }
  }

  async function createProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const created = await api<User>("/api/users", { method: "POST", body: JSON.stringify({ name: data.get("name"), email: data.get("email") }) });
      localStorage.setItem("preptrack-user", JSON.stringify(created));
      setUser(created);
      setShowProfile(false);
      if (examId) setProgress(await api<Progress[]>(`/api/users/${created.id}/progress`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile could not be created.");
    } finally {
      setProfileBusy(false);
    }
  }

  async function createExam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const created = await api<Exam>("/api/exams", { method: "POST", body: JSON.stringify({ name: data.get("name"), description: data.get("description") || null }) });
      setShowExamForm(false);
      await load(created.id);
    } catch (err) { setError(err instanceof Error ? err.message : "Exam could not be created."); }
  }

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!examId) return;
    const data = new FormData(event.currentTarget);
    try {
      await api("/api/subjects", { method: "POST", body: JSON.stringify({ name: data.get("name"), examId }) });
      setShowSubjectForm(false);
      await load(examId);
    } catch (err) { setError(err instanceof Error ? err.message : "Subject could not be created."); }
  }

  async function createTopic(event: FormEvent<HTMLFormElement>, subjectId: number) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api("/api/topics", { method: "POST", body: JSON.stringify({ name: data.get("name"), subjectId }) });
      setShowTopicForm(null);
      await load(examId);
    } catch (err) { setError(err instanceof Error ? err.message : "Topic could not be created."); }
  }

  async function deleteExam() {
    if (!examId || !window.confirm(`Delete ${syllabus?.name}? Its subjects and topics will also be deleted.`)) return;
    try {
      await api(`/api/exams/${examId}`, { method: "DELETE" });
      await load(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Exam could not be deleted."); }
  }

  const nav = [
    { label: "Overview", icon: "grid" },
    { label: "My syllabus", icon: "book" },
    { label: "Progress", icon: "chart" },
  ];

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <Link className="brand" href="/">
          <span className="brand-mark"><span/><span/><span/><span/></span>
          <span>prep<span className="brand-light">track</span></span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {nav.map((item) => <button key={item.label} className={`nav-link ${activeNav === item.label ? "active" : ""}`} onClick={() => { setActiveNav(item.label); setMobileNav(false); document.getElementById(item.label === "My syllabus" ? "syllabus" : item.label === "Progress" ? "progress" : "overview")?.scrollIntoView({ behavior: "smooth" }); }}><Icon name={item.icon}/><span>{item.label}</span>{item.label === "My syllabus" && <Icon name="chevron" size={15}/>}</button>)}
        </nav>
        <div className="workspace-label discover-label">DISCOVER</div>
        <nav className="side-nav" aria-label="Explore and profile">
          <Link className="nav-link" href="/explore"><Icon name="search"/><span>Explore exams</span><Icon name="chevron" size={15}/></Link>
          <Link className="nav-link" href="/profile"><Icon name="target"/><span>My profile</span><Icon name="chevron" size={15}/></Link>
        </nav>
        <div className="sidebar-spacer"/>
        <div className="focus-card">
          <div className="focus-orb"><Icon name="spark" size={17}/></div>
          <div className="focus-title">A little progress<br/>goes a long way.</div>
          <p>Stay consistent. Your future self will thank you.</p>
          <div className="focus-line"><span style={{ width: `${stats.percent}%` }}/></div>
          <div className="focus-meta"><span>Overall progress</span><strong>{stats.percent}%</strong></div>
        </div>
        <button className="profile-switch" onClick={() => setShowProfile(true)}>
          <span className="avatar">{user ? initials(user.name) : "P"}</span>
          <span className="profile-name"><strong>{user?.name ?? "Set up your profile"}</strong><small>{user?.email ?? "Save your study progress"}</small></span>
          <Icon name="settings" size={16}/>
        </button>
      </aside>

      <section className="main-column" id="overview">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMobileNav(!mobileNav)}><Icon name={mobileNav ? "close" : "menu"}/></button>
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={14}/><strong>{activeNav}</strong></div>
          <div className="top-actions">
            <label className="exam-select-wrap"><span className="sr-only">Choose exam</span><select value={examId ?? ""} onChange={(event) => { const id = Number(event.target.value) || null; setExamId(id); if (id) void load(id); }}><option value="">Select exam</option>{exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}</select><Icon name="down" size={14}/></label>
            <button className="icon-button notification" aria-label="Notifications"><Icon name="bell"/><i/></button>
            <button className="avatar avatar-top" onClick={() => setShowProfile(true)} aria-label="Open profile">{user ? initials(user.name) : "P"}</button>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><Icon name="close" size={16}/></button></div>}
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR STUDY SPACE</div><h1>Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}<span className="wave">✦</span></h1><p>Make today count. One focused session at a time.</p></div>
            <button className="button button-primary" onClick={() => { if (!user) setShowProfile(true); else if (!examId) setShowExamForm(true); else if (!syllabus?.subjects.length) setShowSubjectForm(true); else if (!topics.length) setShowTopicForm(syllabus.subjects[0].id); else { setActiveNav("My syllabus"); document.getElementById("syllabus")?.scrollIntoView({ behavior: "smooth" }); } }}><Icon name={topics.length ? "book" : "plus"} size={17}/><span>{topics.length ? "Continue studying" : !user ? "Set up your profile" : !examId ? "Create your first exam" : !syllabus?.subjects.length ? "Add your first subject" : "Add your first topic"}</span></button>
          </section>

          <section className="hero-card" aria-label="Study progress">
            <div className="hero-glow"/><div className="hero-content">
              <div className="hero-kicker"><span className="live-dot"/> YOUR MOMENTUM</div>
              <h2>{stats.percent === 100 && topics.length ? "You’ve mastered this syllabus." : "Small steps. Big results."}</h2>
              <p>{topics.length ? `${stats.remaining} topic${stats.remaining === 1 ? "" : "s"} left in ${syllabus?.name ?? "your syllabus"}. Keep building the habit.` : "Choose an exam and add your syllabus to start tracking your preparation."}</p>
              <button className="hero-button" onClick={() => { setActiveNav("My syllabus"); document.getElementById("syllabus")?.scrollIntoView({ behavior: "smooth" }); }}>{topics.length ? "Continue learning" : "Build your syllabus"}<Icon name="chevron" size={15}/></button>
            </div>
            <div className="hero-progress" aria-label={`${stats.percent}% complete`}><svg viewBox="0 0 140 140"><circle className="ring-track" cx="70" cy="70" r="60"/><circle className="ring-value" cx="70" cy="70" r="60" style={{ strokeDasharray: `${stats.percent * 3.77} 377` }}/></svg><div className="ring-label"><strong>{stats.percent}<small>%</small></strong><span>COMPLETED</span></div></div>
            <div className="hero-decoration deco-one"/><div className="hero-decoration deco-two"/>
          </section>

          <section className="stats-grid" id="progress" aria-label="Study statistics">
            <article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><Icon name="target"/></span><span className="stat-caption">IN YOUR SYLLABUS</span></div><div className="stat-value">{topics.length}<span> topics</span></div><div className="stat-foot">Across {syllabus?.subjects.length ?? 0} subjects</div><div className="stat-spark spark-violet"><span/><span/><span/><span/><span/><span/><span/><span/></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon mint"><Icon name="check"/></span><span className="stat-caption">COMPLETED</span></div><div className="stat-value">{stats.done}<span> topics</span></div><div className="stat-foot"><strong className="positive">{stats.percent}%</strong> of your syllabus</div><div className="stat-spark spark-mint"><span/><span/><span/><span/><span/><span/><span/><span/></div></article>
            <article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><Icon name="clock"/></span><span className="stat-caption">IN PROGRESS</span></div><div className="stat-value">{stats.learning + stats.revising}<span> topics</span></div><div className="stat-foot">{stats.learning} learning · {stats.revising} revising</div><div className="stat-spark spark-blue"><span/><span/><span/><span/><span/><span/><span/><span/></div></article>
          </section>

          <section className="syllabus-section" id="syllabus">
            <div className="section-heading"><div><div className="eyebrow">YOUR LEARNING PATH</div><h2>My syllabus</h2><p>Keep your preparation organized, one subject at a time.</p></div><div className="section-controls"><label className="search-box"><Icon name="search" size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search topics" aria-label="Search topics"/><kbd>⌘ K</kbd></label><button className="button button-secondary" onClick={() => setShowSubjectForm(true)} disabled={!examId}><Icon name="plus" size={16}/> Add subject</button><button className="more-button" title="Delete current exam" onClick={deleteExam} disabled={!examId}><Icon name="trash" size={16}/></button></div></div>
            {loading ? <div className="loading-state"><span className="spinner"/> Loading your syllabus…</div> : !exams.length ? <div className="empty-state"><div className="empty-icon"><Icon name="book" size={22}/></div><h3>Your study plan starts here</h3><p>Create an exam to organize subjects and topics, then track your progress as you go.</p><button className="button button-primary" onClick={() => setShowExamForm(true)}><Icon name="plus" size={17}/> Create your first exam</button></div> : !topics.length && !syllabus?.subjects.length ? <div className="empty-state compact"><div className="empty-icon"><Icon name="spark" size={21}/></div><h3>Build out {syllabus?.name}</h3><p>Add your first subject to start mapping your preparation.</p><button className="button button-primary" onClick={() => setShowSubjectForm(true)}><Icon name="plus" size={17}/> Add a subject</button></div> : <div className="subject-list">{filteredSubjects.map((subject, index) => {
              const complete = subject.topics.filter((topic) => progressByTopic.get(topic.id)?.status === "DONE").length;
              const pct = subject.topics.length ? Math.round(complete / subject.topics.length * 100) : 0;
              return <article className="subject-card" key={subject.id}><div className="subject-head"><div className={`subject-number subject-n${index % 4}`}>{String(index + 1).padStart(2, "0")}</div><div className="subject-info"><h3>{subject.name}</h3><span>{subject.topics.length} topic{subject.topics.length === 1 ? "" : "s"} · {complete} completed</span></div><div className="subject-progress"><span>{pct}%</span><div className="mini-track"><i style={{ width: `${pct}%` }}/></div></div><button className="add-topic" onClick={() => setShowTopicForm(subject.id)} aria-label={`Add topic to ${subject.name}`} title="Add topic"><Icon name="plus" size={16}/></button></div>
                {subject.topics.length > 0 ? <div className="topic-list">{subject.topics.filter((topic) => !search || subject.name.toLowerCase().includes(search.toLowerCase()) || topic.name.toLowerCase().includes(search.toLowerCase())).map((topic) => {
                  const status = progressByTopic.get(topic.id)?.status ?? "NOT_STARTED";
                  return <div className="topic-row" key={topic.id}><span className={`topic-state state-${status.toLowerCase()}`}>{status === "DONE" ? <Icon name="check" size={13}/> : status === "LEARNING" ? <span className="state-dot"/> : status === "REVISING" ? <Icon name="clock" size={13}/> : <span className="state-empty"/>}</span><span className="topic-name">{topic.name}</span><span className={`topic-status status-${status.toLowerCase()}`}>{statusLabel[status]}</span><label className="status-select"><span className="sr-only">Progress for {topic.name}</span><select value={status} disabled={busyTopic === topic.id} onChange={(event) => void changeStatus(topic, event.target.value as Status)}>{STATUS.map((option) => <option value={option} key={option}>{statusLabel[option]}</option>)}</select><Icon name="down" size={13}/></label></div>;
                })}</div> : <div className="no-topics">No topics yet. <button onClick={() => setShowTopicForm(subject.id)}>Add one</button></div>}</article>;
            })}{!filteredSubjects.length && <div className="no-results">No subjects or topics match “{search}”.</div>}<button className="add-subject-row" onClick={() => setShowSubjectForm(true)}><span><Icon name="plus" size={16}/></span> Add another subject</button></div>}
          </section>

          <footer className="page-footer"><span>Made for the long game.</span><span>PREPTRACK <i>·</i> YOUR PROGRESS, YOUR PACE</span></footer>
        </div>
      </section>

      {mobileNav && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setMobileNav(false)}/>}
      {showProfile && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProfile(false); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="profile-title"><button className="modal-close" onClick={() => setShowProfile(false)} aria-label="Close"><Icon name="close"/></button><div className="modal-mark"><Icon name="target" size={21}/></div><div className="eyebrow">YOUR PREPTRACK PROFILE</div><h2 id="profile-title">Make your progress yours.</h2><p>Create a lightweight profile to save your topic progress across sessions.</p>{user && <div className="current-profile"><span className="avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><button onClick={() => { localStorage.removeItem("preptrack-user"); setUser(null); setProgress([]); setShowProfile(false); }}>Sign out</button></div>}<form onSubmit={createProfile} className="form-stack"><label>Your name<input name="name" placeholder="e.g. Alex Morgan" required maxLength={100}/></label><label>Email address<input name="email" type="email" placeholder="you@example.com" required maxLength={150}/></label><button className="button button-primary full-button" disabled={profileBusy}>{profileBusy ? "Creating profile…" : user ? "Create another profile" : "Create my profile"}<Icon name="chevron" size={15}/></button></form><small className="form-note">Your profile is stored securely with your study data.</small></section></div>}
      {showExamForm && <Modal title="Create an exam" subtitle="Start with the exam you’re preparing for." onClose={() => setShowExamForm(false)}><form className="form-stack" onSubmit={createExam}><label>Exam name<input name="name" placeholder="e.g. Civil Services Examination" required maxLength={100}/></label><label>Description <span className="optional">(optional)</span><textarea name="description" placeholder="Add a little context about your goal" maxLength={500}/></label><button className="button button-primary full-button">Create exam <Icon name="chevron" size={15}/></button></form></Modal>}
      {showSubjectForm && <Modal title="Add a subject" subtitle={`Organize your ${syllabus?.name ?? "exam"} syllabus.`} onClose={() => setShowSubjectForm(false)}><form className="form-stack" onSubmit={createSubject}><label>Subject name<input name="name" placeholder="e.g. General Studies" required maxLength={100}/></label><button className="button button-primary full-button">Add subject <Icon name="chevron" size={15}/></button></form></Modal>}
      {showTopicForm !== null && <Modal title="Add a topic" subtitle={`Add a topic to ${syllabus?.subjects.find((subject) => subject.id === showTopicForm)?.name ?? "your subject"}.`} onClose={() => setShowTopicForm(null)}><form className="form-stack" onSubmit={(event) => void createTopic(event, showTopicForm)}><label>Topic name<input name="name" placeholder="e.g. Indian Constitution" required maxLength={100}/></label><button className="button button-primary full-button">Add topic <Icon name="chevron" size={15}/></button></form></Modal>}
    </main>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="generic-modal-title"><button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close"/></button><div className="modal-mark"><Icon name="spark" size={21}/></div><div className="eyebrow">BUILD YOUR LEARNING PATH</div><h2 id="generic-modal-title">{title}</h2><p>{subtitle}</p>{children}</section></div>;
}
