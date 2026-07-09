'use client'
import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createBrowserSupabaseClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')

  const handle = async () => {
    setLoading(true); setError(''); setInfo('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setInfo('Bestätigungsmail gesendet. Bitte E-Mail prüfen.')
    }
    setLoading(false)
  }

  const S = {
    page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0F1117' } as React.CSSProperties,
    card: { background:'#181C26', border:'1px solid #2A3047', borderRadius:14, padding:40, width:380 } as React.CSSProperties,
    h1: { fontSize:20, fontWeight:700, marginBottom:4, color:'#E2E8F0' } as React.CSSProperties,
    sub: { fontSize:13, color:'#6B7A9E', marginBottom:28 } as React.CSSProperties,
    label: { fontSize:12, fontWeight:500, color:'#94A3B8', marginBottom:6, display:'block' } as React.CSSProperties,
    input: { background:'#1F2535', border:'1px solid #2A3047', borderRadius:8, padding:'10px 12px', color:'#E2E8F0', fontSize:14, width:'100%', outline:'none', marginBottom:16, boxSizing:'border-box' } as React.CSSProperties,
    btn: { width:'100%', background:'#3B82F6', color:'#fff', border:'none', borderRadius:8, padding:'11px 0', fontWeight:600, fontSize:14, cursor:'pointer', marginTop:4 } as React.CSSProperties,
    error: { background:'#450A0A', border:'1px solid #EF4444', color:'#EF4444', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 } as React.CSSProperties,
    info: { background:'#14532D', border:'1px solid #22C55E', color:'#22C55E', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 } as React.CSSProperties,
    toggle: { textAlign:'center' as const, marginTop:20, fontSize:13, color:'#6B7A9E' },
    link: { color:'#60A5FA', cursor:'pointer' } as React.CSSProperties,
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.2">
            <rect x="9" y="2" width="6" height="20" rx="1.5"/>
            <path d="M6 7h12M6 17h12"/>
            <circle cx="12" cy="12" r="1.8" fill="#3B82F6"/>
          </svg>
          <span style={{ fontWeight:700, fontSize:16, color:'#E2E8F0' }}>Berechnungsplattform</span>
        </div>
        <div style={S.h1}>{mode === 'login' ? 'Anmelden' : 'Registrieren'}</div>
        <div style={S.sub}>Statische Berechnungen für Hubsäulen</div>
        {error && <div style={S.error}>{error}</div>}
        {info  && <div style={S.info}>{info}</div>}
        <label style={S.label}>E-Mail</label>
        <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@firma.de" />
        <label style={S.label}>Passwort</label>
        <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handle()} />
        <button style={S.btn} onClick={handle} disabled={loading}>
          {loading ? 'Bitte warten…' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
        </button>
        <div style={S.toggle}>
          {mode === 'login'
            ? <>Noch kein Konto? <span style={S.link} onClick={() => setMode('register')}>Registrieren</span></>
            : <>Bereits registriert? <span style={S.link} onClick={() => setMode('login')}>Anmelden</span></>}
        </div>
      </div>
    </div>
  )
}
