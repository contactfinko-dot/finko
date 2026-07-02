'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconLayoutDashboard, IconIdBadge2, IconFileText, IconVideo,
  IconTargetArrow, IconChartBar, IconUsers, IconStar, IconSettings,
  IconCreditCard, IconEye, IconUserPlus, IconHandClick, IconLink,
  IconArrowUp, IconArrowDown, IconBell, IconHelpCircle, IconPlus,
  IconArrowRight, IconCalendar, IconClock, IconSparkles, IconBulb,
  IconX, IconSend,
} from '@tabler/icons-react'

const BARS = [
  {h:45,l:"18/5"},{h:38,l:"19"},{h:52,l:"20"},{h:65,l:"21"},{h:55,l:"22"},
  {h:42,l:"23"},{h:30,l:"24"},{h:48,l:"25"},{h:58,l:"26"},{h:82,l:"27",hi:true},
  {h:70,l:"28"},{h:61,l:"29"},{h:74,l:"30"},{h:85,l:"31/5"},{h:77,l:"1/6"},
  {h:68,l:"2"},{h:90,l:"3"},{h:100,l:"4",hi:true},{h:88,l:"5"},{h:79,l:"6"},
  {h:83,l:"7"},{h:91,l:"8"},{h:85,l:"9"},{h:94,l:"10"},{h:100,l:"11",hi:true},
  {h:88,l:"12"},{h:92,l:"13"},{h:96,l:"14"},{h:89,l:"15"},{h:40,l:"16"},
]

const CONTENT_ROWS = [
  { title: "5 erreurs à éviter quand on commence à investir", type: "Conseil", typeCls: "bg-[#F3E6FB] text-[#6B21A8]", views: "12 440", perf: 88 },
  { title: "ETF World vs SCPI sur 10 ans", type: "Analyse", typeCls: "bg-[#E6F1FB] text-[#185FA5]", views: "9 820", perf: 72 },
  { title: "Construire son portefeuille ETF (Webinaire)", type: "Webinaire", typeCls: "bg-[#FEF3E2] text-[#92400E]", views: "7 100", perf: 65 },
  { title: "PEA ou assurance-vie en 2026 ?", type: "Guide", typeCls: "bg-[#E1F5EE] text-vert-dark", views: "6 340", perf: 59 },
]

const AGENDA = [
  { dot: "bg-[#E24B4A] animate-pulse", title: "Q&A mensuel — Assurance-vie", meta: "En ce moment · 183 connectés", icon: <IconClock size={13} className="text-vert" />, status: "En direct", statusCls: "bg-[#FEE2E2] text-[#DC2626]" },
  { dot: "bg-vert", title: "Construire son portefeuille ETF", meta: "24 juin · 18h30", icon: <IconCalendar size={13} className="text-vert" />, status: "J-7", statusCls: "bg-[#E1F5EE] text-vert-dark" },
  { dot: "bg-[#185FA5]", title: "Guide : Fiscalité du PER 2026", meta: "En cours de rédaction", icon: <IconFileText size={13} className="text-vert" />, status: "Brouillon", statusCls: "bg-[#f0f0ee] text-[#888]" },
]

const TYPE_CHIPS = ["Guide","Analyse","Conseil","Actualité"]

