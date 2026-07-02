'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IconMessages, IconNews, IconVideo, IconUsers, IconUserPlus, IconArrowRight,
} from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'

type TickerItem = { label: string; value: string; pct: number }

const TICKER_FALLBACK: TickerItem[] = [
  { label: 'CAC 40',        value: '8 447,27',  pct: 0.75  },
  { label: 'Euro Stoxx 50', value: '6 257,42',  pct: 0.45  },
  { label: 'Dow Jones',     value: '51 999,67', pct: 0.64  },
  { label: 'S&P 500',       value: '5 432,00',  pct: 0.45  },
  { label: 'Nasdaq',        value: '17 420,00', pct: 0.49  },
  { label: 'EUR/USD',       value: '1,1608',    pct: 0.15  },
  { label: 'Or',            value: '4 353,00',  pct: 0.03  },
  { label: 'Bitcoin',       value: '56 586',    pct: -1.13 },
  { label: 'Nikkei 225',    value: '38 240,00', pct: 0.47  },
  { label: 'FTSE 100',      value: '8 190,00',  pct: 0.51  },
  { label: 'LVMH',          value: '612,00 €',  pct: -0.39 },
  { label: 'Hermès',        value: '2 180,00 €', pct: 0.55 },
]

const SYMS = [
  { sym: '^FCHI',     label: 'CAC 40'        },
  { sym: '^STOXX50E', label: 'Euro Stoxx 50' },
  { sym: '^DJI',      label: 'Dow Jones'     },
  { sym: '^GSPC',     label: 'S&P 500'       },
  { sym: '^IXIC',     label: 'Nasdaq'        },
  { sym: 'EURUSD=X',  label: 'EUR/USD'       },
  { sym: 'GC=F',      label: 'Or'            },
  { sym: 'BTC-USD',   label: 'Bitcoin'       },
  { sym: '^N225',     label: 'Nikkei 225'    },
  { sym: '^FTSE',     label: 'FTSE 100'      },
  { sym: 'MC.PA',     label: 'LVMH'          },
  { sym: 'RMS.PA',    label: 'Hermès'        },
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

const FEED_POSTS = [
  { i: 'MK', bg: '#E1F5EE', c: '#0F6E56', name: 'Marie K.',  text: "J'ai renforcé $LVMH ce matin. Je partage mon raisonnement, pas une recommandation.", tag: 'Actions' },
  { i: 'TL', bg: '#E6F1FB', c: '#185FA5', name: 'Thomas L.', text: "Quelqu'un a des SCPI en démembrement ? Je cherche des retours d'expérience.",         tag: 'SCPI'    },
  { i: 'SR', bg: '#FAEEDA', c: '#854F0B', name: 'Sara R.',   text: 'ETF World à 10k€ ce mois. 3 ans à 200€/mois. Je partage le parcours.',              tag: 'ETF'     },
]

function NewsletterForm({ variant }: { variant: 'hero' | 'bottom' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')

  function subscribe() {
    const v = email.trim()
    if (!v || !v.includes('@')) { alert('Email invalide.'); return }
    setStatus('sending')
    fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK || '', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: v, source: 'landing' }),
    }).catch(() => {})
    setTimeout(() => { setStatus('done'); setEmail('') }, 500)
  }

  const isHero = variant === 'hero'
  return (
    <div className={`flex gap-2 justify-center ${isHero ? 'max-md:flex-col max-md:items-center' : 'flex-wrap'}`}>
      <input
        type="email"
        placeholder="ton@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') subscribe() }}
        className={
          isHero
            ? 'px-4 py-3 rounded-md text-[14px] w-[220px] outline-none font-sans border border-white/30 bg-white/10 text-white placeholder:text-white/50 max-md:w-full max-md:max-w-[300px]'
            : 'px-3.5 py-[11px] rounded-md text-[14px] w-[240px] outline-none font-sans border border-[#ccc] bg-fond text-texte'
        }
      />
      <button
        onClick={subscribe}
        disabled={status !== 'idle'}
        className={`text-white border-none rounded-md text-[14px] font-medium cursor-pointer font-sans transition-colors disabled:cursor-default ${
          status === 'done' ? 'bg-[#0F6E56]' : 'bg-vert hover:bg-vert-hover'
        } ${isHero ? 'px-[22px] py-3 max-md:w-full max-md:max-w-[300px]' : 'px-[22px] py-[11px]'}`}
      >
        {status === 'sending' ? 'Envoi...' : status === 'done' ? '✓ Inscrit !' : isHero ? 'Rejoindre' : 'Rejoindre Finko'}
      </button>
    </div>
  )
}

