"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type User = { id: number; name: string; email: string };
type Exam = { id: number; name: string; description: string | null };
type Syllabus = { id: number; name: string; subjects: { id: number; name: string; topics: { id: number; name: string; subjectId: number }[] }[] };
type Progress = { topicId: number; topicName: string; status: "NOT_STARTED" | "LEARNING" | "REVISING" | "DONE"; updatedAt: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try { const body = await response.json(); message = body.message || body.error || message; } catch { /* error has no JSON body */ }
    throw new Error(message);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P"; }

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let savedUser: User | null = null;
    try { const saved = localStorage.getItem("preptrack-user"); if (saved) savedUser = JSON.parse(saved) as User; } catch { localStorage.removeItem("preptrack-user"); }
    void (async () => {
      try {
        const exams = await request<Exam[]>("/api/exams");
        const trees = await Promise.all(exams.map((exam) => request<Syllabus>(`/api/exams/${exam.id}/syllabus`)));
        if (active) setSyllabi(trees);
        if (savedUser) {
          const records = await request<Progress[]>(`/api/users/${savedUser.id}/progress`);
          if (active) { setUser(savedUser); setProgress(records); }
        }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : "Could not load your profile."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const topicIds = useMemo(() => new Set(syllabi.flatMap((syllabus) => syllabus.subjects.flatMap((subject) => subject.topics.map((topic) => topic.id)))), [syllabi]);
  const ownProgress = progress.filter((item) => topicIds.has(item.topicId));
  const completed = ownProgress.filter((item) => item.status === "DONE").length;
  const learning = ownProgress.filter((item) => item.status === "LEARNING").length;
  const revising = ownProgress.filter((item) => item.status === "REVISING").length;
  const totalTopics = topicIds.size;
  const percent = totalTopics ? Math.round(completed / totalTopics * 100) : 0;

  async function createProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const created = await request<User>("/api/users", { method: "POST", body: JSON.stringify({ name: form.get("name"), email: form.get("email") }) });
      localStorage.setItem("preptrack-user", JSON.stringify(created)); setUser(created);
      setProgress(await request<Progress[]>(`/api/users/${created.id}/progress`));
    } catch (err) { setError(err instanceof Error ? err.message : "Profile could not be created."); }
    finally { setBusy(false); }
  }

  function signOut() { localStorage.removeItem("preptrack-user"); setUser(null); setProgress([]); }

  return <main className="profile-page">
    <header className="landing-header profile-header"><Link className="landing-brand" href="/"><span className="brand-mark"><span/><span/><span/><span/></span><span>prep<span>track</span></span></Link><nav className="landing-nav"><Link href="/explore">Explore exams</Link><Link href="/dashboard">Workspace</Link></nav><div className="landing-actions"><Link className="landing-login" href="/">Home</Link><Link className="landing-nav-cta" href="/dashboard">Open workspace <span>↗</span></Link></div></header>
    <section className="profile-page-head"><div className="landing-eyebrow"><span/> YOUR PERSONAL SPACE</div><h1>Your profile,<br/><em>your progress.</em></h1><p>A quiet place to see the work you’ve put in and the path still ahead.</p></section>
    {error && <div className="profile-error" role="alert"><span>{error}</span><button onClick={() => setError("")}>Dismiss</button></div>}
    {loading ? <div className="profile-loading"><span className="spinner"/>Loading your profile…</div> : user ? <section className="profile-layout">
      <article className="profile-card"><div className="profile-card-cover"><span>PREPTRACK MEMBER</span><div className="profile-cover-glow"/></div><div className="profile-card-content"><span className="profile-avatar-large">{initials(user.name)}</span><h2>{user.name}</h2><p>{user.email}</p><div className="profile-meta"><span><i/> Profile active</span><small>Member workspace</small></div><button className="profile-signout" onClick={signOut}>Sign out</button></div></article>
      <div className="profile-main"><div className="profile-summary"><div><div className="landing-eyebrow"><span/> YOUR MOMENTUM</div><h2>You’re building something good.</h2><p>Every topic you complete is a step toward your goal.</p></div><div className="profile-progress-ring"><svg viewBox="0 0 112 112"><circle cx="56" cy="56" r="46"/><circle className="profile-ring-value" cx="56" cy="56" r="46" style={{ strokeDasharray: `${percent * 2.89} 289` }}/></svg><span><strong>{percent}%</strong><small>COMPLETE</small></span></div></div>
        <div className="profile-stats"><article><span className="profile-stat-icon stat-complete">✓</span><strong>{completed}</strong><small>Completed</small></article><article><span className="profile-stat-icon stat-learning">◌</span><strong>{learning}</strong><small>Learning</small></article><article><span className="profile-stat-icon stat-revising">↻</span><strong>{revising}</strong><small>Revising</small></article><article><span className="profile-stat-icon stat-total">⌗</span><strong>{totalTopics}</strong><small>Total topics</small></article></div>
        <article className="profile-activity"><div className="profile-activity-head"><div><div className="landing-eyebrow"><span/> RECENT ACTIVITY</div><h3>Your latest steps</h3></div><Link href="/dashboard">Go to workspace <span>→</span></Link></div>{ownProgress.length ? <div className="activity-list">{[...ownProgress].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6).map((item) => <div className="activity-row" key={item.topicId}><span className={`activity-status status-${item.status.toLowerCase()}`}>{item.status === "DONE" ? "✓" : item.status === "LEARNING" ? "◌" : item.status === "REVISING" ? "↻" : "·"}</span><span className="activity-name">{item.topicName}</span><span className={`activity-label activity-${item.status.toLowerCase()}`}>{item.status.replace("_", " ")}</span><time>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(item.updatedAt))}</time></div>)}</div> : <div className="profile-no-activity"><span>✦</span><strong>Your first milestone is waiting.</strong><small>Update a topic’s status in your workspace and your progress will appear here.</small><Link href="/dashboard">Open workspace <span>→</span></Link></div>}</article>
      </div>
    </section> : <section className="profile-setup"><div className="profile-setup-mark">✳</div><div className="landing-eyebrow"><span/> START YOUR PREPTRACK PROFILE</div><h2>Make this journey yours.</h2><p>Create a profile to connect your study progress to a name and workspace.</p><form className="profile-form" onSubmit={createProfile}><label>Your name<input name="name" placeholder="e.g. Alex Morgan" required maxLength={100}/></label><label>Email address<input name="email" type="email" placeholder="you@example.com" required maxLength={150}/></label><button className="landing-primary" disabled={busy}>{busy ? "Creating profile…" : "Create my profile"}<span>→</span></button></form><small className="profile-setup-note">Your profile is saved with your progress in PrepTrack.</small></section>}
    <footer className="landing-footer"><Link className="landing-brand" href="/"><span className="brand-mark"><span/><span/><span/><span/></span><span>prep<span>track</span></span></Link><span>Thoughtful preparation, one step at a time.</span><div><Link href="/explore">Explore</Link><Link href="/dashboard">Workspace</Link></div><small>© PrepTrack</small></footer>
  </main>;
}
