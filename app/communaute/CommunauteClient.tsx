'use client'

import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import {
  IconLayoutList, IconClock, IconFlame, IconTrendingUp,
  IconChartPie, IconBuilding, IconPigMoney, IconCurrencyBitcoin,
  IconReportMoney, IconSchool, IconMessageCircle, IconBookmark,
  IconShare, IconTrash, IconArrowRight, IconAward,
  IconChartBar, IconSend, IconX, IconTrophy,
  IconRadar, IconPhoto, IconLink, IconPlus, IconCheck,
} from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import { supabase } from '@/lib/supabase'
import { GLOSS_TERMS } from '@/lib/data/glossTerms'

// ── Types ────────────────────────────────────────────────────────────
interface Post {
  id: string
  user_id: string
  prenom: string
  content: string
  category: string
  created_at: string
  image_url?: string | null
  link_url?: string | null
  link_title?: string | null
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

interface ActiveMember {
  user_id: string
  prenom: string
  count: number
  following: boolean
}

type MentionCandidate = { prenom: string; user_id: string }

// ── Constantes ───────────────────────────────────────────────────────
const CATS = [
  { id: 'actions',   label: 'Actions',   icon: IconTrendingUp      },
  { id: 'etf',       label: 'ETF',        icon: IconChartPie        },
  { id: 'scpi',      label: 'SCPI',       icon: IconBuilding        },
  { id: 'per',       label: 'PER',        icon: IconPigMoney        },
  { id: 'crypto',    label: 'Crypto',     icon: IconCurrencyBitcoin },
  { id: 'fiscalite', label: 'Fiscalité',  icon: IconReportMoney     },
  { id: 'debutant',  label: 'Débutant',   icon: IconSchool          },
]

const RXEMOJI: Record<string, string> = { heart: '❤️', thumbs: '👍', fire: '🔥', brain: '🧠', think: '🤔' }
const RXLABELS: Record<string, string> = { heart: "J'aime", thumbs: 'Pertinent', fire: 'Brûlant', brain: 'Instructif', think: 'À débattre' }

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

const AV_PALETTE = [
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#FAEEDA', text: '#854F0B' },
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#FAECE7', text: '#993C1D' },
]

// ── Utils ────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}

function avColor(userId: string) {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) & 0xffffff
  return AV_PALETTE[h % AV_PALETTE.length]
}

// Clé de semaine = date du prochain vendredi (le sondage expire le vendredi soir)
function svWeekKey(): string {
  const now = new Date()
  const day = now.getDay()
  const daysToFri = day === 5 ? 0 : day === 6 ? 6 : 5 - day
  const fri = new Date(now)
  fri.setDate(now.getDate() + daysToFri)
  return fri.toISOString().split('T')[0]
}

// Clé de la semaine passée = date du dernier vendredi
function lastWeekKey(): string {
  const now = new Date()
  const day = now.getDay()
  const back = day === 6 ? 1 : day === 5 ? 7 : day + 2
  const d = new Date(now)
  d.setDate(now.getDate() - back)
  return d.toISOString().split('T')[0]
}

function svExpiryLabel(): string {
  const day = new Date().getDay()
  const d = day === 5 ? 0 : day === 6 ? 6 : 5 - day
  if (d === 0) return 'Sondage hebdo · expire ce soir à minuit'
  if (d === 1) return 'Sondage hebdo · expire demain à minuit'
  return `Sondage hebdo · expire dans ${d} jour${d > 1 ? 's' : ''}`
}

// ── Rendu du contenu : @mentions + termes du glossaire ───────────────
const GLOSS_KEYS = Object.keys(GLOSS_TERMS).sort((a, b) => b.length - a.length)
const CONTENT_RE = new RegExp(
  '@\\w+|' + GLOSS_KEYS.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'g',
)

function renderContent(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  CONTENT_RE.lastIndex = 0
  while ((m = CONTENT_RE.exec(text)) !== null) {
    const tok = m[0]
    // vérifie les frontières de mot pour les termes glossaire
    if (!tok.startsWith('@')) {
      const before = text[m.index - 1]
      const after = text[m.index + tok.length]
      if ((before && /[\w-]/.test(before)) || (after && /[\w-]/.test(after))) continue
    }
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (tok.startsWith('@')) {
      parts.push(
        <span key={m.index} className="text-vert font-medium">{tok}</span>,
      )
    } else {
      const { id, def } = GLOSS_TERMS[tok]
      parts.push(
        <span key={m.index} className="relative group/gl">
          <Link
            href={`/glossaire#${id}`}
            className="text-vert border-b border-dashed border-[#9FE1CB] hover:border-vert"
            onClick={e => e.stopPropagation()}
          >
            {tok}
          </Link>
          <span className="invisible group-hover/gl:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[240px] bg-texte text-white rounded-lg p-3 z-50 shadow-xl pointer-events-none">
            <span className="block text-[12px] font-semibold mb-1">{tok}</span>
            <span className="block text-[11px] leading-[1.5] text-white/80">{def}</span>
          </span>
        </span>,
      )
    }
    last = m.index + tok.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)
}

