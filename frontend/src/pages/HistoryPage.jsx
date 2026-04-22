import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api.js'

export default function HistoryPage({ onOpen }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/history')
        if (!alive) return
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!alive) return
        setError(err.response?.data?.detail || 'Could not load history.')
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

  async function openItem(id) {
    try {
      const { data } = await api.get(`/history/${id}`)
      const results = {
        match_score: data.match_score,
        semantic_score: Number.isFinite(data?.semantic_score) ? data.semantic_score : null,
        structured_score: Number.isFinite(data?.structured_score) ? data.structured_score : null,
        matching_skills: data.matching_skills || [],
        missing_skills: data.missing_skills || [],
        resume_skills: data.resume_skills || [],
        resume_meta: data.resume_meta || null,
      }
      onOpen?.(results, data.resume_filename, data.job_description || '')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not open history item.')
    }
  }

  return (
    <div className="flex-1 px-6 py-10 md:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">History</h1>
          <p className="text-slate-100/80 text-sm">Your past resume uploads and analysis results.</p>
        </div>

        <div className="glass rounded-2xl p-6">
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.25)', color: '#fb7185' }}
            >
              ⚠ {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-slate-100/70">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-slate-100/70">No uploads yet. Analyze your first resume to see history here.</div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{item.resume_filename}</div>
                    <div className="text-xs text-slate-100/60 truncate">Job: {item.job_preview || '—'}</div>
                    <div className="text-xs text-slate-100/60">{new Date(item.created_at).toLocaleString()}</div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-xs font-black px-3 py-1.5 rounded-lg" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#67e8f9' }}>
                      {item.match_score}%
                    </div>
                    <button
                      type="button"
                      onClick={() => openItem(item.id)}
                      className="button px-4 py-2 rounded-lg text-white text-xs font-bold"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
