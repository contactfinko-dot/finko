'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconUsers, IconVideo, IconInfoCircle, IconFileText,
  IconShieldCheck, IconTrendingUp, IconWorld,
  IconBrandLinkedin, IconBrandTwitter, IconCalendar,
  IconHeart, IconMessageCircle, IconShare, IconBookmark,
  IconClock, IconBell, IconPlayerPlay, IconHistory,
  IconChartBar, IconBuilding, IconRocket, IconPlus, IconCheck,
} from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'

type TabId = 'publications' | 'webinaires' | 'apropos'

const POSTS = [
  {
    type: "Guide",
    age: "il y a 2 jours",
    title: "Comment choisir entre PEA et assurance-vie en 2026 ?",
    text: "PEA ou assurance-vie ? Ces deux enveloppes fiscales sont complémentaires mais pas interchangeables. Voici notre grille de décision basée sur votre horizon et vos objectifs...",
    likes: 142, comments: 28, shares: 19,
  },
  {
    type: "Analyse",
    age: "il y a 1 semaine",
    title: "Les ETF World ont surperformé les SCPI sur 10 ans — voici les données",
    text: "Beaucoup de nos clients nous demandent la comparaison ETF vs SCPI. Nous avons analysé les rendements réels net de frais sur la période 2014-2024. Les résultats sont sans appel...",
    likes: 231, comments: 67, shares: 44,
  },
  {
    type: "Conseil",
    age: "il y a 2 semaines",
    title: "5 erreurs à éviter quand on commence à investir",
    text: "Nos conseillers patrimoniaux ont analysé des centaines de dossiers. Ces 5 erreurs reviennent en boucle chez les investisseurs débutants et coûtent en moyenne 1 à 3 % de rendement annuel...",
    likes: 389, comments: 94, shares: 127,
  },
  {
    type: "Actualité",
    age: "il y a 3 semaines",
    title: "Hausse des taux : quel impact sur votre assurance-vie en fonds euros ?",
    text: "Les taux directeurs de la BCE remontent depuis 2023. Ce mouvement a un effet direct sur les rendements des fonds euros — et la trajectoire pour 2026 s'annonce plus favorable qu'attendu...",
    likes: 176, comments: 41, shares: 32,
  },
]

