'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { IconAward, IconChartPie, IconMessages, IconCamera, IconX, IconPlus } from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

type Asset = { name: string; pct: number }

const MONTHS = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']

export default function ProfilClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState('')
  const [initiale, setInitiale] = useState('?')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [memberSince, setMemberSince] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [portfolio, setPortfolio] = useState<Asset[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [assetName, setAssetName] = useState('')
  const [assetPct, setAssetPct] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/connexion'); return }
      const u = session.user
      const prenom = u.user_metadata?.prenom || ''
      const nom = u.user_metadata?.nom || ''
      const name = (prenom + ' ' + nom).trim() || u.email?.split('@')[0] || ''
      setFullname(name)
      setInitiale(name.charAt(0).toUpperCase() || '?')
      setEmail(u.email || '')
      setBio(u.user_metadata?.bio || '')
      setTags(u.user_metadata?.interests || [])
      const created = new Date(u.created_at)
      setMemberSince(MONTHS[created.getMonth()] + ' ' + created.getFullYear())
      setAvatarUrl(u.user_metadata?.avatar_url || '')
      setCoverUrl(u.user_metadata?.cover_url || '')
      setPortfolio(u.user_metadata?.portfolio || [])
      setLoading(false)
    })
  }, [router])

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const tmp = new Image()
      tmp.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 200; canvas.height = 200
        const ctx = canvas.getContext('2d')!
        const min = Math.min(tmp.width, tmp.height)
        ctx.drawImage(tmp, (tmp.width-min)/2, (tmp.height-min)/2, min, min, 0, 0, 200, 200)
        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        setAvatarUrl(compressed)
        supabase.auth.updateUser({ data: { avatar_url: compressed } })
      }
      tmp.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      setCoverUrl(url)
      supabase.auth.updateUser({ data: { cover_url: url } })
    }
    reader.readAsDataURL(file)
  }

  async function addAsset() {
    const name = assetName.trim()
    const pct = parseInt(assetPct)
    if (!name || !pct || pct < 1) { alert('Remplis les deux champs.'); return }
    const newPortfolio = [...portfolio, { name, pct }]
    setPortfolio(newPortfolio)
    await supabase.auth.updateUser({ data: { portfolio: newPortfolio } })
    setModalOpen(false)
    setAssetName(''); setAssetPct('')
  }

  async function removeAsset(i: number) {
    const newPortfolio = portfolio.filter((_, j) => j !== i)
    setPortfolio(newPortfolio)
    await supabase.auth.updateUser({ data: { portfolio: newPortfolio } })
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-fond-gris font-sans flex items-center justify-center text-muted text-[14px]">
      Chargement…
    </div>
  )

  const total = portfolio.reduce((s, a) => s + a.pct, 0)

  return (
    <div className="min-h-screen bg-fond-gris font-sans">
      {/* NAV */}
      <nav className="flex justify-between items-center px-10 py-4 border-b border-bordure bg-fond sticky top-0 z-10">
        <a href="/" className="flex items-center gap-2 text-[19px] font-medium text-texte no-underline">
          <span className="w-2 h-2 rounded-full bg-vert" />
          Fin<em className="not-italic text-vert">ko</em>
        </a>
        <div className="flex items-center gap-2.5">
          <a href="/parametres" className="text-[13px] text-muted hover:text-texte transition-colors">Paramètres</a>
          <button
            onClick={signOut}
            className="bg-transparent text-muted border border-[#ccc] px-3.5 py-1.5 rounded-lg text-[13px] cursor-pointer font-sans hover:bg-fond-gris transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </nav>

      <div className="max-w-[860px] mx-auto py-10 px-6 pb-16">

        {/* PROFILE CARD */}
        <div className="bg-fond rounded-2xl border border-bordure overflow-hidden mb-6">
          {/* Cover */}
          <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={onCoverChange} />
          <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={onAvatarChange} />
          <div
            className="h-40 relative cursor-pointer group overflow-hidden"
            onClick={() => coverInputRef.current?.click()}
            style={coverUrl ? undefined : { background: "linear-gradient(135deg,#085041,#1D9E75)" }}
          >
            {coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover object-center" />}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center">
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-texte border-none px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-1.5"
                onClick={e => { e.stopPropagation(); coverInputRef.current?.click() }}
              >
                <IconCamera size={15} /> Changer la couverture
              </button>
            </div>
            <button
              className="absolute top-4 right-4 bg-white/15 text-white border border-white/40 px-3.5 py-1.5 rounded-lg text-[12px] cursor-pointer flex items-center gap-1 font-sans"
              onClick={e => { e.stopPropagation(); router.push('/parametres') }}
            >
              ✏️ Modifier le profil
            </button>
          </div>

          {/* Body */}
          <div className="px-8 pt-11 pb-7">
            <div className="flex items-end justify-between -mt-[88px] mb-5">
              <div
                className="relative w-[88px] h-[88px] cursor-pointer group"
                onClick={() => avatarInputRef.current?.click()}
              >
                <div className="w-[88px] h-[88px] rounded-full border-4 border-fond bg-vert flex items-center justify-center text-[28px] font-semibold text-white overflow-hidden shadow-md relative">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover rounded-full" />
                    : <span>{initiale}</span>
                  }
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/45 transition-all flex items-center justify-center">
                    <IconCamera size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-[22px] font-semibold mb-1">{fullname}</h1>
            <p className="text-[13px] text-[#888] mb-3">{email}</p>
            {bio
              ? <p className="text-[14px] text-muted leading-relaxed mb-4">{bio}</p>
              : <p className="text-[14px] text-[#aaa] italic mb-4">
                  Aucune bio — <a href="/parametres" className="text-vert no-underline hover:underline">Ajouter une bio →</a>
                </p>
            }
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {tags.map(t => (
                  <span key={t} className="text-[12px] text-vert-dark bg-[#E1F5EE] px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            )}
            <div className="flex gap-8 pt-5 border-t border-bordure">
              <div><div className="text-[20px] font-semibold text-vert">0</div><div className="text-[12px] text-[#888]">posts</div></div>
              <div><div className="text-[20px] font-semibold text-vert">0</div><div className="text-[12px] text-[#888]">réactions</div></div>
              <div><div className="text-[20px] font-semibold text-vert">{memberSince}</div><div className="text-[12px] text-[#888]">membre depuis</div></div>
            </div>
          </div>
        </div>

        {/* SCORE */}
        <div className="bg-fond border border-bordure rounded-2xl p-6 mb-6">
          <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
            <IconAward size={14} /> Score de crédibilité
          </p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[["0","posts"],["0","réactions"],["0","réponses"],["0","webinaires"]].map(([n,l]) => (
              <div key={l} className="bg-fond-gris rounded-xl p-4 text-center">
                <div className="text-[22px] font-semibold text-vert">{n}</div>
                <div className="text-[11px] text-[#888] mt-1">{l}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[12px] text-[#888] mb-1.5">
            <span>Niveau : Curieux</span><span>0 / 100 pts</span>
          </div>
          <div className="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full" style={{ width: '5%', background: 'linear-gradient(to right,#1D9E75,#5DCAA5)' }} />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#E1F5EE] text-vert-dark text-[12px] font-medium px-3 py-1.5 rounded-full">
            🌱 Nouveau membre — commence à poster !
          </div>
        </div>

        {/* PORTEFEUILLE */}
        <div className="bg-fond border border-bordure rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-5">
            <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert flex items-center gap-1.5">
              <IconChartPie size={14} /> Mon portefeuille fictif
            </p>
            <span className="text-[13px] font-medium text-vert bg-[#E1F5EE] px-2.5 py-1 rounded-full">+0,0%</span>
          </div>
          {portfolio.length === 0 ? (
            <div className="text-center py-10 text-[#aaa]">
              📊
              <p className="mt-3 mb-1 text-[14px]">Ton portefeuille est vide.</p>
              <p className="text-[13px]">Ajoute des actifs pour partager ta stratégie.</p>
            </div>
          ) : (
            <div className="mb-2">
              {portfolio.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-fond-gris rounded-lg mb-2 hover:translate-x-1 transition-transform">
                  <span className="text-[13px] font-semibold min-w-[80px]">{a.name}</span>
                  <div className="flex-1 h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                    <div className="h-full bg-vert rounded-full" style={{ width: `${(a.pct / total * 100).toFixed(0)}%` }} />
                  </div>
                  <span className="text-[12px] font-medium text-vert min-w-[40px] text-right">{a.pct}%</span>
                  <button
                    onClick={() => removeAsset(i)}
                    className="text-[#ccc] hover:text-[#E24B4A] transition-colors bg-none border-none cursor-pointer p-0"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full mt-2 bg-transparent text-vert border border-vert py-2.5 rounded-lg text-[13px] font-medium cursor-pointer flex items-center justify-center gap-1.5 hover:bg-[#E1F5EE] transition-colors font-sans"
          >
            <IconPlus size={15} /> Ajouter un actif
          </button>
        </div>

        {/* POSTS */}
        <div className="bg-fond border border-bordure rounded-2xl p-6">
          <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
            <IconMessages size={14} /> Mes posts
          </p>
          <div className="text-center py-10 text-[#aaa]">
            ✏️
            <p className="mt-3 text-[14px]">Tu n'as pas encore posté.</p>
            <a href="/communaute" className="text-vert font-medium text-[14px] hover:underline">Rejoindre la discussion →</a>
          </div>
        </div>

      </div>

      {/* MODAL ACTIF */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-fond rounded-2xl p-8 w-[90%] max-w-[400px]">
            <h2 className="text-[18px] font-semibold mb-6">Ajouter un actif</h2>
            <input
              className="w-full px-3.5 py-2.5 border border-[#ccc] rounded-lg text-[14px] outline-none focus:border-vert mb-4 font-sans bg-fond text-texte"
              type="text"
              placeholder="Nom : LVMH, ETF World, BTC..."
              value={assetName}
              onChange={e => setAssetName(e.target.value)}
            />
            <input
              className="w-full px-3.5 py-2.5 border border-[#ccc] rounded-lg text-[14px] outline-none focus:border-vert mb-6 font-sans bg-fond text-texte"
              type="number"
              placeholder="Pourcentage : 30"
              min="1" max="100"
              value={assetPct}
              onChange={e => setAssetPct(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-transparent border border-[#ccc] py-2.5 rounded-lg text-[13px] cursor-pointer font-sans hover:bg-fond-gris transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={addAsset}
                className="flex-1 bg-vert text-white border-none py-2.5 rounded-lg text-[13px] font-medium cursor-pointer font-sans hover:bg-vert-hover transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
