import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function LoginPage({ onAuthed }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [mode])

  async function submit(e) {
    e.preventDefault()
    if (loading) return

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const { data } = await axios.post(url, { email: cleanEmail, password })
      const token = data?.access_token
      if (!token) throw new Error('Missing token')
      localStorage.setItem('resumind_token', token)
      onAuthed?.(token)
    } catch (err) {
      const detail = err.response?.data?.detail
      const fallback = err.message === 'Network Error'
        ? 'Network error: backend not reachable (is it running on port 8000?)'
        : err.message || 'Could not sign in. Please try again.'

      const msg =
        (typeof detail === 'string' && detail.trim())
          ? detail
          : fallback

      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 px-6 py-10 md:px-16 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="glass rounded-2xl p-7">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-white">{mode === 'register' ? 'Create your account' : 'Log in'}</h1>
            <p className="text-sm text-slate-100/70 mt-1">
              {mode === 'register'
                ? 'Create an account to save your upload history.'
                : 'Log in to see your upload history.'}
            </p>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(244,63,94,.1)', border: '1px solid rgba(244,63,94,.25)', color: '#fb7185' }}
            >
              ⚠ {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--a2)' }}>
                Email
              </label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,0.10)' }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--a3)' }}>
                Password
              </label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,0.10)' }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="button w-full py-3 rounded-xl text-white font-bold text-base"
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Please wait…' : mode === 'register' ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-100/70">
            {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
              className="font-bold text-white hover:underline"
            >
              {mode === 'register' ? 'Log in' : 'Create one'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
