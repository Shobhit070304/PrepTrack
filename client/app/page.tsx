import Link from "next/link";

function Mark() {
  return <span className="brand-mark"><span/><span/><span/><span/></span>;
}

function Arrow() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
}

function Spark() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></svg>;
}

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" href="/"><Mark/><span>prep<span>track</span></span></Link>
        <nav className="landing-nav" aria-label="Main navigation"><Link href="/explore">Explore exams</Link><a href="#how-it-works">How it works</a></nav>
        <div className="landing-actions"><Link className="landing-login" href="/profile">My profile</Link><Link className="landing-nav-cta" href="/dashboard">Open workspace <Arrow/></Link></div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-eyebrow"><span/><Spark/> A CLEARER WAY TO PREPARE</div>
          <h1>Make your next<br/><em>big goal</em> feel closer.</h1>
          <p className="landing-lede">A calm, focused space to map your syllabus, build steady habits, and see just how far you’ve come.</p>
          <div className="landing-hero-actions"><Link className="landing-primary" href="/explore">Explore exams <Arrow/></Link><Link className="landing-secondary" href="/dashboard">Go to my workspace <span>↗</span></Link></div>
          <div className="landing-proof"><div className="proof-avatars"><span>A</span><span>M</span><span>R</span></div><p><strong>One topic at a time.</strong><br/>Progress that feels possible.</p><span className="proof-separator"/><span className="proof-note"><i/> Built for focused preparation</span></div>
        </div>
        <div className="landing-visual" aria-label="Preview of your study dashboard">
          <div className="visual-halo"/><div className="visual-orbit orbit-a"/><div className="visual-orbit orbit-b"/>
          <div className="preview-window">
            <div className="preview-top"><div className="preview-dots"><i/><i/><i/></div><span>MY STUDY SPACE</span><span className="preview-avatar">A</span></div>
            <div className="preview-body"><div className="preview-welcome"><span>YOUR LEARNING PATH</span><strong>Steady progress,<br/>stronger confidence.</strong><small>Keep your momentum going.</small></div>
              <div className="preview-chart"><div className="chart-heading"><span>OVERALL PROGRESS</span><strong>68%</strong></div><div className="chart-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="48"/><circle className="chart-ring-value" cx="60" cy="60" r="48"/></svg><span>68<small>%</small></span></div><div className="chart-caption"><i/> 18 of 26 topics completed</div></div>
              <div className="preview-subjects"><div className="preview-subject-heading"><strong>Your subjects</strong><span>VIEW ALL →</span></div><div className="preview-subject"><span className="preview-subject-icon icon-gold">01</span><span><strong>General Studies</strong><small>12 topics · 8 completed</small></span><b>67%</b></div><div className="preview-subject"><span className="preview-subject-icon icon-sage">02</span><span><strong>Quantitative Aptitude</strong><small>8 topics · 6 completed</small></span><b>75%</b></div><div className="preview-subject"><span className="preview-subject-icon icon-blue">03</span><span><strong>English Language</strong><small>6 topics · 4 completed</small></span><b>67%</b></div></div>
            </div>
          </div>
          <div className="floating-note note-top"><span className="note-check">✓</span><span><strong>Nice work!</strong><small>Another topic complete</small></span></div>
          <div className="floating-note note-bottom"><span className="note-spark"><Spark/></span><span><strong>Consistency wins</strong><small>Keep your streak moving</small></span></div>
          <div className="visual-star star-a">✳</div><div className="visual-star star-b">✦</div>
        </div>
      </section>

      <section className="landing-strip"><span>YOUR PREPARATION, MADE CLEAR</span><div><i/>Organize your syllabus</div><div><i/>Track every topic</div><div><i/>Celebrate real progress</div></section>

      <section className="landing-features" id="how-it-works"><div className="feature-intro"><div className="landing-eyebrow"><span/> SIMPLE BY DESIGN</div><h2>Clarity for the<br/>work ahead.</h2><p>Big exams are made up of small steps. PrepTrack helps you see those steps and keep moving.</p><Link href="/explore">Find your exam <Arrow/></Link></div>
        <article className="feature-card feature-card-syllabus"><span className="feature-number">01 / ORGANIZE</span><div className="feature-art art-stack"><span>Exam</span><span>Subjects <b>03</b></span><span>Topics <b>26</b></span></div><h3>Your syllabus, in view.</h3><p>Bring subjects and topics into one clean learning path you can actually follow.</p></article>
        <article className="feature-card feature-card-progress"><span className="feature-number">02 / TRACK</span><div className="feature-art art-progress"><div><strong>68%</strong><span>of your path</span></div><i/><i/><i/><i/><i/></div><h3>Progress you can feel.</h3><p>Mark what you’re learning, revising, and completing. Every step counts.</p></article>
        <article className="feature-card feature-card-focus"><span className="feature-number">03 / KEEP GOING</span><div className="feature-art art-focus"><Spark/><span>Keep showing up.</span><small>One focused session at a time.</small></div><h3>Stay with the journey.</h3><p>Keep your goals close and return to a workspace built for focus.</p></article>
      </section>

      <section className="landing-cta"><div className="cta-decoration"><span/><span/><span/></div><div className="landing-eyebrow"><span/> YOUR NEXT STEP STARTS HERE</div><h2>Turn your preparation<br/>into visible progress.</h2><p>Explore an exam and make the path ahead feel manageable.</p><Link className="landing-primary cta-button" href="/explore">Explore exams <Arrow/></Link><span className="cta-footnote">No noise. Just your next step.</span></section>
      <footer className="landing-footer"><Link className="landing-brand" href="/"><Mark/><span>prep<span>track</span></span></Link><span>Thoughtful preparation, one step at a time.</span><div><Link href="/explore">Explore</Link><Link href="/profile">Profile</Link><Link href="/dashboard">Workspace</Link></div><small>© PrepTrack</small></footer>
    </main>
  );
}
