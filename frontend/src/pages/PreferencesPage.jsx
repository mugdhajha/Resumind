import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api.js'
import { TRACKS, scoreTrack, uniqueNormalized } from '../lib/tracks.js'

const STORAGE_KEY = 'resumind_preferences_tracks'

function getInitialSelectedTracks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

function saveSelectedTracks(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(ids) ? ids : []))
  } catch {
    // ignore
  }
}

function PreferenceChip({ label }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.25)', color: '#c7d2fe' }}
    >
      {label}
    </span>
  )
}

function ScorePill({ score }) {
  const color = score >= 70 ? '#34d399' : score >= 45 ? '#fbbf24' : '#fb7185'
  const bg = score >= 70 ? 'rgba(16,185,129,.12)' : score >= 45 ? 'rgba(251,191,36,.12)' : 'rgba(244,63,94,.10)'
  const border = score >= 70 ? 'rgba(16,185,129,.25)' : score >= 45 ? 'rgba(251,191,36,.25)' : 'rgba(244,63,94,.22)'

  return (
    <span
      className="text-xs font-black px-3 py-1.5 rounded-lg"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      {score}%
    </span>
  )
}

function workLabel(score, missingCount) {
  if (score >= 70 && missingCount <= 3) return { label: 'Low work', color: '#34d399' }
  if (score >= 45 && missingCount <= 6) return { label: 'Medium work', color: '#fbbf24' }
  return { label: 'High work', color: '#fb7185' }
}

function WorkPill({ score, missingCount }) {
  const w = workLabel(score, missingCount)
  return (
    <span
      className="text-xs font-black px-3 py-1.5 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: w.color }}
    >
      {w.label}
    </span>
  )
}

function Sidebar({ activeNav, onSelectNav, onNavigate }) {
  const navItems = [
    { id: 'setup', icon: '⚙', label: 'Setup', kind: 'scroll', targetId: 'pref-setup' },
    { id: 'matches', icon: '↗', label: 'Resume Matches', kind: 'scroll', targetId: 'pref-matches' },
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
        <p className="text-xs font-bold tracking-widest text-slate-600 px-2 mb-2 uppercase">Preferences</p>
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
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Set roles → get resume ranking</div>
      </div>
    </aside>
  )
}

