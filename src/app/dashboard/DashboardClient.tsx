'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient, type Project } from '@/lib/supabase'
import Nav from '@/components/Nav'

const C = { bg:'#0F1117', surface:'#181C26', surfaceHigh:'#1F2535', border:'#2A3047', accent:'#3B82F6', accentDim:'#1E3A5F', accentText:'#60A5FA', text:'#E2E8F0', textMuted:'#6B7A9E', textDim:'#94A3B8', success:'#22C55E', successDim:'#14532D', danger:'#EF4444' }
const fmt = (v: number) => v.toFixed(2)

function StatusTag({ status }: { status: string }) {
  const m: Record<string, { bg: string; color: string }> = {
    'Entwurf':        { bg:'#1E293B', color:C.textDim },
    'In Bearbeitung': { bg:C.accentDim, color:C.accentText },
    'Abgeschlossen':  { bg:C.successDim, color:C.success },
  }
  const st = m[status] ?? m['Entwurf']
  return <span style={{ display:'inline-flex', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:st.bg, color:st.color }}>{status}</span>
}

const LAGER_LABEL: Record<string, string> = { freistehend:'Freistehend', deckenanbindung:'Decke', wandanbindung:'1 Wand', '2wandanbindungen':'2 Wände' }

export default function DashboardClient({ initialProjects, userEmail }: { initialProjects: Project[]; userEmail: string }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const supabase = createBrowserSupabaseClient()
  const router = useRouter()

  const deleteProject = async (id: string) => {
    if (!confirm('Projekt wirklich löschen?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(p => p.filter(x => x.id !== id))
  }

  const stats = {
    total:         projects.length,
    stationaer:    projects.filter(p => p.type === 'Stationäre Hubsäule').length,
    mobile:        projects.filter(p => p.type === 'Mobile Hubsäule').length,
    abgeschlossen: projects.filter(p => p.status === 'Abgeschlossen').length,
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", fontSize:14 }}>
      <Nav userEmail={userEmail} />
      <div style={{ padding:'32px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em' }}>Berechnungsplattform</h1>
          <p style={{ color:C.textMuted, marginTop:4 }}>Statische Berechnungen für Hubsäulen und Hebeeinrichtungen</p>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {[
            { l:'Projekte gesamt', v:stats.total, c:C.text },
            { l:'Stationäre Hubsäulen', v:stats.stationaer, c:'#A78BFA' },
            { l:'Mobile Hubsäulen', v:stats.mobile, c:'#86EFAC' },
            { l:'Abgeschlossen', v:stats.abgeschlossen, c:C.success },
          ].map(s => (
            <div key={s.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:16 }}>
              <div style={{ fontSize:28, fontWeight:700, color:s.c, letterSpacing:'-0.02em' }}>{s.v}</div>
              <div style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tools */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:24 }}>
          <div style={{ fontSize:13, fontWeight:600, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:C.textMuted, marginBottom:12 }}>Berechnungstools</div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' as const }}>
            <button onClick={() => router.push('/berechnung/stationaer/neu')}
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 20px', borderRadius:10, border:'1px solid #4C1D95', background:'#1E1B4B', color:'#A78BFA', fontWeight:600, fontSize:14, cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="20" rx="1"/><path d="M6 6h12M6 18h12"/><circle cx="12" cy="12" r="2"/></svg>
              Stationäre Hubsäule — neue Berechnung
            </button>
            <button disabled style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 20px', borderRadius:10, border:`1px solid ${C.border}`, background:C.surfaceHigh, color:C.textMuted, fontWeight:600, fontSize:14, cursor:'not-allowed', opacity:0.45 }}>
              Mobile Hubsäule — folgt demnächst
            </button>
          </div>
        </div>

        {/* Projects table */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:C.textMuted }}>Letzte Projekte</div>
            <span style={{ fontSize:12, color:C.textMuted }}>{projects.length} Gesamt</span>
          </div>
          {projects.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:C.textMuted }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📐</div>
              <div>Noch keine Projekte. Starte eine neue Berechnung.</div>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' as const }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                  {['Projektname','Typ','Status','Lagerung','Erstellt','M_Ed',''].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'8px 10px', fontSize:11, fontWeight:600, color:C.textMuted, textTransform:'uppercase' as const, letterSpacing:'0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.slice(0,10).map(p => {
                  const res = p.result_data as Record<string,number> | null
                  const fd  = p.form_data  as Record<string,string>  | null
                  return (
                    <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}20` }}>
                      <td style={{ padding:'11px 10px' }}>
                        <span style={{ color:C.accentText, cursor:'pointer', fontWeight:500 }} onClick={() => router.push(`/berechnung/stationaer/${p.id}`)}>{p.name}</span>
                      </td>
                      <td style={{ padding:'11px 10px', fontSize:12, color:'#A78BFA' }}>{p.type}</td>
                      <td style={{ padding:'11px 10px' }}><StatusTag status={p.status} /></td>
                      <td style={{ padding:'11px 10px', fontSize:12, color:C.textDim }}>{fd ? (LAGER_LABEL[fd.lagerung] ?? '–') : '–'}</td>
                      <td style={{ padding:'11px 10px', color:C.textMuted, fontSize:12 }}>{new Date(p.created_at).toLocaleDateString('de-DE')}</td>
                      <td style={{ padding:'11px 10px', color:C.textDim, fontSize:13 }}>{res?.M_total != null ? `${fmt(res.M_total)} kNm` : '–'}</td>
                      <td style={{ padding:'11px 10px' }}>
                        <button onClick={() => deleteProject(p.id)} style={{ background:'transparent', border:'none', color:C.danger, cursor:'pointer', fontSize:14 }}>✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
