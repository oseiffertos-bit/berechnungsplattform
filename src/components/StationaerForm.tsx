'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { calcStationaer, type StationaerForm as FormType } from '@/lib/calculations'
import Nav from './Nav'

const C = { bg:'#0F1117', surface:'#181C26', surfaceHigh:'#1F2535', border:'#2A3047', accent:'#3B82F6', accentDim:'#1E3A5F', accentText:'#60A5FA', text:'#E2E8F0', textMuted:'#6B7A9E', textDim:'#94A3B8', success:'#22C55E', warning:'#F59E0B', danger:'#EF4444' }

const S = {
  card: { background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:24 } as React.CSSProperties,
  h3:  { fontSize:13, fontWeight:600 as const, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:C.textMuted, marginBottom:12 },
  label: { fontSize:12, fontWeight:500 as const, color:C.textDim, marginBottom:6, display:'block' } as React.CSSProperties,
  hint:  { fontSize:11, color:C.textMuted, marginBottom:6 } as React.CSSProperties,
  input: { background:C.surfaceHigh, border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', color:C.text, fontSize:14, width:'100%', outline:'none', boxSizing:'border-box' as const },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 } as React.CSSProperties,
  divider: { border:'none', borderTop:`1px solid ${C.border}`, margin:'16px 0' } as React.CSSProperties,
  row: { display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.border}20` } as React.CSSProperties,
}

const DEFAULTS: FormType = {
  name:'', status:'Entwurf', lagerung:'freistehend',
  saeuleHoehe:'', saeuleGewicht:'',
  hAnbindung:'', hAnbindung2:'',
  hubkorbGewicht:'', ausladung:'', hubhoehe:'',
  nutzlast:'', nutzlastAusladung:'',
  gammaSt:'1.35', gammaQ:'1.50',
}

export default function StationaerForm({ userEmail, userId, projectId, initialData }: {
  userEmail: string; userId: string; projectId: string | null; initialData: Record<string,string> | null
}) {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [form, setForm] = useState<FormType>(initialData ? { ...DEFAULTS, ...initialData } as FormType : DEFAULTS)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (k: keyof FormType, v: string) => setForm(f => ({ ...f, [k]: v }))
  const result = useMemo(() => calcStationaer(form), [form])
  const fmt = (v: number) => v.toFixed(2)

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      user_id: userId,
      name: form.name || 'Unbenannt',
      type: 'Stationäre Hubsäule',
      status: form.status,
      form_data: form as unknown as Record<string,unknown>,
      result_data: result as unknown as Record<string,unknown> | null,
    }
    if (projectId) {
      await supabase.from('projects').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', projectId)
    } else {
      const { data } = await supabase.from('projects').insert(payload).select('id').single()
      if (data?.id) router.push(`/berechnung/stationaer/${data.id}`)
    }
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const inp = (label: string, key: keyof FormType, unit = '', placeholder = '0.00', hint = '') => (
    <div>
      <label style={S.label}>{label}{unit && <span style={{ color:C.textMuted, marginLeft:4 }}>[{unit}]</span>}</label>
      {hint && <div style={S.hint}>{hint}</div>}
      <input type="number" step="any" placeholder={placeholder} value={form[key] as string}
        onChange={e => set(key, e.target.value)} style={S.input} />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Inter','Segoe UI',system-ui,sans-serif", fontSize:14 }}>
      <Nav userEmail={userEmail} breadcrumb="Stationäre Hubsäule" />
      <div style={{ padding:'32px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em' }}>Statikberechnung — Stationäre Hubsäule</h1>
          <p style={{ color:C.textMuted, fontSize:13, marginTop:4 }}>Schnittgrößen und Auflagerkräfte · EN 1990</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 390px', gap:24, alignItems:'start' }}>
          {/* LEFT */}
          <div>
            <div style={S.card}>
              <div style={S.h3}>Projektinformationen</div>
              <div style={S.grid2}>
                <div><label style={S.label}>Projektname</label><input style={S.input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Projektbezeichnung" /></div>
                <div><label style={S.label}>Status</label>
                  <select style={{ ...S.input, cursor:'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
                    <option>Entwurf</option><option>In Bearbeitung</option><option>Abgeschlossen</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.h3}>Säule — Geometrie & Eigengewicht</div>
              <div style={S.grid2}>
                {inp('Gesamthöhe der Säule','saeuleHoehe','m','0.00','Fußpunkt bis Oberkante')}
                {inp('Eigengewicht Säule','saeuleGewicht','kN','0.00','Inkl. Führungen und Antrieb')}
              </div>
            </div>

            <div style={S.card}>
              <div style={S.h3}>Lagerungsart</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' as const, marginBottom:16 }}>
                {([
                  { v:'freistehend',      l:'Freistehend' },
                  { v:'deckenanbindung',  l:'Deckenanbindung' },
                  { v:'wandanbindung',    l:'1 Wandanbindung' },
                  { v:'2wandanbindungen', l:'2 Wandanbindungen' },
                ] as const).map(o => (
                  <label key={o.v} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13, padding:'8px 14px', borderRadius:8, border:`1px solid ${form.lagerung === o.v ? C.accent : C.border}`, background: form.lagerung === o.v ? C.accentDim : C.surfaceHigh, color: form.lagerung === o.v ? C.accentText : C.textDim }}>
                    <input type="radio" name="lagerung" value={o.v} checked={form.lagerung === o.v} onChange={() => set('lagerung', o.v)} style={{ accentColor:C.accent }} />
                    {o.l}
                  </label>
                ))}
              </div>
              {form.lagerung === 'freistehend' && (
                <div style={{ fontSize:12, color:C.textMuted, background:C.surfaceHigh, borderRadius:8, padding:'10px 14px' }}>
                  Kragarm-Einspannung am Fuß. Das gesamte Kippmoment wird im Fußpunkt aufgenommen.
                </div>
              )}
              {(form.lagerung === 'deckenanbindung' || form.lagerung === 'wandanbindung') && (
                <div style={S.grid2}>{inp('Höhe Anbindungspunkt','hAnbindung','m','0.00','Abstand Fußpunkt bis Lager')}</div>
              )}
              {form.lagerung === '2wandanbindungen' && (
                <>
                  <div style={{ fontSize:12, color:C.textMuted, background:C.surfaceHigh, borderRadius:8, padding:'10px 14px', marginBottom:14 }}>
                    Das Kippmoment wird als Kräftepaar über den Lagerabstand aufgeteilt. Unteres Lager: Zug, oberes Lager: Druck in die Wand.
                  </div>
                  <div style={S.grid2}>
                    {inp('Höhe 1. Wandanbindung (unteres Lager)','hAnbindung','m','0.00','z. B. 1. Etage')}
                    {inp('Höhe 2. Wandanbindung (oberes Lager)','hAnbindung2','m','0.00','z. B. 2. Etage / Decke')}
                  </div>
                </>
              )}
            </div>

            <div style={S.card}>
              <div style={S.h3}>Lastträger — Hubkorb</div>
              <div style={S.grid2}>
                {inp('Eigengewicht Hubkorb','hubkorbGewicht','kN','0.00','Gewicht des leeren Hubkorbs')}
                {inp('Ausladung Schwerpunkt Hubkorb','ausladung','m','0.00','Horizontalabstand SP–Säulenachse')}
                {inp('Maximale Hubhöhe (ungünstigste Pos.)','hubhoehe','m','0.00','I.d.R. = Säulenhöhe')}
              </div>
            </div>

            <div style={S.card}>
              <div style={S.h3}>Nutzlast</div>
              <div style={S.grid2}>
                {inp('Nutzlast','nutzlast','kN','0.00','Maximale Betriebslast im Hubkorb')}
                {inp('Ausladung Schwerpunkt Nutzlast','nutzlastAusladung','m','0.00','Horizontalabstand SP Nutzlast–Achse')}
              </div>
            </div>

            <div style={S.card}>
              <div style={S.h3}>Teilsicherheitsbeiwerte (EN 1990)</div>
              <div style={S.grid2}>
                {inp('γ_G — Ständige Lasten','gammaSt','–','1.35')}
                {inp('γ_Q — Veränderliche Lasten','gammaQ','–','1.50')}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ position:'sticky' as const, top:72 }}>
            <div style={S.card}>
              <div style={S.h3}>Berechnungsergebnisse</div>
              {!result ? (
                <div style={{ color:C.textMuted, textAlign:'center' as const, padding:'24px 0', fontSize:13 }}>Bitte Säulenhöhe und Eigengewicht eingeben.</div>
              ) : (
                <>
                  <div style={{ background:C.accentDim, border:`1px solid ${C.accent}`, borderRadius:10, padding:20, marginBottom:16 }}>
                    <div style={{ fontSize:12, color:C.textDim, marginBottom:4 }}>Bemessungsmoment Fußpunkt M_Ed</div>
                    <div style={{ fontSize:28, fontWeight:700, color:C.accentText, letterSpacing:'-0.02em' }}>{fmt(result.M_Ed_fuss)} <span style={{ fontSize:16 }}>kNm</span></div>
                  </div>

                  <hr style={S.divider} />
                  <div style={{ fontSize:11, fontWeight:600, color:C.textMuted, textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:8 }}>Normalkräfte</div>
                  {[
                    { l:'N Säule (char.)', v:result.N_s },
                    { l:'N Hubkorb (char.)', v:result.N_k },
                    { l:'N Nutzlast (char.)', v:result.N_q },
                    { l:'N_Ed gesamt', v:result.N_Ed, bold:true },
                  ].map(r => (
                    <div key={r.l} style={{ ...S.row, fontWeight:r.bold?700:400, fontSize:r.bold?14:13, color:r.bold?C.text:C.textDim }}>
                      <span>{r.l}</span><span>{fmt(r.v)} kN</span>
                    </div>
                  ))}

                  <hr style={S.divider} />
                  <div style={{ fontSize:11, fontWeight:600, color:C.textMuted, textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:8 }}>Kippmomente</div>
                  {[
                    { l:'M Hubkorb (char.)', v:result.M_k_char },
                    { l:'M Nutzlast (char.)', v:result.M_q_char },
                    { l:'M gesamt (char.)', v:result.M_char, bold:true },
                    { l:'M_Ed (Bemessung)', v:result.M_Ed_fuss, bold:true, accent:true },
                  ].map(r => (
                    <div key={r.l} style={{ ...S.row, fontWeight:r.bold?700:400, fontSize:r.bold?14:13, color:(r as {accent?:boolean}).accent?C.accentText:r.bold?C.text:C.textDim }}>
                      <span>{r.l}</span><span>{fmt(r.v)} kNm</span>
                    </div>
                  ))}

                  {(result.R_anb1_H > 0 || result.R_anb2_H > 0) && (
                    <>
                      <hr style={S.divider} />
                      <div style={{ fontSize:11, fontWeight:600, color:C.textMuted, textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:8 }}>Auflagerkräfte</div>
                      {result.R_anb1_H > 0 && (
                        <div style={{ ...S.row, fontSize:13, color:C.textDim }}>
                          <span>H_anb1{form.lagerung === '2wandanbindungen' ? ' (Zug)' : ''}</span>
                          <span style={{ color:'#F97316', fontWeight:600 }}>{fmt(result.R_anb1_H)} kN</span>
                        </div>
                      )}
                      {result.R_anb2_H > 0 && (
                        <div style={{ ...S.row, fontSize:13, color:C.textDim }}>
                          <span>H_anb2 (Druck)</span>
                          <span style={{ color:'#F97316', fontWeight:600 }}>{fmt(result.R_anb2_H)} kN</span>
                        </div>
                      )}
                    </>
                  )}

                  <hr style={S.divider} />
                  <div style={{ ...S.row, fontSize:13, color:C.textDim }}><span>Querkraft V_Ed (Fuß)</span><span>{fmt(result.V_Ed)} kN</span></div>

                  {result.lagerInfo && (
                    <div style={{ background:'#1A2500', border:`1px solid ${C.success}`, borderRadius:8, padding:'10px 14px', color:C.success, fontSize:12, marginTop:12, display:'flex', gap:8 }}>
                      <span>✓</span><span>{result.lagerInfo}</span>
                    </div>
                  )}
                  <div style={{ background:'#2D1A00', border:`1px solid ${C.warning}`, borderRadius:8, padding:'10px 14px', color:C.warning, fontSize:12, marginTop:10, display:'flex', gap:8 }}>
                    <span>ℹ</span><span>Vereinfachtes Stabmodell. Querschnittstragfähigkeit und Stabilitätsnachweise separat führen.</span>
                  </div>
                </>
              )}
              <hr style={S.divider} />
              <button onClick={handleSave} disabled={saving}
                style={{ width:'100%', background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'11px 0', fontWeight:600, fontSize:14, cursor:'pointer' }}>
                {saving ? 'Speichert…' : saved ? '✓ Gespeichert' : 'Projekt speichern'}
              </button>
            </div>

            {/* Systemskizze */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.textMuted, textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:10 }}>Systemskizze</div>
              <svg viewBox="0 0 200 290" style={{ width:'100%', height:'auto' }}>
                <rect x="20" y="268" width="160" height="6" fill={C.border} rx="2"/>
                <rect x="72" y="258" width="56" height="12" fill={C.surfaceHigh} stroke={C.border} rx="2"/>
                <rect x="90" y="50" width="20" height="208" fill={C.accentDim} stroke={C.accent} strokeWidth="1.5" rx="2"/>
                <line x1="100" y1="20" x2="100" y2="268" stroke={C.accent} strokeWidth="0.5" strokeDasharray="4,3"/>
                <rect x="110" y="120" width="50" height="28" fill="#1E1B4B" stroke="#7C3AED" strokeWidth="1.2" rx="3"/>
                <text x="135" y="138" textAnchor="middle" fill="#A78BFA" fontSize="9" fontWeight="600">Hubkorb</text>
                <line x1="100" y1="114" x2="158" y2="114" stroke="#7C3AED" strokeWidth="1" markerEnd="url(#arr)"/>
                <text x="129" y="111" textAnchor="middle" fill="#A78BFA" fontSize="8">a_k</text>
                {(form.lagerung !== 'freistehend') && parseFloat(form.hAnbindung) > 0 && (
                  <>
                    <rect x="15" y="168" width="75" height="12" fill="#1A2E1A" stroke={C.success} strokeWidth="1.2" rx="2"/>
                    <circle cx="90" cy="174" r="5" fill={C.success} opacity="0.9"/>
                    <text x="53" y="165" textAnchor="middle" fill={C.success} fontSize="8">h₁ = {form.hAnbindung} m</text>
                  </>
                )}
                {form.lagerung === '2wandanbindungen' && parseFloat(form.hAnbindung2) > 0 && (
                  <>
                    <rect x="15" y="90" width="75" height="12" fill="#2D1A00" stroke={C.warning} strokeWidth="1.2" rx="2"/>
                    <circle cx="90" cy="96" r="5" fill={C.warning} opacity="0.9"/>
                    <text x="53" y="87" textAnchor="middle" fill={C.warning} fontSize="8">h₂ = {form.hAnbindung2} m</text>
                  </>
                )}
                {form.lagerung === 'deckenanbindung' && (
                  <line x1="10" y1="50" x2="190" y2="50" stroke={C.border} strokeWidth="1" strokeDasharray="4,3"/>
                )}
                <line x1="28" y1="50" x2="28" y2="258" stroke={C.textMuted} strokeWidth="0.8"/>
                <line x1="23" y1="50" x2="33" y2="50" stroke={C.textMuted} strokeWidth="0.8"/>
                <line x1="23" y1="258" x2="33" y2="258" stroke={C.textMuted} strokeWidth="0.8"/>
                <text x="18" y="162" textAnchor="middle" fill={C.textMuted} fontSize="8" transform="rotate(-90,18,162)">H Säule</text>
                {[0,1,2,3,4].map(i => <line key={i} x1={76+i*8} y1="270" x2={72+i*8} y2="280" stroke={C.border} strokeWidth="1.5"/>)}
                <defs>
                  <marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#7C3AED"/></marker>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