export default function ProfilEntrepriseClient() {
  const [tab, setTab] = useState<TabId>('publications')
  const [following, setFollowing] = useState(false)

  return (
    <div className="min-h-screen bg-fond-gris font-sans">
      <Nav />

      <div className="max-w-[1020px] mx-auto px-6 py-8 pb-16">

        {/* PROFILE CARD */}
        <div className="bg-fond rounded-2xl border border-bordure overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-[180px]" style={{ background: "linear-gradient(135deg,#0d2f4a 0%,#1a5e8c 55%,#2d8fcf 100%)" }} />
          {/* Body */}
          <div className="px-8 pt-3 pb-7">
            <div className="flex items-end justify-between -mt-9 mb-4">
              {/* Logo */}
              <div className="w-[72px] h-[72px] bg-fond rounded-2xl border-[3px] border-fond shadow-md flex items-center justify-center text-[26px] font-bold text-[#1a5e8c] relative z-10">
                NA
              </div>
              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setFollowing(f => !f)}
                  className={`flex items-center gap-1.5 px-[22px] py-[9px] rounded-lg text-[13px] font-medium cursor-pointer border transition-all ${
                    following
                      ? 'bg-[#E1F5EE] text-vert-dark border-[#9FE1CB]'
                      : 'bg-vert text-white border-vert hover:bg-vert-hover'
                  }`}
                >
                  {following ? <><IconCheck size={15} /> Abonné</> : <><IconPlus size={15} /> Suivre</>}
                </button>
                <button className="flex items-center gap-1.5 px-4 py-[9px] rounded-lg text-[13px] bg-fond text-muted border border-bordure cursor-pointer hover:bg-fond-gris transition-colors">
                  <IconShare size={15} /> Partager
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h1 className="text-[24px] font-semibold tracking-tight mb-1">Nalo</h1>
              <p className="text-[13px] text-[#888] mb-3 flex items-center gap-1.5">
                <IconBuilding size={15} className="text-vert" /> Gestion de patrimoine · Paris, France
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-[#E1F5EE] text-vert-dark">
                  <IconShieldCheck size={12} /> Partenaire Finko vérifié
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-[#E6F1FB] text-[#185FA5]">
                  <IconTrendingUp size={12} /> Gestion pilotée
                </span>
                {['ETF','Assurance-vie','Épargne'].map(t => (
                  <span key={t} className="text-[11px] font-medium px-3 py-1 rounded-full bg-fond-gris text-muted">{t}</span>
                ))}
              </div>
            </div>

            <p className="text-[14px] text-muted leading-[1.7] max-w-[580px] mb-6">
              Nalo est une fintech de gestion de patrimoine qui propose des investissements personnalisés via une assurance-vie 100 % en ligne. Nous combinons la technologie et l'expertise humaine pour aider chaque client à faire fructifier son épargne selon ses objectifs de vie.
            </p>

            <div className="flex gap-5 mb-6">
              <a href="#" className="flex items-center gap-1 text-[12px] text-muted hover:text-vert transition-colors">
                <IconWorld size={14} className="text-vert" /> nalo.fr
              </a>
              <a href="#" className="flex items-center gap-1 text-[12px] text-muted hover:text-vert transition-colors">
                <IconBrandLinkedin size={14} className="text-vert" /> LinkedIn
              </a>
              <a href="#" className="flex items-center gap-1 text-[12px] text-muted hover:text-vert transition-colors">
                <IconBrandTwitter size={14} className="text-vert" /> Twitter
              </a>
              <span className="flex items-center gap-1 text-[12px] text-muted">
                <IconCalendar size={14} className="text-vert" /> Fondée en 2017
              </span>
            </div>

            <div className="flex gap-10 pt-5 border-t border-bordure">
              {[["2 140","Abonnés Finko"],["34","Publications"],["8","Webinaires organisés"],["4.8 ★","Score crédibilité"]].map(([n,l]) => (
                <div key={l}>
                  <div className="text-[20px] font-semibold text-vert">{n}</div>
                  <div className="text-[11px] text-[#888] mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>

          {/* TABS + CONTENT */}
          <div>
            <div className="bg-fond border border-bordure rounded-2xl rounded-b-none">
              <div className="flex border-b border-bordure">
                {([
                  { id: 'publications', icon: <IconFileText size={15} />, label: 'Publications' },
                  { id: 'webinaires',   icon: <IconVideo size={15} />,    label: 'Webinaires'   },
                  { id: 'apropos',      icon: <IconInfoCircle size={15} />,label: 'À propos'     },
                ] as { id: TabId; icon: React.ReactNode; label: string }[]).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-6 py-3.5 text-[13px] font-medium border-b-2 -mb-px transition-colors cursor-pointer bg-transparent ${
                      tab === t.id
                        ? 'text-vert border-vert'
                        : 'text-[#888] border-transparent hover:text-texte'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-fond border border-t-0 border-bordure rounded-b-2xl p-6">

              {/* PUBLICATIONS */}
              {tab === 'publications' && (
                <div>
                  {POSTS.map((p, i) => (
                    <div key={i} className="flex gap-3.5 py-5 border-b border-bordure last:border-0">
                      <div className="w-9 h-9 rounded-xl bg-[#1a5e8c] flex items-center justify-center text-[13px] font-bold text-white shrink-0">NA</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-[#aaa] mb-1.5">
                          <span className="bg-[#E1F5EE] text-vert-dark px-2 py-0.5 rounded-full text-[10px] font-medium">{p.type}</span>
                          Nalo · {p.age}
                        </div>
                        <h3 className="text-[14px] font-medium leading-[1.35] mb-1.5">{p.title}</h3>
                        <p className="text-[13px] text-muted leading-relaxed mb-3">{p.text}</p>
                        <div className="flex gap-5">
                          <button className="flex items-center gap-1 text-[12px] text-[#888] hover:text-vert transition-colors cursor-pointer">
                            <IconHeart size={14} /> {p.likes}
                          </button>
                          <button className="flex items-center gap-1 text-[12px] text-[#888] hover:text-vert transition-colors cursor-pointer">
                            <IconMessageCircle size={14} /> {p.comments}
                          </button>
                          <button className="flex items-center gap-1 text-[12px] text-[#888] hover:text-vert transition-colors cursor-pointer">
                            <IconShare size={14} /> {p.shares}
                          </button>
                          <button className="flex items-center gap-1 text-[12px] text-[#888] hover:text-vert transition-colors cursor-pointer">
                            <IconBookmark size={14} /> Sauvegarder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WEBINAIRES */}
              {tab === 'webinaires' && (
                <div>
                  <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
                    <IconCalendar size={13} /> À venir
                  </p>
                  {/* Upcoming */}
                  <div className="flex gap-4 bg-fond-gris rounded-xl p-5 border border-bordure mb-4">
                    <div className="bg-vert text-white rounded-lg px-3.5 py-2.5 text-center shrink-0 min-w-[52px]">
                      <div className="text-[20px] font-semibold leading-none">24</div>
                      <div className="text-[10px] uppercase tracking-wide">Juin</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[14px] font-medium mb-1">Construire son portefeuille ETF de A à Z</h3>
                      <div className="flex items-center gap-3 text-[12px] text-[#888] mb-3">
                        <span className="flex items-center gap-1"><IconClock size={14} className="text-vert" /> 18h30 – 19h30</span>
                        <span className="flex items-center gap-1"><IconUsers size={14} className="text-vert" /> 247 inscrits</span>
                        <span className="flex items-center gap-1"><IconVideo size={14} className="text-vert" /> En ligne</span>
                      </div>
                      <div className="flex gap-1.5 mb-3">
                        {['ETF','Débutant','Portefeuille'].map(t => (
                          <span key={t} className="text-[10px] bg-[#E1F5EE] text-vert-dark px-2.5 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                      <button className="flex items-center gap-1.5 bg-vert text-white border-none px-4 py-2 rounded-lg text-[12px] font-medium cursor-pointer hover:bg-vert-hover transition-colors">
                        <IconBell size={13} /> S'inscrire — Gratuit
                      </button>
                    </div>
                  </div>
                  {/* Live */}
                  <div className="flex gap-4 bg-fond-gris rounded-xl p-5 border border-bordure">
                    <div className="bg-[#E24B4A] text-white rounded-lg px-3.5 py-2.5 text-center shrink-0 min-w-[52px]">
                      <div className="text-[12px] font-medium leading-none flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                      </div>
                      <div className="text-[10px] uppercase tracking-wide mt-1">Maintenant</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[14px] font-medium mb-1">Q&A mensuel — Vos questions sur l'assurance-vie</h3>
                      <div className="flex items-center gap-3 text-[12px] text-[#888] mb-3">
                        <span className="flex items-center gap-1"><IconUsers size={14} className="text-vert" /> 183 connectés</span>
                        <span className="flex items-center gap-1"><IconVideo size={14} className="text-vert" /> En direct</span>
                      </div>
                      <div className="flex gap-1.5 mb-3">
                        {["Assurance-vie","Q&A"].map(t => (
                          <span key={t} className="text-[10px] bg-[#E1F5EE] text-vert-dark px-2.5 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                      <button className="flex items-center gap-1.5 bg-[#E24B4A] text-white border-none px-4 py-2 rounded-lg text-[12px] font-medium cursor-pointer hover:opacity-90 transition-opacity">
                        <IconPlayerPlay size={13} /> Rejoindre maintenant
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-bordure">
                    <p className="text-[11px] font-medium tracking-[2px] uppercase text-[#888] mb-4 flex items-center gap-1.5">
                      <IconHistory size={13} /> Replays disponibles
                    </p>
                    <div className="flex gap-4 bg-fond-gris rounded-xl p-5 border border-bordure">
                      <div className="bg-[#e5e5e5] text-[#888] rounded-lg px-3.5 py-2.5 text-center shrink-0 min-w-[52px]">
                        <div className="text-[14px] font-medium leading-none">Replay</div>
                        <div className="text-[10px] uppercase tracking-wide mt-1">Mai 26</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[14px] font-medium mb-1">Retraite : PER ou assurance-vie, comment choisir ?</h3>
                        <div className="flex items-center gap-3 text-[12px] text-[#888] mb-3">
                          <span className="flex items-center gap-1"><IconUsers size={14} className="text-vert" /> 412 vues</span>
                          <span className="flex items-center gap-1"><IconClock size={14} className="text-vert" /> 58 min</span>
                        </div>
                        <div className="flex gap-1.5 mb-3">
                          {["Retraite","PER"].map(t => (
                            <span key={t} className="text-[10px] bg-[#E1F5EE] text-vert-dark px-2.5 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                        <button className="flex items-center gap-1.5 bg-[#888] text-white border-none px-4 py-2 rounded-lg text-[12px] font-medium cursor-pointer hover:opacity-90 transition-opacity">
                          <IconPlayerPlay size={13} /> Voir le replay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* À PROPOS */}
              {tab === 'apropos' && (
                <div>
                  <div className="mb-8">
                    <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
                      <IconInfoCircle size={13} /> Notre mission
                    </p>
                    <p className="text-[14px] text-muted leading-[1.7]">
                      Chez Nalo, nous croyons que chaque personne mérite un accompagnement patrimonial de qualité, sans frais excessifs ni jargon incompréhensible. Notre plateforme combine l'intelligence artificielle et l'expertise humaine pour créer des portefeuilles personnalisés alignés sur vos objectifs de vie réels.
                    </p>
                  </div>
                  <div className="mb-8">
                    <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
                      <IconChartBar size={13} /> Chiffres clés
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        ["Encours gérés","+800 M€"],["Clients actifs","25 000+"],
                        ["Rendement moyen (5 ans)","+6,4 % / an"],["Frais de gestion","1,6 % / an"],
                        ["Fondée en","2017 — Paris"],["Régulation","AMF / ACPR"],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-fond-gris rounded-xl p-4">
                          <div className="text-[11px] text-[#aaa] mb-1">{label}</div>
                          <div className="text-[14px] font-medium">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
                      <IconUsers size={13} /> L'équipe
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { initials: "JC", bg: "bg-[#E6F1FB]", color: "text-[#185FA5]", name: "Jean Cnudde", role: "CEO & Co-fondateur" },
                        { initials: "WM", bg: "bg-[#E1F5EE]", color: "text-vert-dark", name: "William Méausoone", role: "CTO & Co-fondateur" },
                        { initials: "SL", bg: "bg-[#FAEEDA]", color: "text-[#854F0B]", name: "Sophie L.", role: "Directrice Marketing" },
                        { initials: "PD", bg: "bg-[#E6F1FB]", color: "text-[#185FA5]", name: "Pierre D.", role: "Conseiller Patrimonial" },
                      ].map(m => (
                        <div key={m.initials} className="flex items-center gap-2.5 bg-fond-gris rounded-xl p-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0 ${m.bg} ${m.color}`}>{m.initials}</div>
                          <div>
                            <div className="text-[13px] font-medium">{m.name}</div>
                            <div className="text-[11px] text-[#888]">{m.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="flex flex-col gap-4">
            {/* Stats */}
            <div className="bg-fond border border-bordure rounded-2xl p-5">
              <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
                <IconChartBar size={13} /> Présence Finko
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[["2 140","Abonnés"],["34","Publications"],["8","Webinaires"],["4.8","Score"]].map(([n,l]) => (
                  <div key={l} className="bg-fond-gris rounded-xl p-3.5 text-center">
                    <div className="text-[18px] font-semibold text-vert">{n}</div>
                    <div className="text-[10px] text-[#888] mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-bordure">
                <p className="text-[12px] text-muted leading-relaxed">Membre Finko Pro depuis <strong>janvier 2026</strong></p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] bg-[#E1F5EE] text-vert-dark px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <IconShieldCheck size={12} /> Partenaire vérifié
                  </span>
                </div>
              </div>
            </div>

            {/* Similar */}
            <div className="bg-fond border border-bordure rounded-2xl p-5">
              <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
                <IconBuilding size={13} /> Entreprises similaires
              </p>
              {[
                { i:"YO", bg:"bg-[#E6F1FB]", c:"text-[#185FA5]", name:"Yomoni",  cat:"Gestion pilotée" },
                { i:"LX", bg:"bg-[#E1F5EE]", c:"text-vert-dark", name:"Linxea",  cat:"Assurance-vie"   },
                { i:"CB", bg:"bg-[#FEF3E2]", c:"text-[#92400E]", name:"Cashbee", cat:"Livrets & Épargne"},
              ].map(s => (
                <div key={s.name} className="flex items-center gap-2.5 py-3 border-b border-bordure last:border-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0 ${s.bg} ${s.c}`}>{s.i}</div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{s.name}</div>
                    <div className="text-[11px] text-[#888]">{s.cat}</div>
                  </div>
                  <button className="text-[11px] text-vert border border-[#9FE1CB] px-3 py-1 rounded-full bg-fond cursor-pointer hover:bg-[#E1F5EE] transition-colors">
                    Suivre
                  </button>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-2xl p-5">
              <p className="text-[13px] font-medium text-vert-dark mb-1.5">Vous êtes une entreprise ?</p>
              <p className="text-[12px] text-[#0F6E56] leading-relaxed mb-4">Créez votre profil Finko et touchez une audience qualifiée en finance personnelle.</p>
              <Link
                href="/entreprises"
                className="flex items-center gap-1.5 bg-vert text-white px-3.5 py-2.5 rounded-lg text-[12px] font-medium hover:bg-vert-hover transition-colors"
              >
                <IconRocket size={14} /> Créer mon espace entreprise
              </Link>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
