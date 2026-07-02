'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  IconLayoutList, IconClock, IconFlame, IconTrendingUp,
  IconChartPie, IconBuilding, IconPigMoney, IconCurrencyBitcoin,
  IconReportMoney, IconSchool, IconMessageCircle, IconBookmark,
  IconShare, IconTrash, IconArrowRight, IconAward,
  IconChartBar, IconSend, IconX, IconTrophy,
  IconRadar,
} from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  user_id: string
  prenom: string
  content: string
  category: string
  created_at: string
  likes: Record<string, number>
  comment_count: number
  my_reaction?: string
  bookmarked: boolean
}

interface Comment {
  id: string
  post_id: string
  user_id: string
  prenom: string
  content: string
  created_at: string
}

interface ProphetEntry {
  prenom: string
  correct_predictions: number
  total_predictions: number
  xp: number
}

const CATS = [
  { id: 'actions',   label: 'Actions',    icon: IconTrendingUp,      count: 84 },
  { id: 'etf',       label: 'ETF',         icon: IconChartPie,        count: 61 },
  { id: 'scpi',      label: 'SCPI',        icon: IconBuilding,        count: 43 },
  { id: 'per',       label: 'PER',         icon: IconPigMoney,        count: 29 },
  { id: 'crypto',    label: 'Crypto',      icon: IconCurrencyBitcoin, count: 38 },
  { id: 'fiscalite', label: 'Fiscalité',   icon: IconReportMoney,     count: 22 },
  { id: 'debutant',  label: 'Débutant',    icon: IconSchool,          count: 56 },
]

const EMOJIS = ['❤️', '👍', '🎯', '💡', '🔥']

const COMPOSE_CATS = [
  { value: 'general',   label: 'Général'   },
  { value: 'actions',   label: 'Actions'   },
  { value: 'etf',       label: 'ETF'       },
  { value: 'scpi',      label: 'SCPI'      },
  { value: 'per',       label: 'PER'       },
  { value: 'crypto',    label: 'Crypto'    },
  { value: 'fiscalite', label: 'Fiscalité' },
  { value: 'debutant',  label: 'Débutant'  },
]

const SV_CHIPS = ['ETF World', 'LVMH', 'CAC 40', 'BTC', 'SCPI', 'S&P 500']

const STATIC_MEMBERS = [
  { i: 'MK', bg: '#E1F5EE', c: '#0F6E56', name: 'Marie K.',   role: 'Actions · 247 posts' },
  { i: 'SR', bg: '#FAEEDA', c: '#854F0B', name: 'Sara R.',    role: 'ETF · 183 posts'     },
  { i: 'TL', bg: '#E6F1FB', c: '#185FA5', name: 'Thomas L.', role: 'SCPI · 124 posts'    },
]

const STATIC_TRENDING = [
  ['#ETFWorld',        '84 posts cette semaine'],
  ['#PERavantDécembre','61 posts cette semaine'],
  ['#LVMH',           '43 posts cette semaine'],
  ['#DébutantPEA',    '38 posts cette semaine'],
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}

function avColor(userId: string): { bg: string; text: string } {
  const p = [
    { bg: '#E1F5EE', text: '#0F6E56' },
    { bg: '#E6F1FB', text: '#185FA5' },
    { bg: '#FAEEDA', text: '#854F0B' },
    { bg: '#EEEDFE', text: '#3C3489' },
    { bg: '#FAECE7', text: '#993C1D' },
  ]
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) & 0xffffff
  return p[h % p.length]
}

