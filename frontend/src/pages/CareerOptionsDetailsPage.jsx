import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CAREER_DETAILS } from './CareerDetailsPage.jsx'
import { TRACKS, normalizeSkill, uniqueNormalized, scoreTrack } from '../lib/tracks.js'

function inferDomainFromJobDescription(jobDescription) {
  const text = String(jobDescription || '').toLowerCase()
  if (!text.trim()) return ''

  let best = { score: 0, domain: '' }
  for (const t of TRACKS) {
    const hits = t.keywords.filter(k => text.includes(String(k || '').toLowerCase())).length
    const score = t.keywords.length ? hits / t.keywords.length : 0
    if (score > best.score) best = { score, domain: t.domain || '' }
  }

  // Require at least some signal; otherwise we can't confidently infer a domain.
  return best.score > 0 ? best.domain : ''
}

function buildUpskillActions(missingSkills) {
  const missing = (Array.isArray(missingSkills) ? missingSkills : []).filter(Boolean)
  if (missing.length === 0) {
    return [
      'Strengthen your portfolio with 1–2 real projects aligned to this role.',
      'Update your resume bullets to quantify impact (numbers, performance, outcomes).',
      'Practice interviews: 10 role-specific questions + 2 mock interviews.',
    ]
  }

  const top = missing.slice(0, 3)
  const first = top[0]
  const second = top[1]
  const third = top[2]

  const actions = []
  if (first) actions.push(`Learn ${first} and build a small project that uses it end-to-end.`)
  if (second) actions.push(`Add ${second} to your toolkit and include it in one measurable resume bullet.`)
  if (third) actions.push(`Practice ${third} with 20–30 targeted exercises or mini-tasks.`)
  while (actions.length < 3) actions.push('Ship one portfolio piece that matches a real job description for this role.')
  return actions.slice(0, 3)
}

