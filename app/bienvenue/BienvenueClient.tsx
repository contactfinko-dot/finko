'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  IconSeedling, IconPlant, IconTree, IconArrowRight, IconArrowLeft,
  IconTrendingUp, IconChartPie, IconBuilding, IconPigMoney,
  IconCurrencyBitcoin, IconReportMoney, IconSchool, IconHome,
  IconRocket, IconCheck,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

const NIVEAUX = [
  {
    id: 'debutant',
    icon: IconSeedling,
    title: 'Je débute',
    sub: "Je n'ai jamais investi, ou presque. Je veux comprendre avant d'agir.",
  },
  {
    id: 'intermediaire',
    icon: IconPlant,
    title: "J'ai commencé",
    sub: "J'ai un livret bien rempli, peut-être un PEA ou une assurance-vie. Je veux progresser.",
  },
  {
    id: 'confirme',
    icon: IconTree,
    title: "J'investis déjà",
    sub: "Mon portefeuille tourne. Je cherche des échanges de qualité entre pairs.",
  },
]

const OBJECTIFS = [
  { id: 'Débutant',    icon: IconSchool,          label: 'Apprendre les bases' },
  { id: 'ETF',         icon: IconChartPie,        label: 'Investir en ETF' },
  { id: 'Actions',     icon: IconTrendingUp,      label: 'Choisir des actions' },
  { id: 'Immobilier',  icon: IconHome,            label: 'Immobilier / SCPI' },
  { id: 'PER',         icon: IconPigMoney,        label: 'Préparer ma retraite' },
  { id: 'Fiscalité',   icon: IconReportMoney,     label: 'Payer moins d’impôts' },
  { id: 'Crypto',      icon: IconCurrencyBitcoin, label: 'Comprendre la crypto' },
  { id: 'SCPI',        icon: IconBuilding,        label: 'Revenus passifs' },
]

// Suggestion de premier post selon le niveau choisi
const FIRST_POST: Record<string, string> = {
  debutant: "Hello ! Je débute complètement en finances personnelles. Mon premier objectif : ",
  intermediaire: "Salut la communauté ! J'ai déjà un peu d'épargne de côté et je me demande quelle est la prochaine étape : ",
  confirme: "Bonjour à tous ! J'investis depuis quelques années, principalement en ",
}

