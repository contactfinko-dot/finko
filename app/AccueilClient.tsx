'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IconMessages, IconNews, IconVideo, IconUsers, IconUserPlus, IconArrowRight,
} from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'
import { supabase } from '@/lib/supabase'
import { captureEmail } from '@/lib/capture'

type TickerItem = { label: string; sym: string; price: number; pct: number }
type FeedPost = { i: string; bg: string; c: string; name: string; text: string; tag: string }

const TICKER_FALLBACK: TickerItem[] = [
  { label: 'CAC 40',        sym: '^FCHI',     price: 8447.27,  pct: 0.75  },
  { label: 'Euro Stoxx 50', sym: '^STOXX50E', price: 6257.42,  pct: 0.45  },
  { label: 'Dow Jones',     sym: '^DJI',      price: 51999.67, pct: 0.64  },
  { label: 'S&P 500',       sym: '^GSPC',     price: 5432.0,   pct: 0.45  },
  { label: 'Nasdaq',        sym: '^IXIC',     price: 17420.0,  pct: 0.49  },
  { label: 'EUR/USD',       sym: 'EURUSD=X',  price: 1.1608,   pct: 0.15  },
  { label: 'Or',            sym: 'GC=F',      price: 4353.0,   pct: 0.03  },
  { label: 'Bitcoin',       sym: 'BTC-USD',   price: 56586,    pct: -1.13 },
  { label: 'Nikkei 225',    sym: '^N225',     price: 38240.0,  pct: 0.47  },
  { label: 'FTSE 100',      sym: '^FTSE',     price: 8190.0,   pct: 0.51  },
  { label: 'LVMH',          sym: 'MC.PA',     price: 612.0,    pct: -0.39 },
  { label: 'Hermès',        sym: 'RMS.PA',    price: 2180.0,   pct: 0.55  },
]

function fmtPrice(n: number, sym: string): string {
  if (sym === 'EURUSD=X') return n.toFixed(4)
  if (sym === 'BTC-USD') return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  if (sym === 'MC.PA' || sym === 'RMS.PA') return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' €'
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
}

const PILLARS = [
  {
    icon: IconMessages,
    title: 'Échanges entre pairs',
    text: 'Partage tes questions, tes doutes et tes expériences avec des gens qui vivent la même chose que toi.',
  },
  {
    icon: IconNews,
    title: 'Actualités décryptées',
    text: "L'actu des marchés expliquée simplement. Ce qui compte pour toi, pas pour les pros.",
  },
  {
    icon: IconVideo,
    title: 'Webinaires et experts',
    text: 'Des professionnels viennent présenter leurs produits et répondre à tes questions en direct.',
  },
]

const FEED_FALLBACK: FeedPost[] = [
  { i: 'MK', bg: '#E1F5EE', c: '#0F6E56', name: 'Marie K.',  text: "J'ai renforcé $LVMH ce matin. Je partage mon raisonnement, pas une recommandation.", tag: 'Actions' },
  { i: 'TL', bg: '#E6F1FB', c: '#185FA5', name: 'Thomas L.', text: "Quelqu'un a des SCPI en démembrement ? Je cherche des retours d'expérience.",         tag: 'SCPI'    },
  { i: 'SR', bg: '#FAEEDA', c: '#854F0B', name: 'Sara R.',   text: 'ETF World à 10k€ ce mois. 3 ans à 200€/mois. Je partage le parcours.',              tag: 'ETF'     },
]

const AV_PALETTE = [
  { bg: '#E1F5EE', c: '#0F6E56' },
  { bg: '#E6F1FB', c: '#185FA5' },
  { bg: '#FAEEDA', c: '#854F0B' },
]

/* Section qui apparaît en douceur à l'entrée dans le viewport */
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          el.classList.add('reveal-visible')
          obs.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')

  function subscribe() {
    const v = email.trim()
    if (!v || !v.includes('@')) { alert('Email invalide.'); return }
    setStatus('sending')
    captureEmail(v, 'landing')
    setTimeout(() => { setStatus('done'); setEmail('') }, 500)
  }

  return (
    <div className="flex gap-2 justify-center flex-wrap">
      <label htmlFor="newsletter-email" className="sr-only">Ton adresse email</label>
      <input
        id="newsletter-email"
        type="email"
        placeholder="ton@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') subscribe() }}
        className="px-3.5 py-[11px] rounded-md text-[14px] w-[240px] outline-none font-sans border border-[#ccc] bg-fond text-texte focus:border-vert"
      />
      <button
        onClick={subscribe}
        disabled={status !== 'idle'}
        className={`text-white border-none rounded-md text-[14px] font-medium cursor-pointer font-sans transition-colors disabled:cursor-default px-[22px] py-[11px] ${
          status === 'done' ? 'bg-[#0F6E56]' : 'bg-vert hover:bg-vert-hover'
        }`}
      >
        {status === 'sending' ? 'Envoi...' : status === 'done' ? '✓ Inscrit !' : "Recevoir l'actu"}
      </button>
    </div>
  )
}