// ═════════════════════════════════════════════════════════════════════
export default function CommunauteClient() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  // Feed
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'all' | 'tendances'>('all')
  const [catCounts, setCatCounts] = useState<Record<string, number>>({})

  // Compose
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeText, setComposeText] = useState('')
  const [composeCategory, setComposeCategory] = useState('general')
  const [composeImg, setComposeImg] = useState<string | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [mentionCandidates, setMentionCandidates] = useState<MentionCandidate[]>([])
  const [mentionHits, setMentionHits] = useState<MentionCandidate[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)
  const composeRef = useRef<HTMLTextAreaElement>(null)

  // Commentaires / réactions
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [commentData, setCommentData] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [showPicker, setShowPicker] = useState<string | null>(null)

  // Radar de sentiment
  const [svAssets, setSvAssets] = useState<string[]>([])
  const [svInput, setSvInput] = useState('')
  const [svSelected, setSvSelected] = useState<string | null>(null)
  const [svVotes, setSvVotes] = useState({ bull: 0, neut: 0, bear: 0, total: 0 })
  const [svMyVote, setSvMyVote] = useState<string | null>(null)

  // Prophètes
  const [prophet, setProphet] = useState<ProphetEntry[]>([])
  const [myScore, setMyScore] = useState<{ acc: number; xp: number } | null>(null)

  // Widgets
  const [trending, setTrending] = useState<{ cat: string; count: number }[]>([])
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([])
  const [stats, setStats] = useState({ posts: 0, likes: 0 })

  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  // ── Auth ────────────────────────────────────────────────────────────
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

  const prenomOf = useCallback((u: User) =>
    u.user_metadata?.prenom || u.email?.split('@')[0] || 'Membre', [])

  // ── Notifications (table) ───────────────────────────────────────────
  const createNotification = useCallback(async (
    targetUserId: string, type: string, content: string, postId?: string,
  ) => {
    if (!user || targetUserId === user.id) return
    await supabase.from('notifications').insert({
      user_id: targetUserId, type, content,
      from_user: prenomOf(user), post_id: postId || null,
    })
  }, [user, prenomOf])

  // ── Feed ────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    let q = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(30)
    if (activeCategory !== 'all') q = q.eq('category', activeCategory)
    const { data } = await q
    if (!data) { setLoading(false); return }

    const ids = data.map((p: Post) => p.id)
    if (ids.length === 0) { setPosts([]); setLoading(false); return }

    const [{ data: allLikes }, { data: allComments }, { data: myLikes }, { data: myBooks }] =
      await Promise.all([
        supabase.from('likes').select('post_id,reaction_type').in('post_id', ids),
        supabase.from('comments').select('id,post_id').in('post_id', ids),
        supabase.from('likes').select('post_id,reaction_type').eq('user_id', user.id).in('post_id', ids),
        supabase.from('bookmarks').select('post_id').eq('user_id', user.id).in('post_id', ids),
      ])

    const likesMap: Record<string, Record<string, number>> = {}
    for (const l of (allLikes || []) as { post_id: string; reaction_type: string }[]) {
      if (!likesMap[l.post_id]) likesMap[l.post_id] = {}
      likesMap[l.post_id][l.reaction_type] = (likesMap[l.post_id][l.reaction_type] || 0) + 1
    }
    const commentsMap: Record<string, number> = {}
    for (const c of (allComments || []) as { post_id: string }[]) {
      commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1
    }
    const myRxMap: Record<string, string> = {}
    for (const l of (myLikes || []) as { post_id: string; reaction_type: string }[]) {
      myRxMap[l.post_id] = l.reaction_type
    }
    const myBookSet = new Set(((myBooks || []) as { post_id: string }[]).map(b => b.post_id))

    let list: Post[] = data.map((p: Post) => ({
      ...p,
      likes: likesMap[p.id] || {},
      comment_count: commentsMap[p.id] || 0,
      my_reaction: myRxMap[p.id],
      bookmarked: myBookSet.has(p.id),
    }))

    if (activeTab === 'tendances') {
      const score = (p: Post) =>
        Object.values(p.likes).reduce((a, b) => a + b, 0) * 2 + p.comment_count
      list = [...list].sort((a, b) => score(b) - score(a))
    }

    setPosts(list)
    setLoading(false)
  }, [user, activeCategory, activeTab])

  // ── Compteurs réels des catégories ──────────────────────────────────
  const loadCatCounts = useCallback(async () => {
    const { data } = await supabase.from('posts').select('category').limit(2000)
    const counts: Record<string, number> = { all: (data || []).length }
    for (const p of (data || []) as { category: string }[]) {
      const c = p.category || 'general'
      counts[c] = (counts[c] || 0) + 1
    }
    setCatCounts(counts)
  }, [])

  // ── Widgets sidebar droite ──────────────────────────────────────────
  const loadTrending = useCallback(async () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase.from('posts').select('category').gte('created_at', lastWeek)
    const counts: Record<string, number> = {}
    for (const p of (data || []) as { category: string }[]) {
      const c = p.category || 'general'
      counts[c] = (counts[c] || 0) + 1
    }
    setTrending(
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, count]) => ({ cat, count })),
    )
  }, [])

  const loadActiveMembers = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('posts').select('user_id, prenom')
      .order('created_at', { ascending: false }).limit(50)
    const counts: Record<string, number> = {}
    const prenoms: Record<string, string> = {}
    for (const p of (data || []) as { user_id: string; prenom: string }[]) {
      if (!p.user_id) continue
      counts[p.user_id] = (counts[p.user_id] || 0) + 1
      prenoms[p.user_id] = p.prenom || 'Membre'
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
    if (top.length === 0) { setActiveMembers([]); return }

    const ids = top.map(([id]) => id)
    const { data: myFollows } = await supabase
      .from('follows').select('followed_id')
      .eq('follower_id', user.id).in('followed_id', ids)
    const followSet = new Set(((myFollows || []) as { followed_id: string }[]).map(f => f.followed_id))

    setActiveMembers(top.map(([id, count]) => ({
      user_id: id, prenom: prenoms[id], count, following: followSet.has(id),
    })))
  }, [user])

  const loadStats = useCallback(async () => {
    const [{ count: totalPosts }, { count: totalLikes }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*', { count: 'exact', head: true }),
    ])
    setStats({ posts: totalPosts || 0, likes: totalLikes || 0 })
  }, [])

  const loadProphetLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('prophet_scores')
      .select('prenom,correct_predictions,total_predictions,xp')
      .order('xp', { ascending: false })
      .limit(5)
    setProphet((data as ProphetEntry[]) || [])
  }, [])

  const loadMyProphetScore = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('prophet_scores')
      .select('correct_predictions,total_predictions,xp')
      .eq('user_id', user.id).maybeSingle()
    if (!data || data.total_predictions === 0) { setMyScore(null); return }
    setMyScore({
      acc: Math.round((data.correct_predictions / data.total_predictions) * 100),
      xp: data.xp,
    })
  }, [user])

  // ── Vérification des prédictions de la semaine passée ───────────────
  const verifyLastWeekPredictions = useCallback(async () => {
    if (!user) return
    const lastWk = lastWeekKey()
    try {
      const { data: score } = await supabase
        .from('prophet_scores')
        .select('last_verified_week').eq('user_id', user.id).maybeSingle()
      if (score?.last_verified_week === lastWk) { loadMyProphetScore(); return }

      const { data: votes } = await supabase
        .from('sentiment_votes')
        .select('asset, sentiment').eq('user_id', user.id).eq('week_key', lastWk)
      if (!votes || votes.length === 0) return

      let correct = 0
      let counted = 0
      for (const v of votes as { asset: string; sentiment: string }[]) {
        const r = await fetch(`/api/asset-return?asset=${encodeURIComponent(v.asset.toUpperCase())}`)
        const { pct } = await r.json()
        if (pct === null || pct === undefined) continue
        counted++
        const dir = pct > 1.0 ? 'bullish' : pct < -1.0 ? 'bearish' : 'neutral'
        if (dir === v.sentiment) correct++
      }
      const total = votes.length
      const perfect = counted > 0 && correct === counted
      const xpGain = correct * 50 + (perfect ? 100 : 0)

      const { data: cur } = await supabase
        .from('prophet_scores')
        .select('total_predictions,correct_predictions,xp')
        .eq('user_id', user.id).maybeSingle()

      await supabase.from('prophet_scores').upsert({
        user_id: user.id,
        prenom: prenomOf(user),
        total_predictions: (cur?.total_predictions || 0) + total,
        correct_predictions: (cur?.correct_predictions || 0) + correct,
        xp: (cur?.xp || 0) + xpGain,
        last_verified_week: lastWk,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      if (total > 0) showToast(`🎯 Prédictions vérifiées : ${correct}/${total} justes · +${xpGain} XP`)
      loadMyProphetScore()
      loadProphetLeaderboard()
    } catch { /* silencieux */ }
  }, [user, prenomOf, loadMyProphetScore, loadProphetLeaderboard])

  // ── Radar de sentiment ──────────────────────────────────────────────
  const loadSentimentAssets = useCallback(async () => {
    const wk = svWeekKey()
    const { data } = await supabase.from('sentiment_votes').select('asset').eq('week_key', wk)
    const assets = [...new Set(((data || []) as { asset: string }[]).map(r => r.asset))].sort()
    setSvAssets(assets)
    return assets
  }, [])

  const loadSentimentVotes = useCallback(async (asset: string) => {
    if (!user) return
    const wk = svWeekKey()
    const { data } = await supabase
      .from('sentiment_votes')
      .select('sentiment, user_id').eq('asset', asset).eq('week_key', wk)
    const rows = (data || []) as { sentiment: string; user_id: string }[]
    const bull = rows.filter(r => r.sentiment === 'bullish').length
    const neut = rows.filter(r => r.sentiment === 'neutral').length
    const bear = rows.filter(r => r.sentiment === 'bearish').length
    setSvVotes({ bull, neut, bear, total: bull + neut + bear })
    setSvMyVote(rows.find(r => r.user_id === user.id)?.sentiment || null)
  }, [user])

  const selectAsset = useCallback((asset: string) => {
    const norm = asset.trim().toUpperCase().replace(/\s+/g, ' ')
    if (!norm) return
    setSvSelected(norm)
    setSvAssets(prev => prev.includes(norm) ? prev : [...prev, norm].sort())
    loadSentimentVotes(norm)
  }, [loadSentimentVotes])

  async function voteSentiment(sentiment: string) {
    if (!user || !svSelected) return
    await supabase.from('sentiment_votes').upsert(
      { user_id: user.id, asset: svSelected, sentiment, week_key: svWeekKey() },
      { onConflict: 'user_id,asset,week_key' },
    )
    loadSentimentVotes(svSelected)
  }

  // ── Chargement initial + realtime ───────────────────────────────────
  useEffect(() => {
    if (user) { loadPosts() }
  }, [user, activeCategory, activeTab, loadPosts])

  useEffect(() => {
    if (!user) return
    loadCatCounts()
    loadTrending()
    loadActiveMembers()
    loadStats()
    loadProphetLeaderboard()
    verifyLastWeekPredictions()
    loadSentimentAssets().then(assets => {
      if (assets.length) {
        setSvSelected(assets[0])
        loadSentimentVotes(assets[0])
      }
    })
    // Candidats aux mentions
    supabase.from('posts').select('prenom,user_id')
      .order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => {
        const seen = new Set<string>()
        setMentionCandidates(
          ((data || []) as MentionCandidate[]).filter(p => {
            if (!p.prenom || seen.has(p.user_id)) return false
            seen.add(p.user_id)
            return true
          }),
        )
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user) return
    const wk = svWeekKey()
    const ch = supabase.channel(`community-rt-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        const p = payload.new as { user_id: string; prenom?: string }
        if (p.user_id !== user.id) showToast(`🔔 Nouveau post de ${p.prenom || 'un membre'}`)
        loadPosts()
        loadCatCounts()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, async payload => {
        const l = payload.new as { post_id: string; user_id: string }
        if (l.user_id !== user.id) {
          const { data: post } = await supabase.from('posts').select('user_id').eq('id', l.post_id).single()
          if (post?.user_id === user.id) showToast('❤️ Quelqu’un a réagi à ton post !')
        }
        loadPosts()
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'sentiment_votes', filter: `week_key=eq.${wk}`,
      }, () => {
        loadSentimentAssets()
        if (svSelected) loadSentimentVotes(svSelected)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Actions posts ───────────────────────────────────────────────────
  async function react(postId: string, type: string) {
    if (!user) return
    const post = posts.find(p => p.id === postId)
    const cur = post?.my_reaction
    if (cur === type) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('likes').upsert(
        { post_id: postId, user_id: user.id, reaction_type: type },
        { onConflict: 'post_id,user_id' },
      )
      if (!cur && post && post.user_id !== user.id) {
        createNotification(
          post.user_id, 'like',
          `${prenomOf(user)} a réagi ${RXEMOJI[type]} à ton post : « ${post.content.substring(0, 50)}… »`,
          postId,
        )
      }
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
      showToast('🔖 Post enregistré')
    }
    loadPosts()
  }

  async function deletePost(postId: string) {
    if (!confirm('Supprimer ce post ?')) return
    await supabase.from('posts').delete().eq('id', postId)
    loadPosts()
    loadCatCounts()
  }

  function sharePost(postId: string) {
    const url = `${window.location.origin}/communaute#${postId}`
    navigator.clipboard?.writeText(url).catch(() => {})
    showToast('🔗 Lien copié !')
  }

  // ── Compose ─────────────────────────────────────────────────────────
  function onComposeInput(v: string) {
    setComposeText(v)
    const m = v.match(/@(\w*)$/)
    if (m) {
      const q = m[1].toLowerCase()
      const hits = mentionCandidates
        .filter(c => !q || c.prenom.toLowerCase().startsWith(q))
        .filter(c => c.user_id !== user?.id)
        .slice(0, 5)
      setMentionHits(hits)
    } else {
      setMentionHits([])
    }
  }

  function insertMention(prenom: string) {
    setComposeText(t => t.replace(/@\w*$/, '@' + prenom + ' '))
    setMentionHits([])
    composeRef.current?.focus()
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const MAX = 900
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        setComposeImg(canvas.toDataURL('image/jpeg', 0.78))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function publishPost() {
    if (!user || !composeText.trim()) return
    setPublishing(true)
    const content = composeText.trim()
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      prenom: prenomOf(user),
      content,
      category: composeCategory,
      link_url: linkUrl.trim() || null,
      link_title: linkTitle.trim() || null,
      ...(composeImg ? { image_url: composeImg } : {}),
    })
    if (error) {
      showToast('⚠️ Erreur lors de la publication')
      setPublishing(false)
      return
    }
    // Notifications @mentions
    const mentioned = [...new Set(content.match(/@(\w+)/g) || [])]
    for (const mm of mentioned) {
      const name = mm.slice(1)
      const found = mentionCandidates.find(c => c.prenom.toLowerCase() === name.toLowerCase())
      if (found) createNotification(found.user_id, 'mention', `${prenomOf(user)} t'a mentionné dans un post`)
    }
    setComposeText(''); setComposeImg(null); setLinkUrl(''); setLinkTitle('')
    setLinkOpen(false); setComposeOpen(false); setPublishing(false)
    showToast('✓ Publié !')
    loadPosts()
    loadCatCounts()
    loadTrending()
    loadStats()
  }

  // ── Commentaires ────────────────────────────────────────────────────
  async function toggleComments(postId: string) {
    const opening = !openComments[postId]
    setOpenComments(prev => ({ ...prev, [postId]: opening }))
    if (opening && !commentData[postId]) await loadComments(postId)
  }

  async function loadComments(postId: string) {
    const { data } = await supabase
      .from('comments').select('*').eq('post_id', postId)
      .order('created_at', { ascending: true })
    setCommentData(prev => ({ ...prev, [postId]: (data as Comment[]) || [] }))
  }

  async function submitComment(postId: string) {
    if (!user || !commentText[postId]?.trim()) return
    const content = commentText[postId].trim()
    await supabase.from('comments').insert({
      post_id: postId, user_id: user.id, content, prenom: prenomOf(user),
    })
    const post = posts.find(p => p.id === postId)
    if (post && post.user_id !== user.id) {
      createNotification(
        post.user_id, 'comment',
        `${prenomOf(user)} a commenté ton post : « ${post.content.substring(0, 50)}… »`,
        postId,
      )
    }
    setCommentText(prev => ({ ...prev, [postId]: '' }))
    loadComments(postId)
    loadPosts()
  }

  // ── Follow ──────────────────────────────────────────────────────────
  async function followUser(member: ActiveMember) {
    if (!user) return
    if (member.following) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('followed_id', member.user_id)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, followed_id: member.user_id })
      createNotification(member.user_id, 'follow', `${prenomOf(user)} a commencé à te suivre !`)
    }
    setActiveMembers(prev => prev.map(m =>
      m.user_id === member.user_id ? { ...m, following: !m.following } : m,
    ))
  }

  // ── Divers ──────────────────────────────────────────────────────────
  const totalRx = (likes: Record<string, number>) => Object.values(likes).reduce((a, b) => a + b, 0)
  const svPct = (n: number) => (svVotes.total > 0 ? Math.round((n / svVotes.total) * 100) : 0)
  const userInitial = user ? prenomOf(user).charAt(0).toUpperCase() : '?'
  const myColor = avColor(user?.id || 'x')
  const catLabel = (c: string) => c === 'general' ? 'Général' : (CATS.find(x => x.id === c)?.label || c.charAt(0).toUpperCase() + c.slice(1))

  // ── GATE (non connecté) ─────────────────────────────────────────────
  if (authReady && !user) {
    return (
      <div className="min-h-screen font-sans bg-fond">
        <Nav />
        <div className="fixed inset-0 top-[57px] z-[998] grid grid-cols-2 max-md:grid-cols-1">
          <div className="relative overflow-hidden flex flex-col justify-center px-16 py-12 max-md:hidden" style={{ background: '#085041' }}>
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
                  { icon: '🎯', title: 'Pose tes vraies questions', sub: 'PEA, ETF, SCPI, fiscalité… la communauté répond' },
                  { icon: '📈', title: 'Suis les vrais investisseurs', sub: 'Portefeuilles partagés et stratégies réelles' },
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
          <div className="bg-fond flex flex-col items-center justify-center px-12 max-md:px-6">
            <div className="w-full max-w-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-[#E1F5EE] flex items-center justify-center text-[24px] mb-6">🔐</div>
              <h3 className="text-[24px] font-semibold tracking-tight mb-2">Accès membres</h3>
              <p className="text-[14px] text-muted mb-8">La communauté est réservée aux membres Finko.</p>
              <Link href="/connexion?tab=register" className="block w-full text-center bg-vert text-white px-6 py-3.5 rounded-xl text-[14px] font-medium mb-3 hover:bg-vert-hover transition-colors">
                Créer mon compte gratuit
              </Link>
              <Link href="/connexion" className="block w-full text-center bg-fond-gris text-texte border border-bordure px-6 py-3.5 rounded-xl text-[14px] hover:bg-[#ececea] transition-colors">
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

  // ── PAGE ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-fond-gris font-sans" onClick={() => { setShowPicker(null); setMentionHits([]) }}>
      <Nav />

      <div className="grid max-w-[1100px] mx-auto min-h-[calc(100vh-57px)] max-md:grid-cols-1" style={{ gridTemplateColumns: '220px 1fr 260px' }}>

        {/* ── SIDEBAR GAUCHE ── */}
        <aside className="border-r border-bordure bg-fond py-6 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto max-md:hidden">
          <div className="px-5 mb-6">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#aaa] mb-3">Fil</p>
            {[
              { id: 'all',       label: 'Tout le fil', icon: <IconLayoutList size={15} /> },
              { id: 'recent',    label: 'Récent',      icon: <IconClock size={15} /> },
              { id: 'tendances', label: 'Tendances',   icon: <IconFlame size={15} /> },
            ].map(item => {
              const active = item.id === 'all'
                ? activeCategory === 'all' && activeTab === 'all'
                : item.id === 'tendances'
                  ? activeTab === 'tendances'
                  : false
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveCategory('all')
                    setActiveTab(item.id === 'tendances' ? 'tendances' : 'all')
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] mb-0.5 text-left cursor-pointer font-sans border-none transition-colors ${
                    active ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium' : 'text-muted bg-transparent hover:bg-fond-gris'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.id === 'all' && catCounts.all !== undefined && (
                    <span className="ml-auto text-[11px] text-[#aaa] bg-fond-gris px-1.5 py-0.5 rounded-full">
                      {catCounts.all}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="px-5">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-[#aaa] mb-3">Catégories</p>
            {CATS.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setActiveTab('all') }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] mb-0.5 text-left cursor-pointer font-sans border-none transition-colors ${
                    activeCategory === cat.id ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium' : 'text-muted bg-transparent hover:bg-fond-gris'
                  }`}
                >
                  <Icon size={15} />
                  {cat.label}
                  <span className="ml-auto text-[11px] text-[#aaa] bg-fond-gris px-1.5 py-0.5 rounded-full">
                    {catCounts[cat.id] || 0}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── FIL CENTRAL ── */}
        <main className="border-r border-bordure max-md:border-r-0">
          {/* Compose */}
          <div className="bg-fond border-b border-bordure p-5" onClick={e => e.stopPropagation()}>
            <input type="file" ref={photoInputRef} accept="image/*" className="hidden" onChange={onPhotoChange} />
            {!composeOpen ? (
              <div className="flex gap-2.5 items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0" style={{ background: myColor.bg, color: myColor.text }}>
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
              <div className="relative">
                <div className="flex gap-2.5 items-start mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0 mt-1" style={{ background: myColor.bg, color: myColor.text }}>
                    {userInitial}
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      ref={composeRef}
                      autoFocus
                      value={composeText}
                      onChange={e => onComposeInput(e.target.value)}
                      placeholder="Partage ton expérience ou pose une question... (@mention, termes du glossaire reconnus)"
                      rows={4}
                      className="w-full border border-[#ccc] rounded-xl px-4 py-2.5 text-[14px] font-sans resize-none outline-none focus:border-vert bg-fond text-texte"
                    />
                    {/* Dropdown mentions */}
                    {mentionHits.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 bg-fond border border-bordure rounded-xl shadow-lg z-50 overflow-hidden min-w-[180px]">
                        {mentionHits.map(c => {
                          const col = avColor(c.user_id)
                          return (
                            <button
                              key={c.user_id}
                              onMouseDown={e => { e.preventDefault(); insertMention(c.prenom) }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-texte bg-transparent border-none cursor-pointer font-sans hover:bg-fond-gris transition-colors"
                            >
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium" style={{ background: col.bg, color: col.text }}>
                                {c.prenom.charAt(0).toUpperCase()}
                              </span>
                              {c.prenom}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Aperçu image */}
                {composeImg && (
                  <div className="ml-[46px] mb-3 relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={composeImg} alt="Aperçu" className="max-h-[160px] max-w-full rounded-lg block" />
                    <button
                      onClick={() => setComposeImg(null)}
                      className="absolute top-1.5 right-1.5 bg-black/55 text-white border-none rounded-full w-6 h-6 cursor-pointer flex items-center justify-center"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                )}

                {/* Formulaire lien */}
                {linkOpen && (
                  <div className="ml-[46px] mb-3 flex gap-2 flex-wrap">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      placeholder="URL du lien"
                      className="flex-1 min-w-[200px] px-2.5 py-[7px] border border-[#ccc] rounded-md text-[12px] font-sans outline-none focus:border-vert bg-fond text-texte"
                    />
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={e => setLinkTitle(e.target.value)}
                      placeholder="Titre (optionnel)"
                      className="flex-1 min-w-[150px] px-2.5 py-[7px] border border-[#ccc] rounded-md text-[12px] font-sans outline-none focus:border-vert bg-fond text-texte"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 ml-[46px] flex-wrap">
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className={`flex items-center gap-1 text-[12px] border rounded-lg px-2.5 py-1.5 cursor-pointer font-sans transition-colors ${
                      composeImg ? 'text-vert border-vert bg-[#E1F5EE]' : 'text-muted border-bordure bg-fond-gris hover:border-vert'
                    }`}
                  >
                    <IconPhoto size={14} /> Photo
                  </button>
                  <button
                    onClick={() => setLinkOpen(!linkOpen)}
                    className={`flex items-center gap-1 text-[12px] border rounded-lg px-2.5 py-1.5 cursor-pointer font-sans transition-colors ${
                      linkOpen || linkUrl ? 'text-vert border-vert bg-[#E1F5EE]' : 'text-muted border-bordure bg-fond-gris hover:border-vert'
                    }`}
                  >
                    <IconLink size={14} /> Lien
                  </button>
                  <select
                    value={composeCategory}
                    onChange={e => setComposeCategory(e.target.value)}
                    className="text-[12px] text-muted border border-bordure rounded-lg px-2.5 py-1.5 bg-fond-gris outline-none cursor-pointer font-sans"
                  >
                    {COMPOSE_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <button
                    onClick={() => { setComposeOpen(false); setComposeText(''); setComposeImg(null); setLinkOpen(false) }}
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

          {/* Onglets du fil */}
          <div className="flex border-b border-bordure bg-fond">
            {([['all', 'Tout le fil'], ['tendances', 'Tendances']] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-6 py-3.5 text-[13px] border-b-2 -mb-px cursor-pointer font-sans bg-transparent border-x-0 border-t-0 transition-colors ${
                  activeTab === id ? 'text-vert border-vert font-medium' : 'text-muted border-transparent hover:text-texte'
                }`}
              >
                {label}
              </button>
            ))}
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="ml-auto mr-4 my-2 flex items-center gap-1 text-[11px] text-[#0F6E56] bg-[#E1F5EE] border-none px-2.5 py-1 rounded-full cursor-pointer font-sans"
              >
                {catLabel(activeCategory)} <IconX size={12} />
              </button>
            )}
          </div>

          {/* Posts */}
          {loading && posts.length === 0 && (
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
            const rxEntries = Object.entries(post.likes).sort((a, b) => b[1] - a[1])
            return (
              <div key={post.id} id={post.id} className="bg-fond border-b border-bordure px-6 py-5 hover:bg-[#fafafa] transition-colors">
                <div className="flex gap-2.5 mb-3 items-start">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0" style={{ background: col.bg, color: col.text }}>
                    {(post.prenom?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium">{post.prenom}</div>
                    <div className="text-[11px] text-[#aaa]">{timeAgo(post.created_at)}</div>
                  </div>
                  {post.category && post.category !== 'general' && (
                    <button
                      onClick={() => { setActiveCategory(post.category); setActiveTab('all') }}
                      className="text-[10px] font-medium tracking-wide uppercase bg-[#E1F5EE] text-[#0F6E56] border-none px-2 py-0.5 rounded-full cursor-pointer font-sans"
                    >
                      {catLabel(post.category)}
                    </button>
                  )}
                </div>

                <p className="text-[14px] text-texte leading-relaxed mb-3 whitespace-pre-wrap">
                  {renderContent(post.content)}
                </p>

                {/* Image du post */}
                {post.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image_url} alt="" className="max-h-[320px] max-w-full rounded-xl mb-3 block" />
                )}

                {/* Carte lien */}
                {post.link_url && (
                  <a
                    href={post.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 border border-bordure rounded-xl px-4 py-3 mb-3 bg-fond-gris hover:border-vert transition-colors group/link"
                  >
                    <IconLink size={16} className="text-vert shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-texte truncate group-hover/link:text-vert transition-colors">
                        {post.link_title || post.link_url}
                      </div>
                      <div className="text-[11px] text-[#aaa] truncate">{post.link_url}</div>
                    </div>
                  </a>
                )}

                {/* Récap réactions */}
                {rxTotal > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    {rxEntries.slice(0, 3).map(([type]) => (
                      <span key={type} className="text-[13px]">{RXEMOJI[type] || type}</span>
                    ))}
                    <span className="text-[11px] text-[#aaa] ml-1">{rxTotal}</span>
                  </div>
                )}

                <div className="flex items-center gap-0.5 flex-wrap" onClick={e => e.stopPropagation()}>
                  {/* Réaction */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPicker(showPicker === post.id ? null : post.id)}
                      className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans transition-colors ${
                        post.my_reaction ? 'text-[#0F6E56] bg-[#E1F5EE]' : 'text-[#aaa] bg-transparent hover:bg-fond-gris hover:text-vert'
                      }`}
                    >
                      <span>{post.my_reaction ? RXEMOJI[post.my_reaction] : '❤️'}</span>
                      <span>{post.my_reaction ? RXLABELS[post.my_reaction] : 'Réagir'}</span>
                    </button>
                    {showPicker === post.id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-fond border border-bordure rounded-[24px] px-2 py-1.5 flex gap-0.5 shadow-lg z-50">
                        {Object.entries(RXEMOJI).map(([type, emoji]) => (
                          <button
                            key={type}
                            onClick={() => react(post.id, type)}
                            title={RXLABELS[type]}
                            className={`text-[22px] px-1.5 py-1 rounded-xl border-none cursor-pointer transition-transform hover:scale-125 ${
                              post.my_reaction === type ? 'bg-[#E1F5EE]' : 'bg-transparent'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-[12px] text-[#aaa] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans bg-transparent hover:bg-fond-gris hover:text-vert transition-colors"
                  >
                    <IconMessageCircle size={15} />
                    {post.comment_count > 0 && <span>{post.comment_count}</span>}
                  </button>

                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans bg-transparent transition-colors ${
                      post.bookmarked ? 'text-vert' : 'text-[#aaa] hover:bg-fond-gris hover:text-vert'
                    }`}
                  >
                    <IconBookmark size={15} className={post.bookmarked ? 'fill-current' : ''} />
                  </button>

                  <button
                    onClick={() => sharePost(post.id)}
                    className="flex items-center gap-1.5 text-[12px] text-[#aaa] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans bg-transparent hover:bg-fond-gris hover:text-vert transition-colors"
                  >
                    <IconShare size={15} />
                  </button>

                  {post.user_id === user?.id && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="ml-auto flex items-center gap-1.5 text-[12px] text-[#aaa] px-2.5 py-1.5 rounded-lg border-none cursor-pointer font-sans bg-transparent hover:bg-[#FEF2F2] hover:text-[#E24B4A] transition-colors"
                    >
                      <IconTrash size={15} />
                    </button>
                  )}
                </div>

                {/* Commentaires */}
                {openComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-bordure" onClick={e => e.stopPropagation()}>
                    {(commentData[post.id] || []).map(c => {
                      const cCol = avColor(c.user_id)
                      return (
                        <div key={c.id} className="flex gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0" style={{ background: cCol.bg, color: cCol.text }}>
                            {(c.prenom?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="bg-fond-gris rounded-xl px-3 py-2 flex-1">
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className="text-[12px] font-medium">{c.prenom}</span>
                              <span className="text-[10px] text-[#aaa]">{timeAgo(c.created_at)}</span>
                            </div>
                            <div className="text-[13px] text-texte">{renderContent(c.content)}</div>
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex gap-2 mt-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0" style={{ background: myColor.bg, color: myColor.text }}>
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

        {/* ── SIDEBAR DROITE ── */}
        <aside className="px-5 py-6 bg-fond sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto max-md:static max-md:h-auto">

          {/* Radar de sentiment */}
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-1 flex items-center gap-1.5">
              <IconRadar size={13} /> Radar de sentiment
            </p>
            <p className="text-[10px] text-[#aaa] mb-3">{svExpiryLabel()}</p>

            {myScore && (
              <div className="flex items-center gap-1.5 bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-medium px-2.5 py-1.5 rounded-lg mb-3">
                <IconTrophy size={13} /> Ton score : {myScore.acc}% · {myScore.xp} XP
              </div>
            )}

            <div className="flex gap-1.5 mb-2">
              <input
                type="text"
                value={svInput}
                onChange={e => setSvInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && svInput.trim()) { selectAsset(svInput); setSvInput('') } }}
                placeholder="Saisir un actif..."
                className="flex-1 min-w-0 px-2.5 py-1.5 border border-bordure rounded-lg text-[12px] outline-none focus:border-vert bg-fond-gris text-texte font-sans"
              />
              <button
                onClick={() => { if (svInput.trim()) { selectAsset(svInput); setSvInput('') } }}
                className="w-8 h-8 border border-bordure rounded-lg bg-fond-gris flex items-center justify-center cursor-pointer hover:bg-[#E1F5EE] hover:border-vert transition-colors shrink-0"
              >
                <IconArrowRight size={14} className="text-vert" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {svAssets.length === 0 ? (
                <span className="text-[11px] text-[#aaa] italic">Aucun actif cette semaine — saisis le premier !</span>
              ) : (
                svAssets.map(chip => (
                  <button
                    key={chip}
                    onClick={() => selectAsset(chip)}
                    className={`text-[11px] px-2.5 py-1 rounded-xl border cursor-pointer font-sans transition-all ${
                      svSelected === chip
                        ? 'bg-[#E1F5EE] border-vert text-[#085041] font-medium'
                        : 'bg-fond-gris border-bordure text-muted hover:border-vert hover:text-[#085041] hover:bg-[#E1F5EE]'
                    }`}
                  >
                    {chip}
                  </button>
                ))
              )}
            </div>

            {svSelected && (
              <>
                <p className="text-[12px] font-semibold text-texte mb-3">{svSelected} — semaine en cours</p>
                <div className="h-2.5 rounded-full overflow-hidden bg-[#e5e5e5] flex mb-3">
                  <div className="h-full transition-all duration-500" style={{ width: svPct(svVotes.bull) + '%', background: '#1D9E75' }} />
                  <div className="h-full transition-all duration-500" style={{ width: svPct(svVotes.neut) + '%', background: '#bbb' }} />
                  <div className="h-full transition-all duration-500" style={{ width: svPct(svVotes.bear) + '%', background: '#E24B4A' }} />
                </div>
                <div className="flex gap-1.5 mb-3">
                  {[
                    { key: 'bullish', label: 'Haussier', emoji: '📈', active: 'border-vert bg-[#E1F5EE] text-[#0F6E56]', hover: 'hover:border-vert hover:bg-[#E1F5EE]' },
                    { key: 'neutral', label: 'Neutre',   emoji: '➡️', active: 'border-[#999] bg-[#f0f0ee] text-[#333]',  hover: 'hover:border-[#999]' },
                    { key: 'bearish', label: 'Baissier', emoji: '📉', active: 'border-[#E24B4A] bg-[#FDECEA] text-[#8B1A1A]', hover: 'hover:border-[#E24B4A]' },
                  ].map(btn => (
                    <button
                      key={btn.key}
                      onClick={() => voteSentiment(btn.key)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border-[1.5px] bg-fond cursor-pointer font-sans text-[10px] font-medium text-muted transition-all ${
                        svMyVote === btn.key ? btn.active : `border-bordure ${btn.hover}`
                      }`}
                    >
                      <span className="text-[17px]">{btn.emoji}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
                {[
                  { label: 'Haussier', n: svVotes.bull, color: '#1D9E75' },
                  { label: 'Neutre',   n: svVotes.neut, color: '#bbb'    },
                  { label: 'Baissier', n: svVotes.bear, color: '#E24B4A' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="flex-1 text-[11px] text-muted">{r.label}</span>
                    <span className="text-[11px] font-medium min-w-[30px] text-right" style={{ color: r.color }}>
                      {svVotes.total > 0 ? svPct(r.n) + ' %' : '—'}
                    </span>
                  </div>
                ))}
                <p className="text-[11px] text-[#aaa] text-center mt-2">
                  {svVotes.total > 0 ? `${svVotes.total} vote${svVotes.total > 1 ? 's' : ''}` : 'Sois le premier à voter'}
                </p>
              </>
            )}
          </div>

          {/* Prophètes */}
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
              <IconTrophy size={13} /> Prophètes de la semaine
            </p>
            {prophet.length === 0 ? (
              <p className="text-[12px] text-[#aaa] italic">Sois le premier à voter !</p>
            ) : (
              prophet.map((p, i) => {
                const medals = ['🥇', '🥈', '🥉', '4.', '5.']
                const acc = p.total_predictions > 0 ? Math.round((p.correct_predictions / p.total_predictions) * 100) : 0
                return (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-[#f0f0ee] last:border-0 text-[13px]">
                    <span className="text-[15px] min-w-[22px] text-center">{medals[i]}</span>
                    <span className="flex-1 font-medium truncate">{p.prenom || 'Membre'}</span>
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
            {trending.length === 0 ? (
              <p className="text-[12px] text-[#aaa] italic">Aucun post cette semaine</p>
            ) : (
              trending.map((t, i) => (
                <button
                  key={t.cat}
                  onClick={() => { setActiveCategory(t.cat === 'general' ? 'all' : t.cat); setActiveTab('all') }}
                  className="w-full flex gap-2.5 py-2.5 border-b border-bordure last:border-0 cursor-pointer bg-transparent border-x-0 border-t-0 text-left font-sans hover:bg-fond-gris rounded-lg -mx-1 px-1 transition-colors"
                >
                  <span className="text-[15px] font-medium text-[#ccc] min-w-[18px]">{i + 1}</span>
                  <span>
                    <span className="block text-[13px] font-medium text-texte">#{catLabel(t.cat)}</span>
                    <span className="block text-[11px] text-[#aaa]">{t.count} post{t.count > 1 ? 's' : ''} cette semaine</span>
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Membres actifs */}
          <div className="mb-8">
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
              <IconAward size={13} /> Membres actifs
            </p>
            {activeMembers.length === 0 ? (
              <p className="text-[12px] text-[#aaa] italic">Poste pour apparaître ici !</p>
            ) : (
              activeMembers.map((m, i) => {
                const col = AV_PALETTE[i % AV_PALETTE.length]
                const isMe = m.user_id === user?.id
                return (
                  <div key={m.user_id} className="flex items-center gap-2.5 py-2.5 border-b border-bordure last:border-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0" style={{ background: col.bg, color: col.text }}>
                      {m.prenom.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">
                        {m.prenom} {isMe && <span className="text-[10px] text-vert">(toi)</span>}
                      </div>
                      <div className="text-[11px] text-[#aaa]">{m.count} post{m.count > 1 ? 's' : ''}</div>
                    </div>
                    {!isMe && (
                      <button
                        onClick={() => followUser(m)}
                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full cursor-pointer font-sans transition-all ${
                          m.following
                            ? 'bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]'
                            : 'text-vert border border-[#9FE1CB] bg-transparent hover:bg-[#E1F5EE]'
                        }`}
                      >
                        {m.following ? <><IconCheck size={12} /> Suivi</> : <><IconPlus size={12} /> Suivre</>}
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Stats */}
          <div>
            <p className="text-[10px] font-medium tracking-[2px] uppercase text-vert mb-4 flex items-center gap-1.5">
              <IconChartBar size={13} /> La communauté
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                [String(stats.posts), 'posts'],
                [String(stats.likes), 'réactions'],
                ['12', 'webinaires'],
                ['🇫🇷', '100% français'],
              ].map(([n, l]) => (
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
        <div className="fixed bottom-6 right-6 bg-texte text-white px-5 py-3 rounded-[10px] text-[14px] z-[9999] font-sans shadow-xl max-w-[320px] animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
