'use client'

import { useState } from 'react'
import {
  IconStar, IconCalendar, IconUsers, IconClock, IconVideo,
  IconBell, IconChartBar, IconSpeakerphone, IconMail,
} from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'

const FILTERS = ['Tous', 'Immobilier', 'ETF', 'PER', 'Fiscalité', 'IA & Finance', 'Débutant']

const CARDS = [
  {
    accent: 'bg-vert',
    title: "ETF World vs ETF Europe : lequel choisir en 2026 ?",
    desc: "Avec la volatilité des marchés US, de plus en plus de membres s'interrogent sur la diversification Europe.",
    hostName: "Sophie L.",
    hostRole: "Gestionnaire de portefeuille",
    inscrits: 147,
  },
  {
    accent: 'bg-[#EF9F27]',
    title: "PER avant fin d'année : optimiser sa déduction fiscale",
    desc: "Comment calculer son plafond, quand verser et choisir ses supports pour maximiser l'avantage fiscal.",
    hostName: "Thomas R.",
    hostRole: "Conseiller patrimonial",
    inscrits: 203,
  },
  {
    accent: 'bg-[#E24B4A]',
    title: "SCPI 2026 : les rendements résistent, mais jusqu'où ?",
    desc: "Analyse des SCPI les plus performantes et perspectives dans un contexte de taux en baisse.",
    hostName: "Pierre H.",
    hostRole: "Directeur de fonds immobilier",
    inscrits: 89,
  },
  {
    accent: 'bg-[#7F77DD]',
    title: "IA et finance : ce que l'intelligence artificielle change pour les investisseurs",
    desc: "Robo-advisors, analyse de données, détection de tendances : ce que l'IA change concrètement.",
    hostName: "Antoine M.",
    hostRole: "Analyste fintech",
    inscrits: 271,
  },
]