export default function AccueilClient() {
  const [ticker, setTicker] = useState<TickerItem[]>(TICKER_FALLBACK)
  const [feed, setFeed] = useState<FeedPost[]>(FEED_FALLBACK)

  useEffect(() => {
    async function refresh() {
      try {
        const r = await fetch('/api/ticker')
        const items: TickerItem[] = await r.json()
        if (items.length) setTicker(items)
      } catch { /* fallback statique conservé */ }
    }
    refresh()
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    supabase
      .from('posts')
      .select('prenom, content, category')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        setFeed(data.map((p, i) => {
          const pal = AV_PALETTE[i % AV_PALETTE.length]
          const text = p.content.length > 110 ? p.content.slice(0, 110) + '…' : p.content
          return {
            i: (p.prenom?.[0] || '?').toUpperCase(),
            bg: pal.bg,
            c: pal.c,
            name: p.prenom,
            text,
            tag: p.category === 'general' ? 'Général' : p.category.charAt(0).toUpperCase() + p.category.slice(1),
          }
        }))
      })
  }, [])

  return (
    <div className="bg-fond text-texte font-sans">
      <Nav />

      {/* HERO */}
      <div className="relative w-full h-[520px] max-md:h-[560px] overflow-hidden">
        <Image
          src="/accueil-hero.jpg"
          alt="Communauté Finko"
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.6]"
          style={{ objectPosition: 'center 25%' }}
        />
        {/* Dégradé pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 animate-fade-in">
          <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-[#5DCAA5] mb-4">
            Entraide · Partage · Finance
          </p>
          <h1 className="text-[46px] max-md:text-[30px] font-semibold leading-[1.1] tracking-[-1.5px] text-white max-w-[600px] mb-[1.1rem]">
            La finance, on en parle <em className="not-italic text-[#5DCAA5]">ensemble</em>
          </h1>
          <p className="text-[17px] max-md:text-[15px] text-white/75 max-w-[440px] leading-[1.65] mb-8">
            Rejoins des curieux qui partagent leurs expériences d&apos;investissement. Sans jargon, sans vendeur, entre pairs.
          </p>

          {/* CTA principal : création de compte */}
          <div className="flex gap-3 justify-center max-md:flex-col max-md:items-center max-md:w-full">
            <Link
              href="/connexion?tab=register"
              className="bg-vert text-white px-7 py-3.5 rounded-lg text-[14px] font-medium hover:bg-vert-hover transition-colors max-md:w-full max-md:max-w-[300px] max-md:text-center"
            >
              Créer mon compte gratuit
            </Link>
            <Link
              href="/communaute"
              className="border border-white/40 text-white px-7 py-3.5 rounded-lg text-[14px] font-medium bg-white/10 hover:bg-white/20 transition-colors max-md:w-full max-md:max-w-[300px] max-md:text-center"
            >
              Découvrir la communauté
            </Link>
          </div>

          {/* Preuve sociale */}
          <div className="flex items-center gap-2.5 mt-7">
            <div className="flex -space-x-2">
              {[
                { i: 'MK', bg: '#E1F5EE', c: '#0F6E56' },
                { i: 'TL', bg: '#E6F1FB', c: '#185FA5' },
                { i: 'SR', bg: '#FAEEDA', c: '#854F0B' },
                { i: 'JD', bg: '#EEEDFE', c: '#3C3489' },
              ].map(a => (
                <div
                  key={a.i}
                  className="w-7 h-7 rounded-full border-2 border-white/80 flex items-center justify-center text-[9px] font-semibold"
                  style={{ background: a.bg, color: a.c }}
                >
                  {a.i}
                </div>
              ))}
            </div>
            <span className="text-[13px] text-white/80">Déjà <strong className="text-white">2 400 membres</strong></span>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div className="w-full overflow-hidden border-b border-bordure bg-fond group" aria-hidden="true">
        <div
          className="inline-flex group-hover:[animation-play-state:paused] motion-reduce:[animation:none]"
          style={{ animation: 'ticker-scroll 35s linear infinite' }}
        >
          {[...ticker, ...ticker].map((t, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-5 py-2.5 border-r border-bordure shrink-0">
              <span className="text-[12px] font-semibold text-vert">{t.label}</span>
              <span className="text-[12px] text-[#888]">{fmtPrice(t.price, t.sym)}</span>
              <span className={`text-[11px] ${t.pct >= 0 ? 'text-vert' : 'text-[#E24B4A]'}`}>
                {t.pct >= 0 ? '▲ +' : '▼ '}{Math.abs(t.pct).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        <style>{`@keyframes ticker-scroll { to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* PILIERS */}
      <Reveal>
        <div className="grid grid-cols-3 max-md:grid-cols-1 border-b border-bordure">
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className={`p-10 px-8 transition-all hover:-translate-y-1 hover:shadow-lg ${
                  i < 2 ? 'md:border-r border-bordure max-md:border-b' : ''
                }`}
              >
                <div className="w-10 h-10 bg-[#E1F5EE] rounded-[10px] flex items-center justify-center mb-5">
                  <Icon size={20} className="text-vert" />
                </div>
                <h3 className="text-[16px] font-medium mb-2.5">{p.title}</h3>
                <p className="text-[13px] text-[#555] leading-relaxed">{p.text}</p>
              </div>
            )
          })}
        </div>
      </Reveal>

      {/* CTA BANNER */}
      <Reveal>
        <div className="px-10 py-7 max-md:px-5 border-b border-bordure">
          <div className="bg-[#E1F5EE] rounded-xl px-7 py-6 flex justify-between items-center border border-[#9FE1CB] max-md:flex-col max-md:gap-4 max-md:text-center">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-vert rounded-[10px] flex items-center justify-center shrink-0">
                <IconUsers size={22} className="text-white" />
              </div>
              <div>
                <div className="text-[14px] font-medium text-[#085041] mb-[3px]">
                  Tu veux partager ton expérience avec la communauté ?
                </div>
                <div className="text-[13px] text-[#0F6E56]">Rejoins 2 400 membres et publie ton premier post</div>
              </div>
            </div>
            <Link
              href="/connexion?tab=register"
              className="bg-vert text-white px-5 py-[11px] rounded-lg text-[13px] font-medium flex items-center gap-[7px] hover:bg-vert-hover transition-colors shrink-0"
            >
              <IconUserPlus size={16} /> Rejoindre
            </Link>
          </div>
        </div>
      </Reveal>

      {/* PHOTO */}
      <Reveal>
        <div className="max-w-[900px] mx-auto pt-12 px-8 max-md:px-5">
          <div className="relative w-full h-[380px] max-md:h-[240px] rounded-2xl overflow-hidden">
            <Image
              src="/accueil-communaute.jpg"
              alt="Membres de la communauté Finko en discussion"
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              className="object-cover"
              style={{ objectPosition: 'center 30%' }}
            />
          </div>
        </div>
      </Reveal>

      {/* COMMUNAUTÉ */}
      <Reveal>
        <div className="grid grid-cols-2 max-md:grid-cols-1 max-w-[900px] mx-auto py-16 px-8 gap-16 max-md:gap-8 max-md:py-8 max-md:px-5 items-center">
          <div>
            <h2 className="text-[30px] font-medium tracking-[-0.75px] leading-[1.2] mb-4">
              Des vraies personnes, de vraies expériences
            </h2>
            <p className="text-[14px] text-[#555] leading-[1.7] mb-7">
              Ici personne ne te vend rien. Les membres partagent ce qu&apos;ils font, ce qui a marché et ce qui n&apos;a pas marché. Tu construis ta propre vision.
            </p>
            <Link
              href="/communaute"
              className="inline-flex items-center gap-1.5 bg-vert text-white px-[18px] py-2.5 rounded-md text-[13px] font-medium hover:bg-vert-hover transition-colors"
            >
              <IconArrowRight size={16} /> Rejoindre la communauté
            </Link>
          </div>
          <div className="border border-bordure rounded-xl overflow-hidden">
            <div className="px-5 py-[0.9rem] border-b border-bordure text-[12px] font-medium text-[#888] flex items-center gap-[7px]">
              <span className="w-[7px] h-[7px] bg-vert rounded-full animate-pulse" /> En ce moment sur Finko
            </div>
            {feed.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className={`px-5 py-4 flex gap-2.5 hover:bg-[#f8f8f6] transition-colors ${
                  i < feed.length - 1 ? 'border-b border-bordure' : ''
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                  style={{ background: p.bg, color: p.c }}
                >
                  {p.i}
                </div>
                <div>
                  <div className="text-[12px] font-medium mb-[3px]">{p.name}</div>
                  <div className="text-[12px] text-[#555] leading-[1.45]">{p.text}</div>
                  <span className="inline-block text-[10px] text-vert border border-[#9FE1CB] px-2 py-0.5 rounded-[10px] mt-[5px]">
                    {p.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* NEWSLETTER */}
      <Reveal>
        <div className="border-t border-bordure py-16 px-8 text-center">
          <h2 className="text-[28px] font-medium tracking-[-0.75px] mb-3">Reste au courant</h2>
          <p className="text-[15px] text-[#555] mb-8">
            Le meilleur de la communauté et l&apos;actu des marchés, chaque semaine dans ta boîte mail.
          </p>
          <NewsletterForm />
          <p className="text-[11px] text-[#aaa] mt-3">
            Finko n&apos;est pas un conseiller financier. Les échanges sont des opinions personnelles.
          </p>
        </div>
      </Reveal>

      <Footer />
    </div>
  )
}