export default function DashboardEntrepriseClient() {
  const [period, setPeriod] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeChip, setActiveChip] = useState(0)
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postTags, setPostTags] = useState('')

  return (
    <div className="flex min-h-screen bg-fond-gris font-sans">

      {/* SIDEBAR */}
      <aside className="w-[220px] bg-fond border-r border-bordure flex flex-col fixed top-0 left-0 h-screen z-50">
        <div className="px-6 py-5 border-b border-bordure flex items-center gap-2 text-[17px] font-medium">
          <span className="w-2 h-2 rounded-full bg-vert" />
          fin<em className="not-italic text-vert">ko</em>
        </div>
        <div className="px-6 py-4 border-b border-bordure flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#1a5e8c] flex items-center justify-center text-[13px] font-bold text-white shrink-0">NA</div>
          <div>
            <div className="text-[13px] font-medium">Nalo</div>
            <span className="text-[10px] bg-[#E1F5EE] text-vert-dark px-2 py-0.5 rounded-full font-medium">Pro</span>
          </div>
        </div>

        <nav className="px-3 pt-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#bbb] px-3 mb-2">Principal</p>
          <SideItem icon={<IconLayoutDashboard size={17} />} label="Tableau de bord" active />
          <Link href="/profil-entreprise"><SideItem icon={<IconIdBadge2 size={17} />} label="Mon profil" /></Link>
          <SideItem icon={<IconFileText size={17} />} label="Publications" badge="3" />
          <SideItem icon={<IconVideo size={17} />} label="Webinaires" />
          <SideItem icon={<IconTargetArrow size={17} />} label="Publicités" />

          <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#bbb] px-3 mt-4 mb-2">Analyse</p>
          <SideItem icon={<IconChartBar size={17} />} label="Analytics" />
          <SideItem icon={<IconUsers size={17} />} label="Audience" />
          <SideItem icon={<IconStar size={17} />} label="Avis & Mentions" />

          <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#bbb] px-3 mt-4 mb-2">Paramètres</p>
          <SideItem icon={<IconSettings size={17} />} label="Paramètres" />
          <SideItem icon={<IconCreditCard size={17} />} label="Facturation" />
        </nav>

        <div className="px-3 py-4 border-t border-bordure">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-vert flex items-center justify-center text-[12px] font-medium text-white">SL</div>
            <div>
              <div className="text-[12px] font-medium">Sophie L.</div>
              <div className="text-[10px] text-[#888]">sophie@nalo.fr</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-[220px] flex-1">

        {/* TOPBAR */}
        <div className="bg-fond border-b border-bordure px-8 py-3.5 flex justify-between items-center sticky top-0 z-40">
          <div>
            <div className="text-[16px] font-medium">Tableau de bord</div>
            <div className="text-[12px] text-[#888]">Bonjour Sophie — Voici vos performances de la semaine</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-bordure rounded-lg flex items-center justify-center text-muted cursor-pointer relative hover:bg-fond-gris transition-colors">
              <IconBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E24B4A] rounded-full border border-fond" />
            </div>
            <div className="w-9 h-9 border border-bordure rounded-lg flex items-center justify-center text-muted cursor-pointer hover:bg-fond-gris transition-colors">
              <IconHelpCircle size={18} />
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 bg-vert text-white border-none px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-vert-hover transition-colors font-sans"
            >
              <IconPlus size={15} /> Nouvelle publication
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8">

          {/* PERIOD */}
          <div className="flex justify-between items-center mb-7">
            <div className="text-[11px] font-medium tracking-[2px] uppercase text-vert flex items-center gap-1.5">
              <IconCalendar size={13} /> 9 – 16 juin 2026
            </div>
            <div className="flex bg-fond border border-bordure rounded-lg overflow-hidden">
              {["7 jours","30 jours","90 jours","12 mois"].map((p, i) => (
                <button
                  key={p}
                  onClick={() => setPeriod(i)}
                  className={`px-4 py-1.5 text-[12px] border-r border-bordure last:border-r-0 cursor-pointer font-sans transition-colors ${
                    period === i ? 'bg-[#E1F5EE] text-vert-dark font-medium' : 'text-[#888] hover:bg-fond-gris'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <KPI icon={<IconEye size={20} className="text-vert" />} iconBg="bg-[#E1F5EE]" delta="+18%" up val="48 240" label="Impressions totales" />
            <KPI icon={<IconUserPlus size={20} className="text-[#185FA5]" />} iconBg="bg-[#E6F1FB]" delta="+31%" up val="+214" label="Nouveaux abonnés" />
            <KPI icon={<IconHandClick size={20} className="text-[#92400E]" />} iconBg="bg-[#FEF3E2]" delta="+7%" up val="6,4 %" label="Taux d'engagement" />
            <KPI icon={<IconLink size={20} className="text-[#DC2626]" />} iconBg="bg-[#FEE2E2]" delta="-4%" up={false} val="1 342" label="Clics vers votre site" />
          </div>

          {/* CHARTS ROW */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
            {/* Bar chart */}
            <div className="bg-fond border border-bordure rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[14px] font-medium">Impressions — 30 derniers jours</span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-[#888]">
                    <span className="w-2 h-2 rounded-full bg-vert" /> Publications
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#888]">
                    <span className="w-2 h-2 rounded-full bg-[#185FA5]" /> Webinaires
                  </span>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-[120px]">
                {BARS.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t transition-opacity hover:opacity-85 ${b.hi ? 'opacity-100' : 'opacity-75'}`}
                      style={{
                        height: b.h + '%',
                        background: b.hi
                          ? 'linear-gradient(to top,#085041,#1D9E75)'
                          : 'linear-gradient(to top,#1D9E75,#5DCAA5)',
                        borderRadius: '4px 4px 0 0',
                      }}
                    />
                    <span className="text-[10px] text-[#aaa]">{b.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut */}
            <div className="bg-fond border border-bordure rounded-2xl p-6">
              <div className="text-[14px] font-medium mb-6">Répartition audience</div>
              <div className="flex flex-col items-center gap-6">
                <div
                  className="w-[120px] h-[120px] rounded-full relative"
                  style={{ background: 'conic-gradient(#1D9E75 0% 42%,#185FA5 42% 63%,#F59E0B 63% 79%,#E5E5E5 79% 100%)' }}
                >
                  <div className="absolute inset-7 bg-fond rounded-full" />
                </div>
                <div className="w-full flex flex-col gap-2">
                  {[
                    ["#1D9E75","Publications","42 %"],
                    ["#185FA5","Webinaires","21 %"],
                    ["#F59E0B","Publicités","16 %"],
                    ["#E5E5E5","Profil direct","21 %"],
                  ].map(([color, label, pct]) => (
                    <div key={label} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-1.5 text-muted">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        {label}
                      </div>
                      <span className="font-medium">{pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div className="grid grid-cols-2 gap-4">
            {/* TOP CONTENUS */}
            <div className="bg-fond border border-bordure rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <span className="text-[14px] font-medium">Meilleures publications</span>
                <a href="#" className="flex items-center gap-1 text-[12px] text-vert">Tout voir <IconArrowRight size={14} /></a>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Titre","Type","Vues","Engagement"].map(h => (
                      <th key={h} className="text-[10px] font-medium tracking-[1.5px] uppercase text-[#aaa] text-left pb-3 border-b border-bordure">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CONTENT_ROWS.map((r, i) => (
                    <tr key={i}>
                      <td className="py-3 border-b border-[#f0f0ee] text-[12px] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap last:border-0">{r.title}</td>
                      <td className="py-3 border-b border-[#f0f0ee] last:border-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.typeCls}`}>{r.type}</span>
                      </td>
                      <td className="py-3 border-b border-[#f0f0ee] text-[12px] last:border-0">{r.views}</td>
                      <td className="py-3 border-b border-[#f0f0ee] last:border-0">
                        <div className="flex items-center gap-1.5">
                          <div className="w-[60px] h-1 bg-[#e5e5e5] rounded-full overflow-hidden">
                            <div className="h-full bg-vert rounded-full" style={{ width: r.perf + '%' }} />
                          </div>
                          <span className="text-[11px] text-vert min-w-[28px]">{r.perf / 10}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AGENDA + INSIGHT */}
            <div className="flex flex-col gap-4">
              <div className="bg-fond border border-bordure rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[14px] font-medium">Agenda</span>
                  <a href="#" className="flex items-center gap-1 text-[12px] text-vert">Planifier <IconPlus size={14} /></a>
                </div>
                {AGENDA.map((ev, i) => (
                  <div key={i} className="flex gap-3 py-3.5 border-b border-bordure last:border-0">
                    <div className="flex flex-col items-center pt-1">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ev.dot}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium mb-0.5">{ev.title}</div>
                      <div className="flex items-center gap-2 text-[11px] text-[#888]">
                        {ev.icon} {ev.meta}
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap self-center ${ev.statusCls}`}>
                      {ev.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg,#042e26,#085041)" }}>
                <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#5DCAA5] mb-3 flex items-center gap-1.5">
                  <IconSparkles size={12} /> Recommandation Finko
                </p>
                <h3 className="text-[15px] font-medium mb-2 leading-[1.4]">Votre audience réagit fort aux analyses comparatives</h3>
                <p className="text-[12px] text-white/65 leading-relaxed mb-5">
                  Vos 3 meilleures publications sont toutes des comparaisons (ETF/SCPI, PEA/AV…). Envisagez de planifier une série mensuelle sur ce format.
                </p>
                <button className="flex items-center gap-1.5 bg-white/15 border border-white/30 text-white px-4 py-2 rounded-lg text-[12px] font-medium cursor-pointer hover:bg-white/25 transition-colors font-sans">
                  <IconBulb size={14} /> Créer une série
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL NOUVELLE PUBLICATION */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-fond rounded-[20px] p-8 w-[540px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[17px] font-medium">Nouvelle publication</h2>
              <button onClick={() => setModalOpen(false)} className="bg-none border-none text-[22px] text-[#888] cursor-pointer leading-none hover:text-texte transition-colors">
                <IconX size={22} />
              </button>
            </div>
            <div className="mb-5">
              <label className="block text-[12px] font-medium mb-1.5">Type de contenu</label>
              <div className="flex gap-2 flex-wrap">
                {TYPE_CHIPS.map((chip, i) => (
                  <button
                    key={chip}
                    onClick={() => setActiveChip(i)}
                    className={`px-3.5 py-1.5 border rounded-full text-[12px] cursor-pointer font-sans transition-all ${
                      activeChip === i
                        ? 'bg-[#E1F5EE] text-vert-dark border-[#9FE1CB] font-medium'
                        : 'bg-fond text-muted border-bordure hover:bg-fond-gris'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[12px] font-medium mb-1.5">Titre</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-[#ccc] rounded-lg text-[13px] outline-none focus:border-vert bg-fond text-texte font-sans"
                placeholder="Ex : Comment optimiser sa fiscalité en 2026 ?"
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label className="block text-[12px] font-medium mb-1.5">Contenu</label>
              <textarea
                className="w-full px-3.5 py-2.5 border border-[#ccc] rounded-lg text-[13px] outline-none focus:border-vert bg-fond text-texte font-sans resize-y min-h-[100px]"
                placeholder="Rédigez votre publication ici..."
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-[12px] font-medium mb-1.5">Tags (séparés par des virgules)</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-[#ccc] rounded-lg text-[13px] outline-none focus:border-vert bg-fond text-texte font-sans"
                placeholder="Ex : fiscalité, épargne, investissement"
                value={postTags}
                onChange={e => setPostTags(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-fond text-muted border border-bordure px-4 py-2.5 rounded-lg text-[13px] cursor-pointer font-sans hover:bg-fond-gris transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex items-center gap-1.5 bg-vert text-white border-none px-5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-vert-hover transition-colors font-sans"
              >
                <IconSend size={15} /> Publier maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SideItem({ icon, label, active, badge }: {
  icon: React.ReactNode; label: string; active?: boolean; badge?: string
}) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] cursor-pointer transition-all mb-0.5 ${
      active ? 'bg-[#E1F5EE] text-vert font-medium' : 'text-muted hover:bg-fond-gris hover:text-texte'
    }`}>
      <span className={active ? 'text-vert' : ''}>{icon}</span>
      {label}
      {badge && (
        <span className="ml-auto bg-[#E24B4A] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">{badge}</span>
      )}
    </div>
  )
}

function KPI({ icon, iconBg, delta, up, val, label }: {
  icon: React.ReactNode; iconBg: string; delta: string; up: boolean; val: string; label: string
}) {
  return (
    <div className="bg-fond border border-bordure rounded-2xl px-6 py-5">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ${up ? 'bg-[#E1F5EE] text-vert-dark' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
          {up ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />} {delta}
        </div>
      </div>
      <div className="text-[30px] font-semibold tracking-tight text-texte mb-0.5">{val}</div>
      <div className="text-[12px] text-[#888]">{label}</div>
    </div>
  )
}