export default function PreferencesPage({ onNavigate }) {
  const mainRef = useRef(null)
  const [activeNav, setActiveNav] = useState('setup')

  const [selectedTrackIds, setSelectedTrackIds] = useState(() => getInitialSelectedTracks())
  const [historyItems, setHistoryItems] = useState([])
  const [resumeDetails, setResumeDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  useEffect(() => {
    saveSelectedTracks(selectedTrackIds)
  }, [selectedTrackIds])

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/history')
        if (!alive) return
        const items = Array.isArray(data) ? data : []
        setHistoryItems(items)

        // Only fetch details for the most recent N items to keep this snappy.
        const MAX = 20
        const ids = items.slice(0, MAX).map(x => x.id)

        const details = await Promise.all(
          ids.map(async id => {
            try {
              const r = await api.get(`/history/${id}`)
              return r.data
            } catch {
              return null
            }
          })
        )

        if (!alive) return
        setResumeDetails(details.filter(Boolean))
      } catch (err) {
        if (!alive) return
        setError(err.response?.data?.detail || 'Could not load preferences data.')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  const selectedTracks = useMemo(() => {
    const set = new Set(selectedTrackIds)
    return TRACKS.filter(t => set.has(t.id))
  }, [selectedTrackIds])

  const mostSuitablePreference = useMemo(() => {
    if (selectedTracks.length === 0) return null
    if (!Array.isArray(resumeDetails) || resumeDetails.length === 0) return null

    const bestByTrack = selectedTracks.map(t => {
      let best = { score: 0, resume: null, matched: [] }
      for (const r of resumeDetails) {
        const normalized = uniqueNormalized(r.resume_skills || r.matching_skills || [])
        const s = scoreTrack(t, normalized)
        if (s.score > best.score) best = { score: s.score, resume: r, matched: s.matched }
      }
      return { track: t, bestScore: best.score, bestResume: best.resume, matched: best.matched }
    })

    bestByTrack.sort((a, b) => b.bestScore - a.bestScore)
    return bestByTrack[0] || null
  }, [resumeDetails, selectedTracks])

  const rankedResumes = useMemo(() => {
    if (selectedTracks.length === 0) return []
    if (!Array.isArray(resumeDetails) || resumeDetails.length === 0) return []

    return resumeDetails
      .map(r => {
        const normalized = uniqueNormalized(r.resume_skills || r.matching_skills || [])

        let best = { track: null, score: 0, matched: [] }
        for (const t of selectedTracks) {
          const s = scoreTrack(t, normalized)
          if (s.score > best.score) best = { track: t, score: s.score, matched: s.matched }
        }

        const missing = best.track
          ? best.track.keywords
              .filter(k => !best.matched.includes(k))
              .slice(0, 6)
          : []

        return {
          id: r.id,
          resume_filename: r.resume_filename,
          created_at: r.created_at,
          pref_score: best.score,
          pref_track: best.track,
          matched_keywords: best.matched.slice(0, 6),
          missing_keywords: missing,
        }
      })
      .sort((a, b) => b.pref_score - a.pref_score)
  }, [resumeDetails, selectedTracks])

  const bestMatch = rankedResumes.length > 0 ? rankedResumes[0] : null
  const needsWork = rankedResumes.length > 1 ? rankedResumes[rankedResumes.length - 1] : null

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  })

  function toggleTrack(id) {
    setSelectedTrackIds(prev => {
      const set = new Set(prev)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return Array.from(set)
    })
  }

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar activeNav={activeNav} onSelectNav={handleSelectNav} onNavigate={onNavigate} />

      <main ref={mainRef} className="flex-1 overflow-y-auto px-7 py-7" style={{ background: 'transparent' }}>
        <motion.div {...fadeUp(0)} className="mb-6">
          <h1 className="text-xl font-bold text-white mb-1">Preferences</h1>
          <p className="text-xs text-slate-500">Select your target job roles, then we’ll tell you what fits best and how much work is left to land that role.</p>
        </motion.div>

        {error && (
          <motion.div
            {...fadeUp(0.05)}
            className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.25)', color: '#fb7185' }}
          >
            ⚠ {error}
          </motion.div>
        )}

        <section id="pref-setup" className="scroll-mt-6">
          <motion.div {...fadeUp(0.1)} className="glass rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-sm font-bold text-white">1) Set up your preferences (job roles)</div>
                <div className="text-xs text-slate-100/60">Choose one or more roles you’re aiming for.</div>
              </div>
              <div className="hidden md:flex flex-wrap justify-end gap-2">
                {selectedTracks.map(t => (
                  <PreferenceChip key={t.id} label={t.title} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRACKS.map(track => {
                const checked = selectedTrackIds.includes(track.id)
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => toggleTrack(track.id)}
                    className="w-full text-left rounded-2xl p-4 transition-all duration-150"
                    style={{
                      background: checked ? 'rgba(99,102,241,.12)' : 'rgba(255,255,255,0.03)',
                      border: checked ? '1px solid rgba(99,102,241,.35)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-extrabold text-white">{track.title}</div>
                        <div className="text-xs text-slate-100/60">{track.subtitle}</div>
                      </div>
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
                        style={{
                          background: checked ? 'rgba(99,102,241,.20)' : 'rgba(255,255,255,0.04)',
                          border: checked ? '1px solid rgba(99,102,241,.35)' : '1px solid rgba(255,255,255,0.08)',
                          color: checked ? '#c7d2fe' : 'rgba(226,232,240,0.65)',
                        }}
                      >
                        {checked ? '✓' : '+'}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {track.jobs.slice(0, 3).map(x => (
                        <span
                          key={x}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(226,232,240,0.78)' }}
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </section>

        <section id="pref-matches" className="scroll-mt-6">
          <motion.div {...fadeUp(0.2)} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-sm font-bold text-white">2) Your resume matches</div>
                <div className="text-xs text-slate-100/60">We compare each uploaded resume to your preferred roles.</div>
              </div>
              <div className="text-xs text-slate-100/60">
                {loading ? 'Loading…' : `${historyItems.length} uploads`}
              </div>
            </div>

            {loading ? (
              <div className="text-sm text-slate-100/70">Loading…</div>
            ) : historyItems.length === 0 ? (
              <div className="text-sm text-slate-100/70">No uploads yet. Analyze a resume first, then come back here.</div>
            ) : selectedTracks.length === 0 ? (
              <div className="text-sm text-slate-100/70">Pick at least one job role in Setup to see your best-fitting resume.</div>
            ) : rankedResumes.length === 0 ? (
              <div className="text-sm text-slate-100/70">Could not load enough details to rank your resumes.</div>
            ) : (
              <>
                {mostSuitablePreference?.track && (
                  <div
                    className="rounded-2xl p-5 mb-4"
                    style={{ background: 'rgba(99,102,241,.10)', border: '1px solid rgba(99,102,241,.22)' }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-sm font-extrabold text-white">Most suitable preference</div>
                      <ScorePill score={mostSuitablePreference.bestScore} />
                    </div>
                    <div className="text-sm text-slate-100/80">
                      Role: <span className="text-white font-bold">{mostSuitablePreference.track.title}</span>
                    </div>
                    <div className="text-xs text-slate-100/60 mt-1">
                      Best matching resume: {mostSuitablePreference.bestResume?.resume_filename || '—'}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                  {bestMatch && (
                    <div
                      className="rounded-2xl p-5"
                      style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.22)' }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="text-sm font-extrabold" style={{ color: '#34d399' }}>Most suitable match</div>
                        <div className="flex items-center gap-2">
                          <ScorePill score={bestMatch.pref_score} />
                          <WorkPill score={bestMatch.pref_score} missingCount={bestMatch.missing_keywords.length} />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white truncate">{bestMatch.resume_filename}</div>
                      <div className="text-xs text-slate-100/60 mb-3">Best role: {bestMatch.pref_track?.title || '—'}</div>

                      {bestMatch.matched_keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {bestMatch.matched_keywords.map(k => (
                            <span
                              key={k}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(16,185,129,.10)', border: '1px solid rgba(16,185,129,.20)', color: '#a7f3d0' }}
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {needsWork && (
                    <div
                      className="rounded-2xl p-5"
                      style={{ background: 'rgba(244,63,94,.07)', border: '1px solid rgba(244,63,94,.20)' }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="text-sm font-extrabold" style={{ color: '#fb7185' }}>Worth giving more time</div>
                        <div className="flex items-center gap-2">
                          <ScorePill score={needsWork.pref_score} />
                          <WorkPill score={needsWork.pref_score} missingCount={needsWork.missing_keywords.length} />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white truncate">{needsWork.resume_filename}</div>
                      <div className="text-xs text-slate-100/60 mb-3">Closest role: {needsWork.pref_track?.title || '—'}</div>

                      {needsWork.missing_keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {needsWork.missing_keywords.map(k => (
                            <span
                              key={k}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: 'rgba(244,63,94,.09)', border: '1px solid rgba(244,63,94,.18)', color: '#fecdd3' }}
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-100/70">Upload more resumes to compare.</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {rankedResumes.map(r => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{r.resume_filename}</div>
                        <div className="text-xs text-slate-100/60">Role: {r.pref_track?.title || '—'}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <ScorePill score={r.pref_score} />
                        <WorkPill score={r.pref_score} missingCount={r.missing_keywords.length} />
                      </div>
                    </div>
                  ))}
                </div>

                {historyItems.length > resumeDetails.length && (
                  <div className="mt-4 text-xs text-slate-100/60">
                    Note: showing ranking for your most recent {resumeDetails.length} uploads.
                  </div>
                )}
              </>
            )}
          </motion.div>
        </section>
      </main>
    </div>
  )
}