export default function WebinairesClient() {
  const [activeFilter, setActiveFilter] = useState(0)
  const [featEmail, setFeatEmail] = useState('')
  const [alertEmail, setAlertEmail] = useState('')

  return (
    <div className="min-h-screen bg-fond-gris font-sans">
      <Nav />

      {/* HERO */}
      <div className="relative w-full h-[340px] overflow-hidden">
        <img
          src="/pexels-diva-plavalaguna-6147031.jpg"
          alt="Webinaires Finko"
          className="w-full h-full object-cover object-[center_30%] brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-[#5DCAA5] mb-3">Échanges en direct</p>
          <h1 className="text-[38px] font-medium tracking-tight text-white mb-3">Webinaires Finko</h1>
          <p className="text-[15px] text-white/70 max-w-[440px] leading-relaxed mb-7">
            Des professionnels répondent aux questions de la communauté en direct. Gratuit, sans pub, sans conflit d'intérêt.
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {FILTERS.map((f, i) => (
              <button
                key={f}
                onClick={() => setActiveFilter(i)}
                className={`text-[12px] border px-[14px] py-[6px] rounded-full cursor-pointer transition-all ${
                  activeFilter === i
                    ? 'bg-vert text-white border-vert'
                    : 'text-white/75 border-white/30 bg-white/10 hover:bg-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="grid max-w-[1060px] mx-auto" style={{ gridTemplateColumns: '1fr 280px' }}>

        {/* MAIN */}
        <div className="p-8">

          {/* FEATURED */}
          <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-5 flex items-center gap-1.5 mt-2">
            <IconStar size={14} /> À la une
          </p>
          <div className="rounded-2xl overflow-hidden border border-bordure grid grid-cols-2 mb-8 bg-fond">
            {/* Left */}
            <div className="p-7 border-r border-bordure flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-[#E24B4A] text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <IconClock size={12} /> Bientôt
                </span>
                <span className="text-[12px] text-[#aaa] flex items-center gap-1">
                  <IconUsers size={14} className="text-vert" /> 312 pré-inscrits
                </span>
              </div>
              <h2 className="text-[20px] font-medium leading-[1.2] tracking-tight mb-3">
                Taux immobiliers 2026 : faut-il emprunter maintenant ou attendre ?
              </h2>
              <p className="text-[13px] text-muted leading-relaxed mb-5 flex-1">
                Les taux ont chuté autour de 3% en juin 2026. La BCE hésite sur ses prochains mouvements. La communauté pose ses questions à un spécialiste.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {["Taux BCE","OAT 10 ans","Crédit immo","Timing"].map(t => (
                  <span key={t} className="text-[11px] text-vert-dark bg-[#E1F5EE] px-[10px] py-[3px] rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-fond-gris rounded-lg mb-5">
                <div className="w-8 h-8 rounded-full bg-[#ccc] blur-[5px] shrink-0" />
                <div className="blur-[3.5px] select-none flex-1">
                  <div className="text-[13px] font-medium">Marc D.</div>
                  <div className="text-[11px] text-[#888]">Directeur financement immobilier</div>
                </div>
                <span className="text-[11px] text-[#aaa] italic">Révélé bientôt</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={featEmail}
                  onChange={e => setFeatEmail(e.target.value)}
                  placeholder="ton@email.com"
                  className="flex-1 px-3 py-2.5 border border-[#ccc] rounded-lg text-[13px] outline-none focus:border-vert bg-fond text-texte"
                />
                <button className="bg-vert text-white border-none px-4 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1.5 whitespace-nowrap hover:bg-vert-hover transition-colors">
                  <IconBell size={14} /> M'inscrire
                </button>
              </div>
            </div>
            {/* Right */}
            <div className="p-7 bg-fond-gris flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-2">
                {[["312","pré-inscrits"],["45 min","durée"],["Gratuit","accès"],["Live Q&A","inclus"]].map(([n,l]) => (
                  <div key={l} className="bg-fond rounded-xl p-3.5 border border-bordure">
                    <div className="text-[20px] font-medium text-vert tracking-tight">{n}</div>
                    <div className="text-[11px] text-[#aaa] mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#E24B4A] rounded-xl p-4 text-center">
                <div className="text-[13px] font-medium text-white mb-1 flex items-center justify-center gap-1.5">
                  <IconClock size={15} /> Bientôt disponible
                </div>
                <div className="text-[12px] text-white/75">Date et intervenant révélés prochainement</div>
              </div>
            </div>
          </div>

          {/* PROCHAINS WEBINAIRES */}
          <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-5 flex items-center gap-1.5">
            <IconCalendar size={14} /> Prochains webinaires
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {CARDS.map(c => (
              <div key={c.title} className="rounded-2xl overflow-hidden border border-bordure bg-fond flex flex-col hover:-translate-y-1 transition-transform hover:shadow-lg">
                <div className={`h-1 ${c.accent}`} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-[#FCEBEB] text-[#A32D2D] text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#F09595]">
                      <IconClock size={11} /> Bientôt
                    </span>
                    <span className="text-[11px] text-[#aaa] flex items-center gap-1">
                      <IconUsers size={13} className="text-vert" /> {c.inscrits}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-medium leading-[1.3] mb-2.5">{c.title}</h3>
                  <p className="text-[12px] text-muted leading-relaxed mb-4 flex-1">{c.desc}</p>
                  <div className="flex items-center gap-1.5 px-3 py-2.5 bg-fond-gris rounded-lg mb-4">
                    <div className="w-[26px] h-[26px] rounded-full bg-[#ccc] blur-[4px] shrink-0" />
                    <div className="blur-[3px] select-none">
                      <div className="text-[12px] font-medium">{c.hostName}</div>
                      <div className="text-[10px] text-[#aaa]">{c.hostRole}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      placeholder="ton@email.com"
                      className="flex-1 min-w-0 px-2.5 py-1.5 border border-[#ccc] rounded-md text-[12px] outline-none focus:border-vert bg-fond text-texte"
                    />
                    <button className="bg-vert text-white border-none px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer flex items-center gap-1 whitespace-nowrap hover:bg-vert-hover transition-colors">
                      <IconBell size={13} /> S'inscrire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="px-6 py-8 border-l border-bordure bg-fond">

          {/* Alertes */}
          <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
            <IconBell size={13} /> Alertes webinaires
          </p>
          <div className="bg-fond-gris rounded-xl p-5 mb-8">
            <p className="text-[13px] text-muted leading-relaxed mb-4">
              Reçois un rappel dès qu'un webinaire est confirmé et avant chaque session.
            </p>
            <input
              type="email"
              value={alertEmail}
              onChange={e => setAlertEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full px-3 py-2.5 border border-[#ccc] rounded-md text-[13px] outline-none focus:border-vert bg-fond text-texte mb-2 block"
            />
            <button className="w-full bg-vert text-white border-none py-2.5 rounded-md text-[13px] font-medium cursor-pointer hover:bg-vert-hover transition-colors">
              Activer les alertes
            </button>
          </div>

          {/* Stats */}
          <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
            <IconChartBar size={13} /> En chiffres
          </p>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {[["5","webinaires prévus"],["800+","pré-inscrits"],["100%","gratuits"],["Live","Q&A inclus"]].map(([n,l]) => (
              <div key={l} className="bg-fond-gris rounded-lg p-3.5">
                <div className="text-[20px] font-medium text-vert">{n}</div>
                <div className="text-[11px] text-[#aaa] mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {/* Intervenant */}
          <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
            <IconSpeakerphone size={13} /> Tu veux intervenir ?
          </p>
          <p className="text-[13px] text-muted leading-relaxed mb-4">
            Tu es professionnel et tu veux présenter ton expertise à la communauté Finko ?
          </p>
          <button className="w-full bg-transparent text-vert border border-vert py-2.5 rounded-md text-[13px] font-medium cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#E1F5EE] transition-colors">
            <IconMail size={14} /> Nous contacter
          </button>
        </div>

      </div>

      <Footer />
    </div>
  )
}