export default function AccueilClient() {
  const [ticker, setTicker] = useState<TickerItem[]>(TICKER_FALLBACK)

  useEffect(() => {
    async function refresh() {
      const res = await Promise.allSettled(SYMS.map(async s => {
        const yf = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.sym)}?range=1d&interval=1d`
        const r = await fetch('https://corsproxy.io/?' + encodeURIComponent(yf))
        const d = await r.json()
        const m = d.chart.result[0].meta
        const price = m.regularMarketPrice
        const prev = m.chartPreviousClose || m.previousClose
        return { label: s.label, value: fmtPrice(price, s.sym), pct: (price - prev) / prev * 100 }
      }))
      const valid = res.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<TickerItem>).value)
      if (valid.length) setTicker(valid)
    }
    refresh()
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-fond text-texte font-sans">
      <Nav />

      {/* HERO */}
      <div className="relative w-full h-[500px] overflow-hidden">
        <img
          src="/accueil-hero.jpg"
          alt="Communauté Finko"
          className="w-full h-full object-cover brightness-[0.65]"
          style={{ objectPosition: 'center 25%' }}
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 animate-fade-in">
          <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-[#5DCAA5] mb-4">
            Entraide · Partage · Finance
          </p>
          <h1 className="text-[46px] max-md:text-[28px] font-semibold leading-[1.1] tracking-[-1.5px] text-white max-w-[600px] mb-[1.1rem]">
            La finance, on en parle <em className="not-italic text-[#5DCAA5]">ensemble</em>
          </h1>
          <p className="text-[17px] text-white/70 max-w-[440px] leading-[1.65] mb-10">
            Rejoins des curieux qui partagent leurs expériences d&apos;investissement. Sans jargon, sans vendeur, entre pairs.
          </p>
          <NewsletterForm variant="hero" />
        </div>
      </div>

      {/* TICKER */}
      <div className="w-full overflow-hidden border-b border-bordure bg-fond group">
        <div
          className="inline-flex group-hover:[animation-play-state:paused]"
          style={{ animation: 'ticker-scroll 35s linear infinite' }}
        >
          {[...ticker, ...ticker].map((t, i) => (
            <div key={i} className="inline-flex items-center gap-2 px-5 py-2.5 border-r border-bordure shrink-0">
              <span className="text-[12px] font-semibold text-vert">{t.label}</span>
              <span className="text-[12px] text-[#888]">{t.value}</span>
              <span className={`text-[11px] ${t.pct >= 0 ? 'text-vert' : 'text-[#E24B4A]'}`}>
                {t.pct >= 0 ? '▲ +' : '▼ '}{Math.abs(t.pct).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        <style>{`@keyframes ticker-scroll { to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* PILIERS */}
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

      {/* CTA BANNER */}
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
            href="/connexion"
            className="bg-vert text-white px-5 py-[11px] rounded-lg text-[13px] font-medium flex items-center gap-[7px] hover:bg-vert-hover transition-colors shrink-0"
          >
            <IconUserPlus size={16} /> Rejoindre
          </Link>
        </div>
      </div>

      {/* PHOTO */}
      <div className="max-w-[900px] mx-auto pt-12 px-8">
        <img
          src="/accueil-communaute.jpg"
          alt="Communauté Finko"
          className="w-full h-[380px] object-cover rounded-2xl"
          style={{ objectPosition: 'center 30%' }}
        />
      </div>

      {/* COMMUNAUTÉ */}
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
          {FEED_POSTS.map((p, i) => (
            <div
              key={p.name}
              className={`px-5 py-4 flex gap-2.5 hover:bg-[#f8f8f6] transition-colors ${
                i < FEED_POSTS.length - 1 ? 'border-b border-bordure' : ''
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

      {/* CTA BAS */}
      <div className="border-t border-bordure py-16 px-8 text-center">
        <h2 className="text-[28px] font-medium tracking-[-0.75px] mb-3">Prêt à rejoindre la communauté ?</h2>
        <p className="text-[15px] text-[#555] mb-8">Gratuit, sans engagement, sans transaction financière.</p>
        <NewsletterForm variant="bottom" />
        <p className="text-[11px] text-[#aaa] mt-3">
          Finko n&apos;est pas un conseiller financier. Les échanges sont des opinions personnelles.
        </p>
      </div>

      <Footer />
    </div>
  )
}
