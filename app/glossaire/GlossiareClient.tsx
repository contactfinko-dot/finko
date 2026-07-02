'use client'

import { useState, useEffect, useRef } from 'react'
import { IconSearch, IconLink, IconBulb, IconChartBar, IconFlame, IconPalette } from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import { TERMS, LETTERS, LETTER_COUNTS, CAT_META, type Cat, type Term } from '@/lib/data/glossaire'
import { supabase } from '@/lib/supabase'

// Catégorie admin (texte libre) → catégorie du glossaire
function mapCat(c: string): Cat {
  const s = c.toLowerCase()
  if (s.includes('bourse') || s.includes('action')) return 'bourse'
  if (s.includes('épargne') || s.includes('epargne') || s.includes('livret')) return 'epargne'
  if (s.includes('fisc') || s.includes('impôt') || s.includes('impot')) return 'fiscalite'
  if (s.includes('crédit') || s.includes('credit') || s.includes('prêt')) return 'credit'
  if (s.includes('crypto')) return 'crypto'
  return 'invest'
}

const TOP_TERMS = [
  { id: 'etf',       label: 'ETF',              views: '1.2k vues' },
  { id: 'pea',       label: 'PEA',              views: '980 vues'  },
  { id: 'interet',   label: 'Intérêts composés',views: '870 vues'  },
  { id: 'flat-tax',  label: 'Flat tax',         views: '740 vues'  },
  { id: 'inflation', label: 'Inflation',        views: '680 vues'  },
]

