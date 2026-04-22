import { useEffect, useState } from 'react'
import HeroPage from './pages/HeroPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CareerDetailsPage from './pages/CareerDetailsPage.jsx'
import CareerOptionsDetailsPage from './pages/CareerOptionsDetailsPage.jsx'
import PreferencesPage from './pages/PreferencesPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import Navbar from './components/Navbar.jsx'
import axios from 'axios'

export default function App() {
  // view: 'hero' | 'about' | 'login' | 'upload' | 'dashboard' | 'history' | 'career' | 'career-options' | 'preferences'
  const [view, setView] = useState('hero')
  const [history, setHistory] = useState([])
  const [results, setResults] = useState(null)
  const [fileName, setFileName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('resumind_token') || '')
  const [pendingView, setPendingView] = useState('upload')
  const [careerTrack, setCareerTrack] = useState('')

  useEffect(() => {
    // Support opening a career details view in a new tab without a router.
    const params = new URLSearchParams(window.location.search)
    const requestedView = params.get('view')
    const track = params.get('track') || ''
    if (requestedView === 'career') {
      setCareerTrack(track)
      setView('career')
    }
    if (requestedView === 'career-options') {
      setView('career-options')
    }
    if (requestedView === 'preferences') {
      setView('preferences')
    }
  }, [])

  useEffect(() => {
    async function validate() {
      if (!token) return
      try {
        await axios.get('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      } catch {
        localStorage.removeItem('resumind_token')
        setToken('')
      }
    }
    validate()
  }, [token])

  function navigate(nextView) {
    const protectedViews = new Set(['upload', 'dashboard', 'history', 'career', 'career-options', 'preferences'])
    if (!token && protectedViews.has(nextView)) {
      setPendingView(nextView)
      nextView = 'login'
    }

    const resolvedView = nextView === 'dashboard' && !results ? 'upload' : nextView
    if (resolvedView === view) return

    setHistory(prev => [...prev, view])
    setView(resolvedView)
  }

  function goBack() {
    setHistory(prev => {
      if (prev.length === 0) {
        setView('hero')
        return prev
      }
      const next = prev[prev.length - 1]
      setView(next)
      return prev.slice(0, -1)
    })
  }

  function handleAnalyzed(data, name, jobText = '') {
    setResults(data)
    setFileName(name)
    setJobDescription(jobText || '')
    setView('dashboard')
  }

  function handleAuthed(newToken) {
    setToken(newToken)
    setView(pendingView || 'upload')
  }

  function openCareer(trackId) {
    setCareerTrack(trackId)
    navigate('career')
  }

  function logout() {
    localStorage.removeItem('resumind_token')
    setToken('')
    setResults(null)
    setFileName('')
    setJobDescription('')
    setHistory([])
    setView('hero')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onNavigate={navigate}
        showBack={view !== 'hero' && view !== 'login'}
        onBack={goBack}
      />

      {view === 'hero' && (
        <HeroPage onStart={() => navigate('upload')} />
      )}
      {view === 'about' && (
        <AboutPage />
      )}
      {view === 'login' && (
        <LoginPage onAuthed={handleAuthed} />
      )}
      {view === 'upload' && (
        <UploadPage
          onAnalyzed={handleAnalyzed}
          onBack={() => navigate('hero')}
        />
      )}
      {view === 'history' && (
        <HistoryPage onOpen={handleAnalyzed} />
      )}
      {view === 'career' && (
        <CareerDetailsPage trackId={careerTrack} />
      )}
      {view === 'career-options' && (
        <CareerOptionsDetailsPage
          results={results}
          jobDescription={jobDescription}
          onNavigate={navigate}
          onOpenCareer={openCareer}
        />
      )}
      {view === 'preferences' && (
        <PreferencesPage onNavigate={navigate} />
      )}
      {view === 'dashboard' && results && (
        <Dashboard
          results={results}
          fileName={fileName}
          jobDescription={jobDescription}
          onNewAnalysis={() => navigate('upload')}
          onViewHistory={() => navigate('history')}
          onViewCareerOptions={() => navigate('career-options')}
          onViewPreferences={() => navigate('preferences')}
          onLogout={logout}
        />
      )}
    </div>
  )
}
