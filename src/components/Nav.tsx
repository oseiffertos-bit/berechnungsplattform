'use client'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function Nav({ userEmail, breadcrumb }: { userEmail: string; breadcrumb?: string }) {
  const supabase = createBrowserSupabaseClient()
  const router = useRouter()
  const pathname = usePathname()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{ background:'#181C26', borderBottom:'1px solid #2A3047', padding:'0 32px', height:56, display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:100 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:15, cursor:'pointer' }} onClick={() => router.push('/dashboard')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.2">
          <rect x="9" y="2" width="6" height="20" rx="1.5"/>
          <path d="M6 7h12M6 17h12"/>
          <circle cx="12" cy="12" r="1.8" fill="#3B82F6"/>
        </svg>
        Berechnungsplattform
      </div>
      {breadcrumb && (
        <div style={{ color:'#6B7A9E', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
          <span>›</span><span>{breadcrumb}</span>
        </div>
      )}
      <div style={{ flex:1 }} />
      {pathname !== '/dashboard' && (
        <button onClick={() => router.push('/dashboard')} style={{ background:'#1F2535', border:'1px solid #2A3047', borderRadius:8, padding:'6px 14px', color:'#E2E8F0', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          ← Dashboard
        </button>
      )}
      <div style={{ fontSize:12, color:'#6B7A9E' }}>{userEmail}</div>
      <button onClick={logout} style={{ background:'transparent', border:'1px solid #2A3047', borderRadius:8, padding:'6px 14px', color:'#6B7A9E', fontSize:12, cursor:'pointer' }}>
        Abmelden
      </button>
    </nav>
  )
}