export default function GlossiareClient() {
  const [query,  setQuery]  = useState('')
  const [cat,    setCat]    = useState<Cat | ''>('')
  const [active, setActive] = useState('A')
  const [highlighted, setHighlighted] = useState<string | null>(null)
  const [dbTerms, setDbTerms] = useState<Term[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Termes ajoutés par l'équipe depuis l'admin
  useEffect(() => {
    supabase.from('glossary_terms').select('*').then(({ data }) => {
      if (!data) return
      const existing = new Set(TERMS.map(t => t.id))
      setDbTerms(
        (data as { slug: string; term: string; definition: string; category: string }[])
          .filter(t => !existing.has(t.slug))
          .map(t => ({
            id: t.slug,
            letter: (t.term[0] || 'A').toUpperCase(),
            name: t.term,
            cat: mapCat(t.category),
            def: t.definition,
          })),
      )
    })
  }, [])

  const allTerms = dbTerms.length ? [...TERMS, ...dbTerms].sort((a, b) => a.name.localeCompare(b.name, 'fr')) : TERMS

  const filtered = allTerms.filter(t => {
    const q = query.trim().toLowerCase()
    const matchCat  = !cat  || t.cat === cat
    const matchText = !q    || t.name.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
    return matchCat && matchText
  })

  const visibleLetters = LETTERS.filter(l => filtered.some(t => t.letter === l))

  function highlight(id: string) {
    setHighlighted(id)
    const el = document.getElementById(`term-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setHighlighted(null), 1400)
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(window.location.origin + '/glossaire#' + id)
    showToast('Lien copié !')
  }

  function showToast(msg: string) {
    const existing = document.getElementById('g-toast')
    if (existing) existing.remove()
    const t = document.createElement('div')
    t.id = 'g-toast'
    t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-texte text-white px-4 py-2 rounded-lg text-[13px] font-sans z-[9999] transition-opacity'
    t.textContent = msg
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 1800)
  }

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash) setTimeout(() => highlight(hash), 300)
  }, [])

  return (
    <div className="min-h-screen bg-fond-gris font-sans">
      <Nav />

      <div className="grid max-w-[1100px] mx-auto min-h-[calc(100vh-57px)]" style={{ gridTemplateColumns: '220px 1fr 260px' }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="border-r border-bordure bg-fond py-6 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#aaa] px-5 mb-3">Alphabet</p>
          {LETTERS.map(l => (
            <a
              key={l}
              href={`#letter-${l}`}
              onClick={() => setActive(l)}
              className={`flex items-center gap-2 px-5 py-1.5 text-[13px] border-l-2 transition-all ${
                active === l
                  ? 'text-vert font-medium border-vert bg-[#E1F5EE]'
                  : 'text-[#555] border-transparent hover:text-texte hover:bg-fond-gris'
              }`}
            >
              {l}
              <span className={`ml-auto text-[11px] px-1.5 py-px rounded-full ${active === l ? 'bg-[#C8EFE1] text-[#0F6E56]' : 'bg-fond-gris text-[#aaa]'}`}>
                {LETTER_COUNTS[l]}
              </span>
            </a>
          ))}

          <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#aaa] px-5 mt-6 mb-3">Catégories</p>
          <div className="px-5 flex flex-col gap-1">
            <button
              onClick={() => setCat('')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-left transition-colors ${!cat ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium' : 'text-[#555] hover:bg-fond-gris'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-vert shrink-0" /> Tous
            </button>
            {(Object.entries(CAT_META) as [Cat, typeof CAT_META[Cat]][]).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setCat(cat === key ? '' : key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-left transition-colors ${cat === key ? 'font-medium' : 'text-[#555] hover:bg-fond-gris'}`}
                style={cat === key ? { background: meta.bg, color: meta.color } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
                {meta.label}
              </button>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="border-r border-bordure">
          {/* Search bar */}
          <div className="bg-fond border-b border-bordure px-6 py-4 sticky top-[57px] z-[100]">
            <div className="flex items-center gap-2.5 bg-fond-gris border border-bordure rounded-xl px-3.5 py-2.5">
              <IconSearch size={16} className="text-[#aaa] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Rechercher un terme financier…"
                className="flex-1 border-none bg-transparent font-sans text-[13px] text-texte outline-none placeholder:text-[#aaa]"
              />
              <span className="text-[11px] text-[#aaa] whitespace-nowrap">
                {filtered.length} {filtered.length > 1 ? 'termes' : 'terme'}
              </span>
            </div>
          </div>

          {/* Terms */}
          {visibleLetters.length === 0 ? (
            <div className="py-12 px-6 text-center text-[#aaa]">
              <IconSearch size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-[14px]">Aucun terme trouvé pour votre recherche.</p>
            </div>
          ) : (
            visibleLetters.map(l => (
              <div key={l} id={`letter-${l}`}>
                {/* Letter header */}
                <div className="px-6 py-3.5 bg-fond-gris border-b border-bordure flex items-center gap-2.5 sticky top-[115px] z-50">
                  <span className="text-[22px] font-semibold text-vert leading-none">{l}</span>
                  <span className="text-[11px] font-medium text-[#0F6E56] bg-[#E1F5EE] px-2 py-px rounded-full">
                    {filtered.filter(t => t.letter === l).length} termes
                  </span>
                </div>
                {/* Term cards */}
                {filtered.filter(t => t.letter === l).map(term => {
                  const meta = CAT_META[term.cat]
                  return (
                    <div
                      key={term.id}
                      id={`term-${term.id}`}
                      className={`bg-fond border-b border-bordure px-6 py-4 cursor-pointer transition-colors ${
                        highlighted === term.id ? 'bg-[#FDFBF0]' : 'hover:bg-[#fafafa]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 mb-1.5">
                        <span className="text-[14px] font-medium flex-1">{term.name}</span>
                        <span
                          className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#555] leading-relaxed">{term.def}</p>
                      {term.also && (
                        <p className="mt-1.5 text-[11px] text-[#aaa]">
                          Voir aussi :{' '}
                          {term.also.map((a, i) => (
                            <span key={a.href}>
                              <a href={a.href} className="text-vert font-medium hover:underline">{a.label}</a>
                              {i < (term.also?.length ?? 0) - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </p>
                      )}
                      <button
                        onClick={() => copyLink(term.id)}
                        className="flex items-center gap-1 text-[11px] text-[#bbb] mt-1.5 hover:text-vert transition-colors"
                      >
                        <IconLink size={13} /> Copier le lien
                      </button>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="px-6 py-6 bg-fond">
          {/* Stats */}
          <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4"><IconChartBar size={13} /> En chiffres</p>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {[['47','Termes définis'],['6','Catégories'],['15','Lettres couvertes'],['+12','Ce mois-ci']].map(([n,l]) => (
              <div key={l} className="bg-fond-gris rounded-lg p-3">
                <div className="text-[20px] font-medium text-vert">{n}</div>
                <div className="text-[11px] text-[#888] mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {/* Top terms */}
          <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4"><IconFlame size={13} /> Termes populaires</p>
          <div className="mb-8">
            {TOP_TERMS.map(({ id, label, views }, i) => (
              <button
                key={id}
                onClick={() => highlight(id)}
                className="w-full flex items-center gap-2.5 py-2 border-b border-bordure last:border-0 text-left"
              >
                <span className="text-[15px] font-medium text-[#ddd] min-w-[18px]">{i + 1}</span>
                <span className="flex-1 text-[13px] font-medium hover:text-vert transition-colors">{label}</span>
                <span className="text-[11px] text-[#aaa]">{views}</span>
              </button>
            ))}
          </div>

          {/* Legend */}
          <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4"><IconPalette size={13} /> Légende</p>
          <div className="flex flex-col gap-1.5 mb-8">
            {(Object.entries(CAT_META) as [Cat, typeof CAT_META[Cat]][]).map(([, meta]) => (
              <div key={meta.label} className="flex items-center gap-2 text-[12px] text-[#555]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.dot }} />
                {meta.label}
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl p-4 text-[12px] text-[#0F6E56] leading-relaxed">
            <strong className="font-medium block mb-1"><IconBulb size={13} className="inline mr-1" />Astuce</strong>
            Dans les posts de la communauté, les termes soulignés en vert renvoient directement à leur définition ici.
          </div>
        </aside>

      </div>
    </div>
  )
}