function weekKey(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const w = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(w).padStart(2, '0')}`
}

export default function CommunauteClient() {
  const [user, setUser] = useState<any>(null)
  const [authReady, setAuthReady] = useState(false)

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  const [composeOpen, setComposeOpen] = useState(false)
  const [composeText, setComposeText] = useState('')
  const [composeCategory, setComposeCategory] = useState('general')
  const [publishing, setPublishing] = useState(false)

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [commentData, setCommentData] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})

  const [showPicker, setShowPicker] = useState<string | null>(null)

  const [svAsset, setSvAsset] = useState('')
  const [svSelected, setSvSelected] = useState<string | null>(null)
  const [svVotes, setSvVotes] = useState({ bull: 0, neut: 0, bear: 0, total: 0 })
  const [svMyVote, setSvMyVote] = useState<string | null>(null)

  const [prophet, setProphet] = useState<ProphetEntry[]>([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadPosts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let q = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(20)
    if (activeCategory !== 'all' && activeCategory !== 'recent' && activeCategory !== 'tendances') {
      q = q.eq('category', activeCategory)
    }
    const { data } = await q
    if (!data) { setLoading(false); return }

    const ids = data.map((p: any) => p.id)
    if (ids.length === 0) { setPosts([]); setLoading(false); return }

    const [{ data: allLikes }, { data: allComments }, { data: myLikes }, { data: myBooks }] =
      await Promise.all([
        supabase.from('likes').select('post_id,reaction_type').in('post_id', ids),
        supabase.from('comments').select('id,post_id').in('post_id', ids),
        supabase.from('likes').select('post_id,reaction_type').eq('user_id', user.id).in('post_id', ids),
        supabase.from('bookmarks').select('post_id').eq('user_id', user.id).in('post_id', ids),
      ])

    const likesMap: Record<string, Record<string, number>> = {}
    for (const l of (allLikes || []) as any[]) {
      if (!likesMap[l.post_id]) likesMap[l.post_id] = {}
      likesMap[l.post_id][l.reaction_type] = (likesMap[l.post_id][l.reaction_type] || 0) + 1
    }
    const commentsMap: Record<string, number> = {}
    for (const c of (allComments || []) as any[]) commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1
    const myRxMap: Record<string, string> = {}
    for (const l of (myLikes || []) as any[]) myRxMap[l.post_id] = l.reaction_type
    const myBookSet = new Set(((myBooks || []) as any[]).map((b: any) => b.post_id))

    setPosts(data.map((p: any) => ({
      ...p,
      likes: likesMap[p.id] || {},
      comment_count: commentsMap[p.id] || 0,
      my_reaction: myRxMap[p.id],
      bookmarked: myBookSet.has(p.id),
    })))
    setLoading(false)
  }, [user, activeCategory])

  const loadProphet = useCallback(async () => {
    const { data } = await supabase
      .from('prophet_scores')
      .select('prenom,correct_predictions,total_predictions,xp')
      .order('xp', { ascending: false })
      .limit(5)
    setProphet((data as ProphetEntry[]) || [])
  }, [])

  useEffect(() => {
    if (user) { loadPosts(); loadProphet() }
  }, [user, activeCategory, loadPosts, loadProphet])

  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('community-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => loadPosts())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user, loadPosts])

  async function loadSentiment(asset: string) {
    const norm = asset.trim().toUpperCase()
    const wk = weekKey()
    const [{ data: votes }, { data: myVote }] = await Promise.all([
      supabase.from('sentiment_votes').select('sentiment').eq('asset', norm).eq('week_key', wk),
      user
        ? supabase.from('sentiment_votes').select('sentiment').eq('asset', norm).eq('week_key', wk).eq('user_id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    const vl = (votes || []) as any[]
    const bull = vl.filter(v => v.sentiment === 'bullish').length
    const neut = vl.filter(v => v.sentiment === 'neutral').length
    const bear = vl.filter(v => v.sentiment === 'bearish').length
    setSvVotes({ bull, neut, bear, total: bull + neut + bear })
    setSvMyVote((myVote as any)?.sentiment || null)
    setSvSelected(norm)
  }

  async function vote(sentiment: string) {
    if (!user || !svSelected) return
    await supabase.from('sentiment_votes').upsert(
      { user_id: user.id, asset: svSelected, sentiment, week_key: weekKey() },
      { onConflict: 'user_id,asset,week_key' },
    )
    loadSentiment(svSelected)
  }

  async function react(postId: string, emoji: string) {
    if (!user) return
    const post = posts.find(p => p.id === postId)
    if (post?.my_reaction === emoji) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('likes').upsert(
        { post_id: postId, user_id: user.id, reaction_type: emoji },
        { onConflict: 'post_id,user_id' },
      )
    }
    setShowPicker(null)
    loadPosts()
  }

  async function toggleBookmark(postId: string) {
    if (!user) return
    const post = posts.find(p => p.id === postId)
    if (post?.bookmarked) {
      await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id })
    }
    loadPosts()
  }

  async function deletePost(postId: string) {
    if (!confirm('Supprimer ce post ?')) return
    await supabase.from('posts').delete().eq('id', postId)
    loadPosts()
  }

  async function publishPost() {
    if (!user || !composeText.trim()) return
    setPublishing(true)
    const prenom = user.user_metadata?.prenom || user.email?.split('@')[0] || 'Anonyme'
    await supabase.from('posts').insert({
      user_id: user.id,
      prenom,
      content: composeText.trim(),
      category: composeCategory,
    })
    setComposeText('')
    setComposeOpen(false)
    setPublishing(false)
    loadPosts()
  }

  async function toggleComments(postId: string) {
    const opening = !openComments[postId]
    setOpenComments(prev => ({ ...prev, [postId]: opening }))
    if (opening && !commentData[postId]) await loadComments(postId)
  }

  async function loadComments(postId: string) {
    const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true })
    setCommentData(prev => ({ ...prev, [postId]: (data as Comment[]) || [] }))
  }

  async function submitComment(postId: string) {
    if (!user || !commentText[postId]?.trim()) return
    const prenom = user.user_metadata?.prenom || user.email?.split('@')[0] || 'Anonyme'
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: commentText[postId].trim(), prenom })
    setCommentText(prev => ({ ...prev, [postId]: '' }))
    loadComments(postId)
    loadPosts()
  }

  function showToastMsg(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  function sharePost(postId: string) {
    const url = `${window.location.origin}/communaute#${postId}`
    navigator.clipboard?.writeText(url).catch(() => {})
    showToastMsg('Lien copié !')
  }

  const totalRx = (likes: Record<string, number>) => Object.values(likes).reduce((a, b) => a + b, 0)
  const svPct = (n: number) => (svVotes.total > 0 ? Math.round((n / svVotes.total) * 100) : 0)

  const userInitial = user ? (user.user_metadata?.prenom || user.email || '?')[0].toUpperCase() : '?'
  const myColor = avColor(user?.id || 'x')

  // ── GATE ────────────────────────────────────────────────────────────
  if (authReady && !user) {
    return (
      <div className="min-h-screen font-sans bg-fond">
        <Nav />
        {/* Blurred preview behind gate */}
        <div className="opacity-[0.15] pointer-events-none select-none overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
          <div className="grid max-w-[1100px] mx-auto" style={{ gridTemplateColumns: '220px 1fr 260px' }}>
            <div className="border-r border-bordure bg-fond p-6">
              {[3, 2, 2.5, 2, 3, 2.2, 2.8].map((w, i) => (
                <div key={i} className="h-3 bg-fond-gris rounded mb-3" style={{ width: `${w / 3 * 100}%` }} />
              ))}
            </div>
            <div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-b border-bordure p-6 bg-fond">
                  <div className="flex gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-fond-gris shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-fond-gris rounded mb-2 w-1/3" />
                      <div className="h-3 bg-fond-gris rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-4 bg-fond-gris rounded mb-2" />
                  <div className="h-4 bg-fond-gris rounded mb-2 w-4/5" />
                  <div className="h-4 bg-fond-gris rounded w-3/5" />
                </div>
              ))}
            </div>
            <div className="border-l border-bordure bg-fond p-6">
              {[2, 3, 2.5, 2, 2.8, 3].map((w, i) => (
                <div key={i} className="h-3 bg-fond-gris rounded mb-3" style={{ width: `${w / 3 * 100}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Gate overlay */}
        <div className="fixed inset-0 top-[57px] z-[998] grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Left: pitch */}
          <div
            className="relative overflow-hidden flex flex-col justify-center px-16 py-12"
            style={{ background: '#085041' }}
          >
            <div className="absolute w-[400px] h-[400px] rounded-full top-[-100px] right-[-100px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="absolute w-[500px] h-[500px] rounded-full bottom-[-150px] left-[-100px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="relative z-10">
              <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-[#5DCAA5] mb-5">Communauté Finko</p>
              <h2 className="text-[36px] font-semibold text-white leading-[1.15] tracking-tight mb-5">
                Rejoins la conversation<br />qui <span className="text-[#5DCAA5]">change tout</span>
              </h2>
              <p className="text-[15px] text-white/65 leading-[1.7] mb-10 max-w-[360px]">
                Des milliers de curieux qui partagent leurs expériences, posent leurs questions et progressent ensemble.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: '💬', title: "Discute sans conflit d'intérêt", sub: 'Aucune pub, aucune rémunération cachée' },
                  { icon: '🎯', title: 'Pose tes vraies questions',      sub: 'PEA, ETF, SCPI, fiscalité… la communauté répond' },
                  { icon: '📈', title: 'Suis les vrais investisseurs',    sub: 'Portefeuilles partagés et stratégies réelles' },
                  { icon: '🎙️', title: 'Accède aux webinaires en direct', sub: 'Des pros répondent à la communauté gratuitement' },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-3.5">
                    <span className="text-[22px] mt-0.5">{f.icon}</span>
                    <div>
                      <div className="text-[14px] font-medium text-white mb-0.5">{f.title}</div>
                      <div className="text-[13px] text-white/55">{f.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: auth */}
          <div className="bg-fond flex flex-col items-center justify-center px-12">
            <div className="w-full max-w-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-[#E1F5EE] flex items-center justify-center text-[24px] mb-6">🔐</div>
              <h3 className="text-[24px] font-semibold tracking-tight mb-2">Accès membres</h3>
              <p className="text-[14px] text-muted mb-8">La communauté est réservée aux membres Finko.</p>
              <Link
                href="/connexion?tab=register"
                className="block w-full text-center bg-vert text-white px-6 py-3.5 rounded-xl text-[14px] font-medium mb-3 hover:bg-vert-hover transition-colors"
              >
                Créer mon compte gratuit
              </Link>
              <Link
                href="/connexion"
                className="block w-full text-center bg-fond-gris text-texte border border-bordure px-6 py-3.5 rounded-xl text-[14px] hover:bg-[#ececea] transition-colors"
              >
                Se connecter
              </Link>
              <p className="text-[12px] text-[#aaa] text-center mt-6 leading-relaxed">
                100% gratuit · Sans carte bancaire · Communauté indépendante
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!authReady) return null

  // ── MAIN APP ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-fond-gris font-sans" onClick={() => setShowPicker(null)}>
      <Nav />

      <div
        className="grid max-w-[1100px] mx-auto min-h-[calc(100vh-57px)]"
        style={{ gridTemplateColumns: '220px 1fr 260px' }}
      >
        {/* ── LEFT SIDEBAR ── */}
        <aside className="border-r border-bordure bg-fond py-6 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="px-5 mb-6">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#aaa] mb-3">Fil</p>
            {[
              { id: 'all',      label: 'Tout le fil', icon: <IconLayoutList size={15} />, count: 247 },
              { id: 'recent',   label: 'Récent',      icon: <IconClock size={15} /> },
              { id: 'tendances',label: 'Tendances',   icon: <IconFlame size={15} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] mb-0.5 text-left cursor-pointer font-sans border-none transition-colors ${
                  activeCategory === item.id ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium' : 'text-muted bg-transparent hover:bg-fond-gris'
                }`}
              >
                {item.icon}
                {item.label}
                {item.count && (
                  <span className="ml-auto text-[11px] text-[#aaa] bg-fond-gris px-1.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="px-5">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#aaa] mb-3">Catégories</p>
            {CATS.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] mb-0.5 text-left cursor-pointer font-sans border-none transition-colors ${
                    activeCategory === cat.id ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium' : 'text-muted bg-transparent hover:bg-fond-gris'
                  }`}
                >
                  <Icon size={15} />
                  {cat.label}
                  <span className="ml-auto text-[11px] text-[#aaa] bg-fond-gris px-1.5 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="border-r border-bordure">
          {/* Compose */}
          <div className="bg-fond border-b border-bordure p-5">
            {!composeOpen ? (
              <div className="flex gap-2.5 items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0"
                  style={{ background: myColor.bg, color: myColor.text }}
                >
                  {userInitial}
                </div>
                <button
                  onClick={() => setComposeOpen(true)}
                  className="flex-1 text-left border border-[#ccc] rounded-xl px-4 py-2.5 text-[14px] text-[#aaa] bg-fond-gris hover:border-vert cursor-text font-sans transition-colors"
                >
                  Partage ton expérience ou pose une question...
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2.5 items-start mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0 mt-1"
                    style={{ background: myColor.bg, color: myColor.text }}
                  >
                    {userInitial}
                  </div>
                  <textarea
                    autoFocus
                    value={composeText}
                    onChange={e => setComposeText(e.target.value)}
                    placeholder="Partage ton expérience ou pose une question..."
                    rows={4}
                    className="flex-1 border border-[#ccc] rounded-xl px-4 py-2.5 text-[14px] font-sans resize-none outline-none focus:border-vert bg-fond text-texte"
                  />
                </div>
                <div className="flex items-center gap-2 ml-[46px]">
                  <select
                    value={composeCategory}
                    onChange={e => setComposeCategory(e.target.value)}
                    className="text-[12px] text-muted border border-bordure rounded-lg px-2.5 py-1.5 bg-fond-gris outline-none cursor-pointer font-sans"
                  >
                    {COMPOSE_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <button
                    onClick={() => { setComposeOpen(false); setComposeText('') }}
                    className="text-[12px] text-muted border border-bordure rounded-lg px-3 py-1.5 bg-fond cursor-pointer font-sans hover:bg-fond-gris transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={publishPost}
                    disabled={!composeText.trim() || publishing}
                    className="ml-auto bg-vert text-white border-none px-4 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer font-sans hover:bg-vert-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {publishing ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feed tabs */}
          <div className="flex border-b border-bordure bg-fond">
            {['Tout le fil', 'Tendances'].map((t, i) => (
              <button
                key={t}
                className={`px-6 py-3.5 text-[13px] border-b-2 -mb-px cursor-pointer font-sans bg-transparent transition-colors ${
                  i === 0 ? 'text-vert border-vert font-medium' : 'text-muted border-transparent hover:text-texte'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading && (
            <div className="text-center py-12 text-muted text-[13px]">Chargement des posts…</div>
          )}
          {!loading && posts.length === 0 && (
            <div className="text-center py-16 text-muted text-[14px]">
              <div className="text-[40px] mb-4">✍️</div>
              <p className="mb-1 font-medium">Aucun post pour le moment</p>
              <p className="text-[13px]">Sois le premier à partager !</p>
            </div>
          )}

          {posts.map(post => {
            const col = avColor(post.user_id)
            const rxTotal = totalRx(post.likes)
            const dominantRx = Object.entries(post.likes).sort((a, b) => b[1] - a[1])[0]?.[0]
            return (
              <div key={post.id} id={post.id} className="bg-fond border-b border-bordure px-6 py-5 hover:bg-[#fafafa] transition-colors">
                <div className="flex gap-2.5 mb-3 items-start">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0"
                    style={{ background: col.bg, color: col.text }}
                  >
                    {(post.prenom?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{post.prenom}</div>
                    <div className="text-[11px] text-[#aaa]">{timeAgo(post.created_at)}</div>
                  </div>
                  {post.category && post.category !== 'general' && (
                    <span className="text-[10px] font-medium tracking-wide uppercase bg-[#E1F5EE] text-[#0F6E56] px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  )}
                </div>

                <p className="text-[14px] text-texte leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

                <div className="flex items-center gap-0.5 flex-wrap" onClick={e => e.stopPropagation()}>
                  {/* Emoji react */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPicker(showPicker === post.id ? null : post.id)}
                      className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans transition-colors ${
                        post.my_reaction ? 'text-[#E24B4A] bg-[#FEF2F2]' : 'text-[#aaa] bg-transparent hover:bg-fond-gris hover:text-vert'
                      }`}
                    >
                      <span>{dominantRx || '❤️'}</span>
                      {rxTotal > 0 && <span>{rxTotal}</span>}
                    </button>
                    {showPicker === post.id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-fond border border-bordure rounded-[24px] px-2 py-1.5 flex gap-0.5 shadow-lg z-50">
                        {EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => react(post.id, emoji)}
                            className={`text-[22px] px-1.5 py-1 rounded-xl border-none cursor-pointer transition-transform hover:scale-125 ${
                              post.my_reaction === emoji ? 'bg-[#E1F5EE]' : 'bg-transparent'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-[12px] text-[#aaa] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans bg-transparent hover:bg-fond-gris hover:text-vert transition-colors"
                  >
                    <IconMessageCircle size={15} />
                    {post.comment_count > 0 && <span>{post.comment_count}</span>}
                  </button>

                  {/* Bookmark */}
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans bg-transparent transition-colors ${
                      post.bookmarked ? 'text-vert' : 'text-[#aaa] hover:bg-fond-gris hover:text-vert'
                    }`}
                  >
                    <IconBookmark size={15} />
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => sharePost(post.id)}
                    className="flex items-center gap-1.5 text-[12px] text-[#aaa] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans bg-transparent hover:bg-fond-gris hover:text-vert transition-colors"
                  >
                    <IconShare size={15} />
                  </button>

                  {/* Delete own posts */}
                  {post.user_id === user?.id && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="ml-auto flex items-center gap-1.5 text-[12px] text-[#aaa] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans bg-transparent hover:bg-[#FEF2F2] hover:text-[#E24B4A] transition-colors"
                    >
                      <IconTrash size={15} />
                    </button>
                  )}
                </div>

                {/* Comments section */}
                {openComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-bordure">
                    {(commentData[post.id] || []).map(c => {
                      const cCol = avColor(c.user_id)
                      return (
                        <div key={c.id} className="flex gap-2 mb-3">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                            style={{ background: cCol.bg, color: cCol.text }}
                          >
                            {(c.prenom?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="bg-fond-gris rounded-xl px-3 py-2 flex-1">
                            <div className="text-[12px] font-medium mb-0.5">{c.prenom}</div>
                            <div className="text-[13px] text-texte">{c.content}</div>
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex gap-2 mt-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                        style={{ background: myColor.bg, color: myColor.text }}
                      >
                        {userInitial}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          value={commentText[post.id] || ''}
                          onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') submitComment(post.id) }}
                          placeholder="Écrire un commentaire..."
                          className="flex-1 border border-[#ccc] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-vert bg-fond text-texte font-sans"
                        />
                        <button
                          onClick={() => submitComment(post.id)}
                          className="bg-vert text-white border-none px-3 py-1.5 rounded-lg cursor-pointer hover:bg-vert-hover transition-colors"
                        >
                          <IconSend size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="px-5 py-6 bg-fond sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">

          {/* Radar de sentiment */}
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
              <IconRadar size={13} /> Radar de sentiment
            </p>
            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={svAsset}
                onChange={e => setSvAsset(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && svAsset.trim()) loadSentiment(svAsset) }}
                placeholder="Saisir un actif..."
                className="flex-1 min-w-0 px-2.5 py-1.5 border border-bordure rounded-lg text-[12px] outline-none focus:border-vert bg-fond-gris text-texte font-sans"
              />
              <button
                onClick={() => svAsset.trim() && loadSentiment(svAsset)}
                className="w-8 h-8 border border-bordure rounded-lg bg-fond-gris flex items-center justify-center cursor-pointer hover:bg-[#E1F5EE] hover:border-vert transition-colors shrink-0"
              >
                <IconArrowRight size={14} className="text-vert" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {SV_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => { setSvAsset(chip); loadSentiment(chip) }}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border cursor-pointer font-sans transition-all ${
                    svSelected === chip.toUpperCase()
                      ? 'bg-[#E1F5EE] border-vert text-[#085041] font-medium'
                      : 'bg-fond-gris border-bordure text-muted hover:border-vert hover:text-[#085041] hover:bg-[#E1F5EE]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {svSelected && (
              <>
                <p className="text-[12px] font-semibold text-texte mb-3">
                  {svSelected} — semaine en cours
                </p>
                {/* Gauge bar */}
                <div className="h-2.5 rounded-full overflow-hidden bg-[#e5e5e5] flex mb-3">
                  <div className="h-full transition-all duration-500" style={{ width: svPct(svVotes.bull) + '%', background: '#1D9E75' }} />
                  <div className="h-full transition-all duration-500" style={{ width: svPct(svVotes.neut) + '%', background: '#bbb' }} />
                  <div className="h-full transition-all duration-500" style={{ width: svPct(svVotes.bear) + '%', background: '#E24B4A' }} />
                </div>
                {/* Vote buttons */}
                <div className="flex gap-1.5 mb-3">
                  {[
                    {
                      key: 'bullish', label: 'Haussier', emoji: '📈',
                      active: 'border-vert bg-[#E1F5EE] text-[#0F6E56]',
                      hover: 'hover:border-vert hover:bg-[#E1F5EE]',
                    },
                    {
                      key: 'neutral', label: 'Neutre', emoji: '➡️',
                      active: 'border-[#999] bg-[#f0f0ee] text-[#333]',
                      hover: 'hover:border-[#999]',
                    },
                    {
                      key: 'bearish', label: 'Baissier', emoji: '📉',
                      active: 'border-[#E24B4A] bg-[#FDECEA] text-[#8B1A1A]',
                      hover: 'hover:border-[#E24B4A]',
                    },
                  ].map(btn => (
                    <button
                      key={btn.key}
                      onClick={() => vote(btn.key)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border-[1.5px] bg-fond cursor-pointer font-sans text-[10px] font-medium text-muted transition-all ${
                        svMyVote === btn.key ? btn.active : `border-bordure ${btn.hover}`
                      }`}
                    >
                      <span className="text-[17px]">{btn.emoji}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
                {/* Results */}
                {[
                  { label: 'Haussier', n: svVotes.bull, color: '#1D9E75' },
                  { label: 'Neutre',   n: svVotes.neut, color: '#bbb'    },
                  { label: 'Baissier', n: svVotes.bear, color: '#E24B4A' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="flex-1 text-[11px] text-muted">{r.label}</span>
                    <span className="text-[11px] font-medium min-w-[30px] text-right" style={{ color: r.color }}>
                      {r.n > 0 ? svPct(r.n) + ' %' : '—'}
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-[#aaa] text-center mt-2">
                  {svVotes.total} vote{svVotes.total !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </div>

          {/* Prophètes de la semaine */}
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
              <IconTrophy size={13} /> Prophètes de la semaine
            </p>
            {prophet.length === 0 ? (
              <p className="text-[12px] text-[#aaa] italic">Aucun score encore</p>
            ) : (
              prophet.map((p, i) => {
                const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
                const acc = p.total_predictions > 0 ? Math.round((p.correct_predictions / p.total_predictions) * 100) : 0
                return (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-[#f0f0ee] last:border-0 text-[13px]">
                    <span className="text-[16px] min-w-[22px] text-center">{medals[i]}</span>
                    <span className="flex-1 font-medium truncate">{p.prenom}</span>
                    <span className="text-[12px] font-semibold text-vert min-w-[38px] text-right">{acc}%</span>
                    <span className="text-[11px] text-[#aaa] min-w-[44px] text-right">{p.xp} XP</span>
                  </div>
                )
              })
            )}
          </div>

          {/* Tendances */}
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
              <IconFlame size={13} /> Tendances
            </p>
            {STATIC_TRENDING.map(([tag, count], i) => (
              <div key={tag} className="flex gap-2.5 py-2.5 border-b border-bordure last:border-0 cursor-pointer hover:bg-fond-gris rounded-lg -mx-1 px-1 transition-colors">
                <span className="text-[15px] font-medium text-[#ccc] min-w-[18px]">{i + 1}</span>
                <div>
                  <div className="text-[13px] font-medium">{tag}</div>
                  <div className="text-[11px] text-[#aaa]">{count}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Membres actifs */}
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
              <IconAward size={13} /> Membres actifs
            </p>
            {STATIC_MEMBERS.map(m => (
              <div key={m.name} className="flex items-center gap-2.5 py-2.5 border-b border-bordure last:border-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                  style={{ background: m.bg, color: m.c }}
                >
                  {m.i}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{m.name}</div>
                  <div className="text-[11px] text-[#aaa]">{m.role}</div>
                </div>
                <button className="text-[11px] text-vert border border-[#9FE1CB] px-2.5 py-1 rounded-full cursor-pointer bg-transparent hover:bg-[#E1F5EE] transition-colors font-sans">
                  Suivre
                </button>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
              <IconChartBar size={13} /> La communauté
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[['2.4k','membres'],['247','posts ce mois'],['12','webinaires'],['🇫🇷','100% français']].map(([n, l]) => (
                <div key={l} className="bg-fond-gris rounded-lg p-3">
                  <div className="text-[18px] font-medium text-vert">{n}</div>
                  <div className="text-[11px] text-[#888] mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-texte text-white px-4 py-2 rounded-lg text-[13px] z-[9999] font-sans shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
