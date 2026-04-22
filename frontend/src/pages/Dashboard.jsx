import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ── Circular Arc Score ────────────────────────────────────────────────────────
function ArcScore({ score }) {
  const [displayed, setDisplayed] = useState(0)
  const R = 46
  const circ = 2 * Math.PI * R
  const offset = circ - (score / 100) * circ

  useEffect(() => {
    let start = 0
    const step = () => {
      start += 1
      if (start <= score) {
        setDisplayed(start)
        requestAnimationFrame(step)
      }
    }
    const id = setTimeout(() => requestAnimationFrame(step), 300)
    return () => clearTimeout(id)
  }, [score])

  const verdict = score >= 75 ? 'Strong Match' : score >= 55 ? 'Moderate Match' : 'Needs Work'
  const verdictColor = score >= 75 ? '#34d399' : score >= 55 ? '#fbbf24' : '#fb7185'

  return (
    <div
      className="glass rounded-2xl p-6 flex items-center gap-7 mb-4"
    >
      {/* Arc */}
      <div className="relative flex-shrink-0" style={{ width: 108, height: 108 }}>
        <svg width="108" height="108" viewBox="0 0 108 108">
          <circle cx="54" cy="54" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
          <circle
            cx="54" cy="54" r={R} fill="none"
            stroke="url(#arcGrad)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 54 54)"
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)' }}
          />
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-extrabold leading-none"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {displayed}
          </span>
          <span className="text-xs text-slate-500 font-semibold mt-0.5">Match</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-base font-bold text-white mb-1" style={{ color: verdictColor }}>
          {verdict}
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          {score >= 75
            ? 'Your profile aligns strongly with this role. Focus on the remaining skill gaps to maximise your chances.'
            : score >= 55
            ? 'Solid foundation. Bridging the skill gaps below could make you a top candidate for this role.'
            : 'Significant gaps exist. Targeted upskilling before applying is recommended.'}
        </p>
        {/* Bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${score}%`,
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              transition: 'width 1.4s cubic-bezier(.16,1,.3,1)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Metric Cards ─────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, badge, badgeStyle }) {
  return (
    <div className="glass rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40">
      <div className="flex justify-between items-start mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: 'rgba(99,102,241,.12)' }}
        >
          {icon}
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full tracking-wide" style={badgeStyle}>
          {badge}
        </span>
      </div>
      <div className="text-2xl font-extrabold mb-1">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

// ── Skill Tags ────────────────────────────────────────────────────────────────
function SkillTag({ label, type }) {
  const styles = {
    green: {
      background: 'rgba(16,185,129,.1)',
      border: '1px solid rgba(16,185,129,.25)',
      color: '#34d399',
    },
    red: {
      background: 'rgba(244,63,94,.09)',
      border: '1px solid rgba(244,63,94,.22)',
      color: '#fb7185',
    },
  }
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold transition-transform duration-150 hover:scale-105 cursor-default"
      style={styles[type]}
    >
      {label}
    </span>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ score, activeNav, onSelectNav, onOpenCareerOptions, onOpenPreferences, onLogout }) {
  const navItems = [
    { id: 'dashboard', icon: '▦', label: 'Dashboard', kind: 'scroll', targetId: 'dash-dashboard' },
    { id: 'skills', icon: '◈', label: 'Skills Report', kind: 'scroll', targetId: 'dash-skills' },
    { id: 'careers', icon: '↗', label: 'Career Options', kind: 'action' },
    { id: 'prefs', icon: '⚙', label: 'Preferences', kind: 'action' },
  ]

  return (
    <aside
      className="w-52 flex-shrink-0 flex flex-col border-r"
      style={{ background: 'rgba(13,20,51,0.55)', borderColor: 'rgba(99,102,241,.18)', minHeight: '100vh', position: 'sticky', top: 0, backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center gap-2 px-5 py-6 border-b" style={{ borderColor: 'rgba(99,102,241,.18)' }}>
        <span
          className="font-black italic tracking-widest text-sm text-white"
          style={{ fontFamily: 'Orbitron, Inter, system-ui, sans-serif' }}
        >
          RESUMIND
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs font-bold tracking-widest text-slate-600 px-2 mb-2 uppercase">Analysis</p>
        {navItems.map(item => {
          const active = item.id === activeNav
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.kind === 'action') {
                  if (item.id === 'careers') onOpenCareerOptions?.()
                  if (item.id === 'prefs') onOpenPreferences?.()
                  onSelectNav?.(item.id)
                  return
                }
                onSelectNav?.(item.id, item.targetId)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: active ? 'rgba(99,102,241,.15)' : 'transparent',
                color: active ? '#e2e8f0' : '#64748b',
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Score pill */}
      <div
        className="mx-3 mb-5 p-4 rounded-xl text-center"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.15), rgba(168,85,247,.1))', border: '1px solid rgba(99,102,241,.3)' }}
      >
        <div
          className="text-3xl font-extrabold leading-none mb-1"
          style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          {score}%
        </div>
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Match Score</div>
      </div>

      <div className="mx-3 mb-6">
        <button
          type="button"
          onClick={onLogout}
          className="w-full px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: 'rgba(244,63,94,.09)',
            border: '1px solid rgba(244,63,94,.22)',
            color: '#fb7185',
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  )
}