function Sidebar({ activeNav, onSelectNav, onNavigate }) {
  const navItems = [
    { id: 'matches', icon: '↗', label: 'Matches', kind: 'scroll', targetId: 'co-matches' },
    { id: 'gaps', icon: '◈', label: 'Skill Gaps', kind: 'scroll', targetId: 'co-gaps' },
    { id: 'plan', icon: '✓', label: 'Upskill Plan', kind: 'scroll', targetId: 'co-plan' },
    { id: 'dashboard', icon: '▦', label: 'Dashboard', kind: 'action' },
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
        <p className="text-xs font-bold tracking-widest text-slate-600 px-2 mb-2 uppercase">Career Options</p>
        {navItems.map(item => {
          const active = item.id === activeNav
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.kind === 'action') {
                  if (item.id === 'dashboard') onNavigate?.('dashboard')
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

      <div
        className="mx-3 mb-5 p-4 rounded-xl text-center"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.15), rgba(168,85,247,.1))', border: '1px solid rgba(99,102,241,.3)' }}
      >
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Matched to your CV</div>
      </div>
    </aside>
  )
}

export default function CareerOptionsDetailsPage({ results, jobDescription, onNavigate, onOpenCareer }) {
  const mainRef = useRef(null)
  const [activeNav, setActiveNav] = useState('matches')

  const resumeSkills = results?.resume_skills
  const matchingSkills = results?.matching_skills
  const skillSource = Array.isArray(resumeSkills) && resumeSkills.length > 0 ? resumeSkills : matchingSkills
  const normalizedSkills = uniqueNormalized(skillSource)

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

  const scored = TRACKS.map(t => {
    const { matched, score } = scoreTrack(t, normalizedSkills)
    const detail = CAREER_DETAILS[t.id]
    const coreSkills = Array.isArray(detail?.skills) ? detail.skills : []
    const missingCore = coreSkills
      .map(normalizeSkill)
      .filter(Boolean)
      .filter(s => !normalizedSkills.includes(s))
      .slice(0, 6)

    return {
      ...t,
      score,
      matched: matched.slice(0, 6),
      missingCore,
      overview: detail?.overview || '',
      coreSkills,
      tools: Array.isArray(detail?.tools) ? detail.tools : [],
    }
  }).sort((a, b) => b.score - a.score)

  const topMatches = scored.filter(x => x.score > 0).slice(0, 3)
  const bestEffortMatches = topMatches.length > 0 ? topMatches : scored.slice(0, 3)

  const jobDomain = inferDomainFromJobDescription(jobDescription)
  const topMatchDomain = bestEffortMatches?.[0]?.domain || ''
  const showDomainMatches = jobDomain && topMatchDomain && jobDomain !== topMatchDomain
  const domainMatches = showDomainMatches
    ? scored.filter(t => t.domain === jobDomain).slice(0, 3)
    : []

  const domainLabel = jobDomain === 'tech' ? 'Tech' : jobDomain === 'finance' ? 'Finance' : jobDomain === 'core' ? 'Core' : jobDomain

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  })

  const hasAnalysis = Array.isArray(skillSource) && skillSource.length > 0

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar
        activeNav={activeNav}
        onSelectNav={handleSelectNav}
        onNavigate={onNavigate}
      />

      <main ref={mainRef} className="flex-1 overflow-y-auto px-7 py-7" style={{ background: 'transparent' }}>
        <motion.div {...fadeUp(0)} className="mb-6">
          <h1 className="text-xl font-bold text-white mb-1">Career Options</h1>
          <p className="text-xs text-slate-500">Jobs matched to your CV skills, with explanations and an upskill plan.</p>
        </motion.div>

        {!hasAnalysis ? (
          <motion.div {...fadeUp(0.1)} className="glass rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-white mb-2">No CV analysis loaded</h2>
            <p className="text-sm text-slate-100/70 mb-4">
              Upload your CV first so we can detect skills and match you to the best-fitting jobs.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('upload')}
              className="button text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:bg-indigo-500/10"
              style={{ border: '1px solid rgba(99,102,241,.35)', color: '#e2e8f0' }}
            >
              Go to Upload
            </button>
          </motion.div>
        ) : (
          <>
            <section id="co-matches" className="scroll-mt-6">
              <motion.div {...fadeUp(0.12)} className="glass rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">Top Matches</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(6,182,212,0.10)', color: '#67e8f9' }}
                  >
                    Based on your CV
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {bestEffortMatches.map(track => (
                    <div
                      key={track.id}
                      className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="text-sm font-extrabold text-white">{track.title}</div>
                          <div className="text-xs text-slate-100/60">{track.subtitle}</div>
                        </div>
                        <div
                          className="text-xs font-black px-2 py-1 rounded-lg flex-shrink-0"
                          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                          title="Heuristic fit score"
                        >
                          {track.score}%
                        </div>
                      </div>

                      <div className="text-xs text-slate-100/70 mb-3">
                        {track.matched?.length ? (
                          <span>
                            Why it matches: <span className="text-slate-200 font-semibold">{track.matched.join(', ')}</span>
                          </span>
                        ) : (
                          <span>Not enough strong signals yet — consider this an exploration option.</span>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--a3)' }}>
                          Jobs you can target
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {track.jobs.map(j => (
                            <span
                              key={j}
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(6,182,212,0.22)', color: '#67e8f9' }}
                            >
                              {j}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenCareer?.(track.id)}
                        className="button w-full text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:bg-indigo-500/10"
                        style={{ border: '1px solid rgba(99,102,241,.35)', color: '#e2e8f0' }}
                      >
                        View details
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {showDomainMatches && (
                <motion.div {...fadeUp(0.15)} className="glass rounded-2xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-white">Best matches for your searched job domain</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.10)', color: '#e9d5ff' }}
                      title="Inferred from your job description text"
                    >
                      {domainLabel}
                    </span>
                  </div>

                  <div className="text-xs text-slate-100/70 mb-3">
                    Your CV’s top match is in a different domain, so here are the best-fitting roles within the domain of the job you searched.
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {domainMatches.map(track => (
                      <div
                        key={track.id}
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="text-sm font-extrabold text-white">{track.title}</div>
                            <div className="text-xs text-slate-100/60">{track.subtitle}</div>
                          </div>
                          <div
                            className="text-xs font-black px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                            title="Heuristic fit score"
                          >
                            {track.score}%
                          </div>
                        </div>

                        <div className="text-xs text-slate-100/70 mb-3">
                          {track.matched?.length ? (
                            <span>
                              Why it matches: <span className="text-slate-200 font-semibold">{track.matched.join(', ')}</span>
                            </span>
                          ) : (
                            <span>Not enough strong signals yet — consider this an exploration option.</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenCareer?.(track.id)}
                          className="button w-full text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:bg-indigo-500/10"
                          style={{ border: '1px solid rgba(99,102,241,.35)', color: '#e2e8f0' }}
                        >
                          View details
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </section>

            <section id="co-gaps" className="scroll-mt-6">
              <motion.div {...fadeUp(0.18)} className="glass rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">Skill Gaps (per match)</span>
                  <span className="text-xs text-slate-100/60">What to add next</span>
                </div>

                <div className="space-y-3">
                  {bestEffortMatches.map(track => (
                    <div
                      key={track.id}
                      className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="text-sm font-extrabold text-white">{track.title}</div>
                        <div className="text-xs text-slate-100/60">Score: {track.score}%</div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--a2)' }}>
                            Skills you already show
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(track.matched?.length ? track.matched : ['—']).map(s => (
                              <span
                                key={s}
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: '#34d399' }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--a3)' }}>
                            Skills to implement next
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(track.missingCore?.length ? track.missingCore : ['No major gaps detected']).map(s => (
                              <span
                                key={s}
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ background: 'rgba(244,63,94,.09)', border: '1px solid rgba(244,63,94,.22)', color: '#fb7185' }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            <section id="co-plan" className="scroll-mt-6">
              <motion.div {...fadeUp(0.22)} className="glass rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white">Upskill Plan</span>
                  <span className="text-xs text-slate-100/60">Concrete next steps</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {bestEffortMatches.map(track => {
                    const actions = buildUpskillActions(track.missingCore)
                    return (
                      <div
                        key={track.id}
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div className="text-sm font-extrabold text-white mb-2">{track.title}</div>
                        <div className="space-y-2">
                          {actions.map((x, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div
                                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5 font-mono"
                                style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.25)', color: '#818cf8' }}
                              >
                                {i + 1}
                              </div>
                              <p className="text-sm text-slate-400 leading-relaxed">{x}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
