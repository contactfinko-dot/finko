'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { IconTrendingUp, IconChartArea, IconBuildingBank } from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + ' M€'
  if (n >= 10_000) return Math.round(n).toLocaleString('fr-FR') + ' €'
  return n.toFixed(0) + ' €'
}

function drawChart(
  canvas: HTMLCanvasElement,
  years: number[],
  capital: number[],
  invested: number[],
) {
  const dpr = window.devicePixelRatio || 1
  const W = canvas.offsetWidth || 400
  const H = 180
  canvas.width = W * dpr
  canvas.height = H * dpr
  canvas.style.width = W + 'px'
  canvas.style.height = H + 'px'
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  const pad = { t: 10, r: 10, b: 32, l: 60 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b
  const maxV = Math.max(...capital) * 1.05

  ctx.strokeStyle = '#f0f0ee'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + iH * i / 4
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + iW, y); ctx.stroke()
    ctx.fillStyle = '#bbb'
    ctx.font = '10px Poppins,sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(fmt(maxV * (4 - i) / 4).replace(' €', ''), pad.l - 5, y + 4)
  }
  ctx.fillText('€', pad.l - 5, pad.t + 4)

  ctx.fillStyle = '#bbb'
  ctx.textAlign = 'center'
  const step = Math.ceil(years.length / 5)
  years.forEach((y, i) => {
    if (i % step === 0 || i === years.length - 1) {
      const x = pad.l + iW * i / (years.length - 1)
      ctx.fillText(y + 'a', x, H - pad.b + 14)
    }
  })

  function line(data: number[], color: string, lw: number, fill?: string) {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = lw
    data.forEach((v, i) => {
      const x = pad.l + iW * i / (data.length - 1)
      const y = pad.t + iH * (1 - v / maxV)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    if (fill) {
      const lastX = pad.l + iW, lastY = pad.t + iH
      ctx.lineTo(lastX, lastY); ctx.lineTo(pad.l, lastY); ctx.closePath()
      ctx.fillStyle = fill; ctx.fill()
    } else {
      ctx.stroke()
    }
  }

  line(invested, '#ddd', 1.5)
  ctx.save()
  line(capital, '#1D9E75', 0, 'rgba(29,158,117,0.1)')
  ctx.restore()
  line(capital, '#1D9E75', 2)
}

export default function CalculatricesClient() {
  const [tab, setTab] = useState(0)

  // Calc 0 — Intérêts composés
  const [c0Capital, setC0Capital] = useState(5000)
  const [c0Monthly, setC0Monthly] = useState(200)
  const [c0Rate, setC0Rate] = useState(7)
  const [c0Years, setC0Years] = useState(20)
  const c0ChartRef = useRef<HTMLCanvasElement>(null)

  // Calc 1 — PEA
  const [c1Capital, setC1Capital] = useState(5000)
  const [c1Monthly, setC1Monthly] = useState(300)
  const [c1Rate, setC1Rate] = useState(7)
  const [c1Years, setC1Years] = useState(20)
  const [c1Tmi, setC1Tmi] = useState(30)

  // Calc 2 — PER
  const [c2Income, setC2Income] = useState(45000)
  const [c2Tmi, setC2Tmi] = useState(30)
  const [c2Versement, setC2Versement] = useState(3000)
  const [c2Years, setC2Years] = useState(25)
  const [c2Rate, setC2Rate] = useState(5)

  const calcIC = useCallback(() => {
    const r = c0Rate / 100 / 12
    const yrs: number[] = [], caps: number[] = [], invs: number[] = []
    let total = c0Capital
    for (let m = 0; m <= c0Years * 12; m++) {
      if (m % 12 === 0) {
        yrs.push(m / 12)
        caps.push(total)
        invs.push(c0Capital + c0Monthly * m)
      }
      total = r > 0 ? total * (1 + r) + c0Monthly : total + c0Monthly
    }
    if (tab === 0 && c0ChartRef.current) {
      requestAnimationFrame(() => {
        if (c0ChartRef.current) drawChart(c0ChartRef.current, yrs, caps, invs)
      })
    }
    const invested = c0Capital + c0Monthly * c0Years * 12
    const gains = total - invested
    return { total, invested, gains, mult: total / Math.max(invested, 1) }
  }, [c0Capital, c0Monthly, c0Rate, c0Years, tab])

  const calcPEA = useCallback(() => {
    const r = c1Rate / 100 / 12
    let total = c1Capital
    for (let m = 0; m < c1Years * 12; m++) total = r > 0 ? total * (1 + r) + c1Monthly : total + c1Monthly
    const invested = Math.min(c1Capital + c1Monthly * c1Years * 12, 150_000)
    const gains = Math.max(total - invested, 0)
    const taxPEA = gains * 0.172
    const taxPFU = gains * 0.30
    return { total, invested, gains, taxPEA, taxPFU, netPEA: total - taxPEA, netPFU: total - taxPFU, saving: taxPFU - taxPEA }
  }, [c1Capital, c1Monthly, c1Rate, c1Years])

  const calcPER = useCallback(() => {
    const plafond = Math.min(c2Income * 0.10, 35_194)
    const r = c2Rate / 100
    let capital = 0
    for (let y = 0; y < c2Years; y++) capital = capital * (1 + r) + c2Versement
    const totalVersed = c2Versement * c2Years
    const savingAnnual = c2Versement * (c2Tmi / 100)
    const savingTotal = savingAnnual * c2Years
    return { capital, totalVersed, savingAnnual, savingTotal, realCost: totalVersed - savingTotal, plafond }
  }, [c2Income, c2Tmi, c2Versement, c2Years, c2Rate])

  const ic = calcIC()
  const pea = calcPEA()
  const per = calcPER()

  useEffect(() => {
    if (tab === 0 && c0ChartRef.current) {
      calcIC()
    }
  }, [tab, calcIC])

  const TABS = [
    { icon: <IconTrendingUp size={16} />, label: "Intérêts composés" },
    { icon: <IconChartArea size={16} />,  label: "Simulation PEA" },
    { icon: <IconBuildingBank size={16} />, label: "Simulation PER" },
  ]

  const fieldCls = "w-full px-3 py-2.5 pr-10 border border-[#ccc] rounded-lg text-[14px] outline-none focus:border-vert bg-fond text-texte font-sans"
  const labelCls = "block text-[12px] font-medium text-[#555] mb-1.5"

  return (
    <div className="min-h-screen bg-fond-gris font-sans">
      <Nav />

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#085041,#1D9E75)" }} className="px-10 py-12 text-white">
        <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-[#5DCAA5] mb-3">Outils · Simulation</p>
        <h1 className="text-[32px] font-semibold tracking-tight mb-2">Calculatrices financières</h1>
        <p className="text-[14px] text-white/70 max-w-[480px] leading-relaxed">
          Simule tes investissements, estime ton économie d'impôt et visualise la puissance des intérêts composés.
        </p>
      </div>

      <div className="max-w-[1000px] mx-auto py-8 px-6 pb-16">

        {/* TABS */}
        <div className="flex bg-fond border border-bordure rounded-xl overflow-hidden mb-8">
          {TABS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[13px] border-r border-bordure last:border-r-0 cursor-pointer font-sans transition-colors ${
                tab === i
                  ? 'bg-[#E1F5EE] text-vert-dark font-medium'
                  : 'text-muted hover:bg-fond-gris hover:text-texte'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── PANEL 0 : Intérêts composés ── */}
        {tab === 0 && (
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
            <div className="bg-fond border border-bordure rounded-2xl p-7">
              <h2 className="text-[16px] font-semibold mb-1.5">Intérêts composés</h2>
              <p className="text-[12px] text-[#888] mb-6 leading-relaxed">La règle des intérêts composés : chaque gain génère lui-même des gains. Plus tu commences tôt, plus l'effet est spectaculaire.</p>
              <div className="mb-4">
                <label className={labelCls}>Capital initial</label>
                <div className="relative">
                  <input type="number" className={fieldCls} value={c0Capital} onChange={e => setC0Capital(+e.target.value || 0)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#aaa]">€</span>
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Versement mensuel</label>
                <div className="relative">
                  <input type="number" className={fieldCls} value={c0Monthly} onChange={e => setC0Monthly(+e.target.value || 0)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#aaa]">€/mois</span>
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Taux de rendement annuel estimé — <strong>{c0Rate} %</strong></label>
                <input type="range" min="1" max="20" step="0.5" value={c0Rate} onChange={e => setC0Rate(+e.target.value)} className="w-full accent-vert" />
                <div className="flex justify-between text-[11px] text-[#aaa] mt-0.5">
                  <span>1 %</span><span>Livret A 3 %</span><span>ETF ~7 %</span><span>20 %</span>
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Durée — <strong>{c0Years} ans</strong></label>
                <input type="range" min="1" max="40" step="1" value={c0Years} onChange={e => setC0Years(+e.target.value)} className="w-full accent-vert" />
                <div className="flex justify-between text-[11px] text-[#aaa] mt-0.5">
                  <span>1 an</span><span>10 ans</span><span>20 ans</span><span>40 ans</span>
                </div>
              </div>
            </div>

            <div className="bg-fond border border-bordure rounded-2xl p-7">
              <h3 className="text-[14px] font-semibold text-[#888] uppercase tracking-[1px] mb-5">Résultat</h3>
              <div className="text-center p-5 bg-[#E1F5EE] rounded-xl mb-5">
                <div className="text-[12px] text-[#0F6E56] mb-1">Capital final estimé</div>
                <div className="text-[34px] font-semibold text-vert-dark tracking-tight">{fmt(ic.total)}</div>
              </div>
              {[
                ["Total investi", fmt(ic.invested), ""],
                ["Gains générés", "+" + fmt(ic.gains), "text-vert"],
                ["Multiplication du capital", "×" + ic.mult.toFixed(1), "text-vert"],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex justify-between items-center py-2.5 border-b border-[#f0f0ee] last:border-0 text-[13px]">
                  <span className="text-muted">{k}</span>
                  <span className={`font-medium ${cls || "text-texte"}`}>{v}</span>
                </div>
              ))}
              <div className="mt-5 pt-5 border-t border-[#f0f0ee]">
                <div className="flex gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-[11px] text-muted">
                    <span className="w-2.5 h-2.5 rounded-full bg-vert shrink-0" /> Capital total
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ccc] shrink-0" /> Total investi
                  </span>
                </div>
                <canvas ref={c0ChartRef} className="w-full" style={{ height: '180px' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── PANEL 1 : PEA ── */}
        {tab === 1 && (
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
            <div className="bg-fond border border-bordure rounded-2xl p-7">
              <h2 className="text-[16px] font-semibold mb-1.5">Simulation PEA</h2>
              <p className="text-[12px] text-[#888] mb-6 leading-relaxed">
                Le Plan d'Épargne en Actions offre une exonération d'impôt sur les plus-values après 5 ans — seuls les prélèvements sociaux (17,2 %) restent dus.
              </p>
              {[
                { label: "Capital initial", val: c1Capital, set: setC1Capital, suffix: "€" },
                { label: "Versement mensuel", val: c1Monthly, set: setC1Monthly, suffix: "€/mois" },
              ].map(f => (
                <div key={f.label} className="mb-4">
                  <label className={labelCls}>{f.label}</label>
                  <div className="relative">
                    <input type="number" className={fieldCls} value={f.val} onChange={e => f.set(+e.target.value || 0)} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#aaa]">{f.suffix}</span>
                  </div>
                </div>
              ))}
              <div className="mb-4">
                <label className={labelCls}>Taux de rendement annuel — <strong>{c1Rate} %</strong></label>
                <input type="range" min="1" max="15" step="0.5" value={c1Rate} onChange={e => setC1Rate(+e.target.value)} className="w-full accent-vert" />
                <div className="flex justify-between text-[11px] text-[#aaa] mt-0.5">
                  <span>1 %</span><span>7 %</span><span>15 %</span>
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Durée — <strong>{c1Years} ans</strong></label>
                <input type="range" min="5" max="40" step="1" value={c1Years} onChange={e => setC1Years(+e.target.value)} className="w-full accent-vert" />
                <div className="flex justify-between text-[11px] text-[#aaa] mt-0.5">
                  <span>5 ans</span><span>20 ans</span><span>40 ans</span>
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Tranche marginale d'imposition (TMI)</label>
                <select className={fieldCls} value={c1Tmi} onChange={e => setC1Tmi(+e.target.value)}>
                  <option value="11">11 % — jusqu'à 27 478 €/an</option>
                  <option value="30">30 % — jusqu'à 78 570 €/an</option>
                  <option value="41">41 % — jusqu'à 168 994 €/an</option>
                  <option value="45">45 % — au-delà de 168 994 €/an</option>
                </select>
              </div>
            </div>

            <div className="bg-fond border border-bordure rounded-2xl p-7">
              <h3 className="text-[14px] font-semibold text-[#888] uppercase tracking-[1px] mb-5">Comparatif fiscal</h3>
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl p-4 text-center">
                  <div className="text-[11px] text-[#888] mb-1">Avec PEA</div>
                  <div className="text-[20px] font-semibold text-vert-dark">{fmt(pea.netPEA)}</div>
                  <div className="text-[11px] text-[#aaa] mt-1">Net après PS 17,2 %</div>
                </div>
                <div className="bg-fond-gris rounded-xl p-4 text-center">
                  <div className="text-[11px] text-[#888] mb-1">Sans PEA (PFU 30 %)</div>
                  <div className="text-[20px] font-semibold text-[#555]">{fmt(pea.netPFU)}</div>
                  <div className="text-[11px] text-[#aaa] mt-1">Net après flat tax</div>
                </div>
              </div>
              {[
                ["Capital brut final", fmt(pea.total), ""],
                ["Total investi", fmt(pea.invested), ""],
                ["Gains bruts", "+" + fmt(pea.gains), "text-vert"],
                ["Impôt PEA (PS 17,2 %)", "-" + fmt(pea.taxPEA), "text-[#E24B4A]"],
                ["Impôt hors PEA (PFU 30 %)", "-" + fmt(pea.taxPFU), "text-[#E24B4A]"],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex justify-between items-center py-2.5 border-b border-[#f0f0ee] last:border-0 text-[13px]">
                  <span className="text-muted">{k}</span>
                  <span className={`font-medium ${cls || "text-texte"}`}>{v}</span>
                </div>
              ))}
              <div className="mt-4 flex items-center gap-2 bg-[#E1F5EE] rounded-lg px-3.5 py-2.5 text-[13px] text-vert-dark font-medium">
                <span className="text-[18px]">🐷</span>
                <span>Économie fiscale PEA : <strong>{fmt(pea.saving)}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* ── PANEL 2 : PER ── */}
        {tab === 2 && (
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
            <div className="bg-fond border border-bordure rounded-2xl p-7">
              <h2 className="text-[16px] font-semibold mb-1.5">Simulation PER</h2>
              <p className="text-[12px] text-[#888] mb-6 leading-relaxed">
                Le Plan d'Épargne Retraite permet de déduire les versements de ton revenu imposable aujourd'hui. Un double avantage : économie d'impôt immédiate + capital pour la retraite.
              </p>
              <div className="mb-4">
                <label className={labelCls}>Revenu net imposable annuel</label>
                <div className="relative">
                  <input type="number" className={fieldCls} value={c2Income} onChange={e => setC2Income(+e.target.value || 0)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#aaa]">€/an</span>
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Tranche marginale d'imposition (TMI)</label>
                <select className={fieldCls} value={c2Tmi} onChange={e => setC2Tmi(+e.target.value)}>
                  <option value="11">11 %</option>
                  <option value="30">30 %</option>
                  <option value="41">41 %</option>
                  <option value="45">45 %</option>
                </select>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Versement annuel PER</label>
                <div className="relative">
                  <input type="number" className={fieldCls} value={c2Versement} onChange={e => setC2Versement(+e.target.value || 0)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#aaa]">€/an</span>
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Durée avant la retraite — <strong>{c2Years} ans</strong></label>
                <input type="range" min="5" max="40" step="1" value={c2Years} onChange={e => setC2Years(+e.target.value)} className="w-full accent-vert" />
                <div className="flex justify-between text-[11px] text-[#aaa] mt-0.5">
                  <span>5 ans</span><span>25 ans</span><span>40 ans</span>
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Taux de rendement estimé — <strong>{c2Rate} %</strong></label>
                <input type="range" min="1" max="12" step="0.5" value={c2Rate} onChange={e => setC2Rate(+e.target.value)} className="w-full accent-vert" />
                <div className="flex justify-between text-[11px] text-[#aaa] mt-0.5">
                  <span>1 %</span><span>5 %</span><span>12 %</span>
                </div>
              </div>
            </div>

            <div className="bg-fond border border-bordure rounded-2xl p-7">
              <h3 className="text-[14px] font-semibold text-[#888] uppercase tracking-[1px] mb-5">Résultat</h3>
              <div className="text-center p-5 bg-[#E1F5EE] rounded-xl mb-5">
                <div className="text-[12px] text-[#0F6E56] mb-1">Capital estimé à la retraite</div>
                <div className="text-[34px] font-semibold text-vert-dark tracking-tight">{fmt(per.capital)}</div>
              </div>
              {[
                ["Versements totaux", fmt(per.totalVersed), ""],
                ["Économie d'impôt annuelle", fmt(per.savingAnnual) + "/an", "text-vert"],
                ["Économie d'impôt totale", "+" + fmt(per.savingTotal), "text-vert"],
                ["Coût réel des versements", fmt(per.realCost), ""],
                ["Plafond déductible indicatif", fmt(per.plafond), ""],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex justify-between items-center py-2.5 border-b border-[#f0f0ee] last:border-0 text-[13px]">
                  <span className="text-muted">{k}</span>
                  <span className={`font-medium ${cls || "text-texte"}`}>{v}</span>
                </div>
              ))}
              <div className="mt-4 flex items-center gap-2 bg-[#E1F5EE] rounded-lg px-3.5 py-2.5 text-[13px] text-vert-dark font-medium">
                <span className="text-[18px]">🧾</span>
                <span>Pour <strong>{fmt(c2Versement)}/an</strong> versés, l'État finance <strong>{fmt(per.savingAnnual)}</strong></span>
              </div>
              <p className="text-[11px] text-[#aaa] mt-3 leading-relaxed">
                ⚠️ À la sortie en capital, la fraction des versements déduits est imposée à l'IR et les gains aux PS (17,2 %). Simulation indicative — consultez un conseiller.
              </p>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}
