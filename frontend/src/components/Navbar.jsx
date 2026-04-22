import { useState } from 'react'

export default function Navbar({ onNavigate, showBack = false, onBack }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { label: 'Home', view: 'hero' },
    { label: 'About', view: 'about' },
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'History', view: 'history' },
  ]

  function handleNav(view) {
    setMobileOpen(false)
    onNavigate?.(view)
  }

  return (
    <nav className="relative z-20 border-b border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 md:px-10 py-5">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="button button--icon"
          >
            <span aria-hidden="true">←</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => handleNav('hero')}
          className="flex items-center"
        >
          <span
            className="font-black italic tracking-widest text-lg text-white"
            style={{ fontFamily: 'Orbitron, Inter, system-ui, sans-serif' }}
          >
            RESUMIND
          </span>
        </button>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {navItems.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleNav(item.view)}
            className="text-sm text-slate-200/70 hover:text-white transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile hamburger */}
      <label className="hamburger md:hidden text-slate-100/90" aria-label="Toggle menu">
        <input
          type="checkbox"
          checked={mobileOpen}
          onChange={(e) => setMobileOpen(e.target.checked)}
        />
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path className="line line-top-bottom" d="M4 8H28" />
          <path className="line" d="M4 16H28" />
          <path className="line line-top-bottom" d="M4 24H28" />
        </svg>
      </label>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="glass rounded-2xl p-4">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNav(item.view)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ color: 'rgba(226,232,240,0.92)', background: 'rgba(255,255,255,0.03)' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