export default function BienvenueClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [step, setStep] = useState(0)
  const [niveau, setNiveau] = useState<string | null>(null)
  const [objectifs, setObjectifs] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/connexion'); return }
      setUser(session.user)
    })
  }, [router])

  function toggleObjectif(id: string) {
    setObjectifs(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id])
  }

  async function finish(goCompose: boolean) {
    if (!user || !niveau) return
    setSaving(true)
    await supabase.auth.updateUser({
      data: { niveau, interests: objectifs, onboarded: true },
    })
    const target = goCompose
      ? `/communaute?compose=${encodeURIComponent(FIRST_POST[niveau] || '')}`
      : '/communaute'
    router.push(target)
  }

  const prenom = user?.user_metadata?.prenom || user?.email?.split('@')[0] || ''

  if (!user) return (
    <div className="min-h-screen bg-fond font-sans flex items-center justify-center text-muted text-[14px]">
      Chargement…
    </div>
  )

  return (
    <div className="min-h-screen bg-fond font-sans flex flex-col">
      {/* Mini nav */}
      <nav className="flex justify-between items-center px-10 max-md:px-5 py-4 border-b border-bordure">
        <div className="flex items-center gap-2 text-[19px] font-medium text-texte">
          <span className="w-2 h-2 rounded-full bg-vert" />
          fin<em className="not-italic text-vert">ko</em>
        </div>
        <button
          onClick={() => finish(false)}
          className="text-[13px] text-[#aaa] bg-transparent border-none cursor-pointer font-sans hover:text-muted transition-colors"
        >
          Passer →
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px]">

          {/* Progression */}
          <div className="flex gap-1.5 mb-10">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-vert' : 'bg-[#e5e5e5]'}`}
              />
            ))}
          </div>

          {/* ── ÉTAPE 1 : niveau ── */}
          {step === 0 && (
            <div className="animate-fade-in-up">
              <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3">
                Bienvenue{prenom ? ` ${prenom}` : ''} · 1/3
              </p>
              <h1 className="text-[28px] max-md:text-[24px] font-semibold tracking-tight mb-2">
                Où en es-tu avec tes finances ?
              </h1>
              <p className="text-[14px] text-muted mb-8">
                Il n&apos;y a pas de mauvaise réponse — ça nous aide juste à te montrer le bon contenu.
              </p>
              <div className="flex flex-col gap-3">
                {NIVEAUX.map(n => {
                  const Icon = n.icon
                  const selected = niveau === n.id
                  return (
                    <button
                      key={n.id}
                      onClick={() => setNiveau(n.id)}
                      className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left cursor-pointer font-sans transition-all bg-fond ${
                        selected ? 'border-vert bg-[#F0FAF6]' : 'border-bordure hover:border-[#9FE1CB]'
                      }`}
                    >
                      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        selected ? 'bg-vert text-white' : 'bg-[#E1F5EE] text-vert'
                      }`}>
                        <Icon size={22} />
                      </span>
                      <span>
                        <span className="block text-[15px] font-medium mb-0.5">{n.title}</span>
                        <span className="block text-[13px] text-muted leading-relaxed">{n.sub}</span>
                      </span>
                      {selected && <IconCheck size={18} className="text-vert ml-auto shrink-0 mt-1" />}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!niveau}
                className="mt-8 w-full bg-vert text-white border-none py-3.5 rounded-xl text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-vert-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continuer <IconArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── ÉTAPE 2 : objectifs ── */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3">Tes objectifs · 2/3</p>
              <h1 className="text-[28px] max-md:text-[24px] font-semibold tracking-tight mb-2">
                Qu&apos;est-ce qui t&apos;intéresse ?
              </h1>
              <p className="text-[14px] text-muted mb-8">
                Choisis-en autant que tu veux — ton fil sera personnalisé.
              </p>
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2.5">
                {OBJECTIFS.map(o => {
                  const Icon = o.icon
                  const selected = objectifs.includes(o.id)
                  return (
                    <button
                      key={o.id}
                      onClick={() => toggleObjectif(o.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left cursor-pointer font-sans transition-all bg-fond ${
                        selected ? 'border-vert bg-[#F0FAF6]' : 'border-bordure hover:border-[#9FE1CB]'
                      }`}
                    >
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        selected ? 'bg-vert text-white' : 'bg-[#E1F5EE] text-vert'
                      }`}>
                        <Icon size={18} />
                      </span>
                      <span className="text-[13px] font-medium flex-1">{o.label}</span>
                      {selected && <IconCheck size={16} className="text-vert shrink-0" />}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl text-[14px] text-muted border border-bordure bg-fond cursor-pointer font-sans hover:bg-fond-gris transition-colors"
                >
                  <IconArrowLeft size={16} /> Retour
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={objectifs.length === 0}
                  className="flex-1 bg-vert text-white border-none py-3.5 rounded-xl text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-vert-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Continuer <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : premier pas ── */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3">Dernière étape · 3/3</p>
              <h1 className="text-[28px] max-md:text-[24px] font-semibold tracking-tight mb-2">
                Fais ton premier pas 🎉
              </h1>
              <p className="text-[14px] text-muted mb-8">
                Les membres qui se présentent reçoivent en moyenne 5 réponses dans la journée.
                La communauté est bienveillante — promis.
              </p>

              <div className="bg-fond-gris border border-bordure rounded-2xl p-5 mb-6">
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#aaa] mb-2">
                  Idée de premier post
                </p>
                <p className="text-[14px] text-texte leading-relaxed italic">
                  « {FIRST_POST[niveau || 'debutant']}… »
                </p>
              </div>

              <button
                onClick={() => finish(true)}
                disabled={saving}
                className="w-full bg-vert text-white border-none py-3.5 rounded-xl text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-vert-hover disabled:opacity-60 transition-all mb-3"
              >
                <IconRocket size={16} />
                {saving ? 'Un instant…' : 'Écrire mon premier post'}
              </button>
              <button
                onClick={() => finish(false)}
                disabled={saving}
                className="w-full bg-fond text-muted border border-bordure py-3.5 rounded-xl text-[14px] cursor-pointer font-sans hover:bg-fond-gris transition-colors"
              >
                Explorer d&apos;abord la communauté
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
