import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api.js'

const STEP_LABELS = ['Upload Resume', 'Job Description', 'Analyze']

function StepBar({ step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center gap-0">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={
                i < step
                  ? { background: '#10b981', color: '#fff' }
                  : i === step
                  ? { background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', boxShadow: '0 0 14px rgba(99,102,241,0.5)' }
                  : { border: '1.5px solid rgba(99,102,241,0.3)', color: '#64748b' }
              }
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span
              className="text-xs font-semibold transition-colors duration-300"
              style={{ color: i <= step ? (i < step ? '#34d399' : '#e2e8f0') : '#64748b' }}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className="w-12 h-px mx-3" style={{ background: 'rgba(99,102,241,0.18)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function UploadPage({ onAnalyzed, onBack }) {
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadStep, setLoadStep] = useState(0)
  const fileInput = useRef(null)

  const step = file ? (jd.trim().length > 50 ? 2 : 1) : 0
  const canAnalyze = file && jd.trim().length > 50 && !loading

  function handleFile(f) {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.')
      return
    }
    setError('')
    setFile(f)
  }

  async function handleAnalyze() {
    if (!canAnalyze) return
    setLoading(true)
    setError('')

    // Animate loading steps
    const steps = [0, 1, 2, 3]
    steps.forEach(s => setTimeout(() => setLoadStep(s), s * 800))

    const formData = new FormData()
    formData.append('file', file)
    formData.append('job_description', jd.trim())

    try {
      const { data } = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      onAnalyzed(data, file.name, jd.trim())
    } catch (err) {
      const msg = err.response?.data?.detail || 'Analysis failed. Please try again.'
      setError(msg)
      setLoading(false)
      setLoadStep(0)
    }
  }

  if (loading) {
    const loadLabels = [
      'Extracting text from PDF…',
      'Identifying skills & keywords…',
      'Computing semantic similarity…',
      'Generating career insights…',
    ]
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-8"
        style={{ background: 'transparent' }}
      >
        <div className="text-xl font-bold text-white">Analyzing your resume…</div>

        <div className="flex flex-col gap-2.5 items-center">
          {loadLabels.map((label, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs font-mono transition-all duration-400"
              style={{ opacity: i <= loadStep ? 1 : 0, color: i <= loadStep ? '#06b6d4' : '#64748b' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'currentColor' }} />
              {label}
            </div>
          ))}
        </div>

      </div>
    )
  }

  return (
    <div
      className="flex-1 px-6 py-10 md:px-16"
      style={{
        background: 'transparent',
      }}
    >
      <StepBar step={step} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-3xl font-extrabold mb-2"
          style={{ background: 'linear-gradient(135deg, #fff 40%, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Upload your resume
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          We'll match your skills against the job description using AI embeddings &amp; cosine similarity.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* PDF Upload */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#06b6d4' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
              Resume PDF
            </div>

            {/* Drop zone */}
            <div
              className="rounded-xl p-7 text-center cursor-pointer transition-all duration-200"
              style={{
                border: `1.5px dashed ${dragOver ? '#6366f1' : file ? '#10b981' : 'rgba(99,102,241,.4)'}`,
                background: dragOver ? 'rgba(99,102,241,.06)' : file ? 'rgba(16,185,129,.06)' : 'transparent',
              }}
              onClick={() => fileInput.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.2), rgba(6,182,212,.2))' }}
              >
                📄
              </div>
              <p className="text-sm font-semibold text-slate-200 mb-1">
                {file ? file.name : 'Drop your resume here'}
              </p>
              <p className="text-xs text-slate-500 mb-3">PDF format · Max 10MB</p>
              {!file && (
                <span
                  className="inline-block px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                >
                  Browse Files
                </span>
              )}
              {file && (
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-xs text-emerald-400 font-semibold">✓ {(file.size / 1024).toFixed(1)} KB</span>
                  <button
                    className="button px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <input ref={fileInput} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </div>

          {/* Job Description */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-widest uppercase" style={{ color: '#a855f7' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
              Job Description
            </div>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value.slice(0, 3000))}
              placeholder={'Paste the full job description here...\n\ne.g. We are looking for a Senior Data Scientist with Python, machine learning, SQL, Docker...'}
              className="w-full rounded-xl p-4 text-sm font-sans text-slate-200 resize-none focus:outline-none transition-all duration-200"
              rows={9}
              style={{
                background: 'rgba(255,255,255,.03)',
                border: `1px solid ${jd.length > 50 ? 'rgba(99,102,241,.4)' : 'rgba(99,102,241,.18)'}`,
                lineHeight: 1.65,
                color: '#e2e8f0',
              }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">Paste the full JD for best results</span>
              <span className="text-xs font-mono" style={{ color: jd.length > 2800 ? '#f43f5e' : '#64748b' }}>
                {jd.length} / 3000
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.25)', color: '#fb7185' }}
          >
            ⚠ {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="button w-full py-4 rounded-xl text-white font-bold text-base"
          style={{ opacity: canAnalyze ? 1 : 0.35 }}
        >
          ✦ Analyze My Resume Against This Role
        </button>
      </motion.div>
    </div>
  )
}