// ── Suggestions ───────────────────────────────────────────────────────────────
function generateSuggestions(matchScore, missingSkills) {
  const suggestions = []

  if (missingSkills.length > 0) {
    suggestions.push(
      `Add <strong>${missingSkills.slice(0, 2).join(' & ')}</strong> to your resume — these are explicitly required by this role.`
    )
  }

  if (matchScore < 60) {
    suggestions.push(
      `Your overall semantic match is below 60%. Consider tailoring your resume language to mirror keywords in the job description.`
    )
  } else if (matchScore < 80) {
    suggestions.push(
      `Strong foundation. Highlighting your <strong>end-to-end project experience</strong> more prominently could boost your score.`
    )
  } else {
    suggestions.push(
      `Excellent match! Stand out by quantifying your impact — e.g. <strong>"reduced inference latency by 42%"</strong> instead of vague statements.`
    )
  }

  if (missingSkills.length > 2) {
    suggestions.push(
      `Consider upskilling on <strong>${missingSkills.slice(2, 4).join(' and ')}</strong> via structured courses (Coursera, fast.ai, or official docs).`
    )
  }

  suggestions.push(
    `Tailor your <strong>professional summary</strong> to reflect the seniority and domain focus of this specific role — generic summaries get filtered out.`
  )

  return suggestions.slice(0, 4)
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ results, fileName, jobDescription, onNewAnalysis, onViewHistory, onViewCareerOptions, onViewPreferences, onLogout }) {
  const { match_score, matching_skills, missing_skills } = results
  const total = matching_skills.length + missing_skills.length
  const suggestions = generateSuggestions(match_score, missing_skills)

  const semanticScore = Number.isFinite(results?.semantic_score) ? results.semantic_score : null
  const structuredScore = Number.isFinite(results?.structured_score) ? results.structured_score : null

  const mainRef = useRef(null)
  const [activeNav, setActiveNav] = useState('dashboard')

  function scrollTo(targetId) {
    const root = mainRef.current
    if (!root || !targetId) return
    const el = root.querySelector(`#${targetId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleSelectNav(id, targetId) {
    setActiveNav(id)
    if (targetId) scrollTo(targetId)
  }

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  })

  const jobPreview = (() => {
    const cleaned = String(jobDescription || '').split(/\s+/).filter(Boolean).join(' ')
    if (!cleaned) return ''
    return cleaned.length <= 140 ? cleaned : `${cleaned.slice(0, 140).trim()}…`
  })()

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar
        score={match_score}
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        onOpenCareerOptions={() => onViewCareerOptions?.()}
        onOpenPreferences={() => onViewPreferences?.()}
        onLogout={onLogout}
      />

      {/* Main content */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto px-7 py-7"
        style={{ background: 'transparent' }}
      >
        <section id="dash-dashboard" className="scroll-mt-6">
          {/* Header */}
          <motion.div {...fadeUp(0)} className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">Analysis Results</h1>
              <div className="text-xs text-slate-500 space-y-1">
                <div className="truncate">Resume: <span className="text-slate-300/90">{fileName}</span></div>
                <div className="truncate">Job: <span className="text-slate-300/90">{jobPreview || '—'}</span></div>
              </div>
            </div>
            <button
              onClick={onNewAnalysis}
              className="button text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:bg-indigo-500/10"
              style={{ border: '1px solid rgba(99,102,241,.35)', color: '#e2e8f0' }}
            >
              + New Analysis
            </button>
          </motion.div>

          {/* Arc score */}
          <motion.div {...fadeUp(0.1)}>
            <ArcScore score={match_score} />
          </motion.div>

          {(semanticScore !== null || structuredScore !== null) && (
            <motion.div {...fadeUp(0.14)} className="mb-4">
              <div
                className="rounded-2xl px-4 py-3 text-xs flex flex-wrap items-center gap-x-3 gap-y-1"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="font-bold text-slate-200">Score breakdown</span>
                {semanticScore !== null && (
                  <span className="text-slate-100/70">Semantic (resume ↔ JD): <span className="text-slate-200 font-semibold">{semanticScore}%</span></span>
                )}
                {structuredScore !== null && (
                  <span className="text-slate-100/70">Structured (projects/internships/etc): <span className="text-slate-200 font-semibold">{structuredScore}%</span></span>
                )}
              </div>
            </motion.div>
          )}

          {/* Metric cards */}
          <motion.div {...fadeUp(0.2)} className="grid grid-cols-3 gap-3 mb-4">
            <MetricCard
              icon="✓"
              label="Matched Skills"
              value={matching_skills.length}
              badge={total ? `${Math.round((matching_skills.length / total) * 100)}%` : '0%'}
              badgeStyle={{ background: 'rgba(16,185,129,.15)', color: '#34d399' }}
            />
            <MetricCard
              icon="✗"
              label="Missing Skills"
              value={missing_skills.length}
              badge={total ? `${Math.round((missing_skills.length / total) * 100)}%` : '0%'}
              badgeStyle={{ background: 'rgba(251,191,36,.15)', color: '#fbbf24' }}
            />
            <MetricCard
              icon="◎"
              label="Job Skills Detected"
              value={total}
              badge="TOTAL"
              badgeStyle={{ background: 'rgba(99,102,241,.15)', color: '#818cf8' }}
            />
          </motion.div>
        </section>

        <section id="dash-skills" className="scroll-mt-6">
          {/* Skills grid */}
          <motion.div {...fadeUp(0.3)} className="grid grid-cols-2 gap-4 mb-4">
          {/* Matching */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white">Your Matching Skills</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full font-mono"
                style={{ background: 'rgba(16,185,129,.15)', color: '#34d399' }}
              >
                {matching_skills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {matching_skills.length > 0
                ? matching_skills.map(s => <SkillTag key={s} label={s} type="green" />)
                : <p className="text-xs text-slate-500">No matching skills detected.</p>
              }
            </div>
          </div>

          {/* Missing */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white">Skills to Acquire</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full font-mono"
                style={{ background: 'rgba(244,63,94,.15)', color: '#fb7185' }}
              >
                {missing_skills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missing_skills.length > 0
                ? missing_skills.map(s => <SkillTag key={s} label={s} type="red" />)
                : <p className="text-xs text-slate-500 italic">Great — no missing skills found!</p>
              }
            </div>
          </div>
          </motion.div>
        </section>

        {/* Suggestions */}
        <motion.div {...fadeUp(0.4)} className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">AI Career Suggestions</span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,.1)', color: '#818cf8' }}
            >
              Personalized
            </span>
          </div>
          <div className="space-y-0">
            {suggestions.map((text, i) => (
              <div
                key={i}
                className="flex gap-3 py-3 px-2 rounded-lg transition-all duration-150 hover:bg-indigo-500/5 hover:pl-3 cursor-default border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,.04)' }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5 font-mono"
                  style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.25)', color: '#818cf8' }}
                >
                  {`0${i + 1}`}
                </div>
                <p
                  className="text-sm text-slate-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: text.replace(/<strong>/g, '<strong class="text-slate-200 font-semibold">') }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
