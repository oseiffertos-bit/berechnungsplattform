export interface StationaerForm {
  name: string
  status: string
  lagerung: 'freistehend' | 'deckenanbindung' | 'wandanbindung' | '2wandanbindungen'
  saeuleHoehe: string
  saeuleGewicht: string
  hAnbindung: string
  hAnbindung2: string
  hubkorbGewicht: string
  ausladung: string
  hubhoehe: string
  nutzlast: string
  nutzlastAusladung: string
  gammaSt: string
  gammaQ: string
}

export interface StationaerResult {
  N_s: number; N_k: number; N_q: number; N_Ed: number
  M_k_char: number; M_q_char: number; M_char: number
  M_Ed_fuss: number; R_anb1_H: number; R_anb2_H: number
  V_Ed: number; M_total: number; lagerInfo: string
}

const n = (v: string) => parseFloat(v) || 0

export function calcStationaer(form: StationaerForm): StationaerResult | null {
  const H = n(form.saeuleHoehe), G_s = n(form.saeuleGewicht)
  if (!H || !G_s) return null

  const G_k = n(form.hubkorbGewicht), a_k = n(form.ausladung)
  const h_hub = n(form.hubhoehe) || H
  const Q = n(form.nutzlast), a_q = n(form.nutzlastAusladung)
  const h1 = n(form.hAnbindung), h2 = n(form.hAnbindung2)
  const γg = n(form.gammaSt) || 1.35, γq = n(form.gammaQ) || 1.50

  const N_s = G_s, N_k = G_k, N_q = Q
  const N_Ed = γg * (N_s + N_k) + γq * N_q
  const M_k = G_k * a_k, M_q = Q * a_q, M_char = M_k + M_q
  const M_Ed = γg * M_k + γq * M_q

  let R1 = 0, R2 = 0, M_fuss = M_Ed, info = ''

  if (form.lagerung === 'freistehend') {
    info = 'Freistehend – vollständige Einspannung am Fuß'
  } else if ((form.lagerung === 'deckenanbindung' || form.lagerung === 'wandanbindung') && h1 > 0) {
    R1 = M_Ed / h1
    M_fuss = 0
    const art = form.lagerung === 'deckenanbindung' ? 'Deckenanbindung' : 'Wandanbindung'
    info = `${art} bei h₁ = ${h1} m → H = ${R1.toFixed(2)} kN`
  } else if (form.lagerung === '2wandanbindungen' && h1 > 0 && h2 > 0 && h2 !== h1) {
    const hLow = Math.min(h1, h2), hHigh = Math.max(h1, h2)
    const span = hHigh - hLow
    R1 = M_Ed / span
    R2 = M_Ed / span
    M_fuss = R1 * hLow
    info = `2 Wandlager: h₁ = ${hLow} m (${R1.toFixed(2)} kN Zug), h₂ = ${hHigh} m (${R2.toFixed(2)} kN Druck)`
  }

  return {
    N_s, N_k, N_q, N_Ed,
    M_k_char: M_k, M_q_char: M_q, M_char,
    M_Ed_fuss: M_fuss || M_Ed,
    R_anb1_H: R1, R_anb2_H: R2,
    V_Ed: M_Ed / (h_hub || 1),
    M_total: M_fuss || M_Ed,
    lagerInfo: info,
  }
}
