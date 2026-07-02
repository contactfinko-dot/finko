'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  IconLayoutDashboard, IconFlag, IconUsers, IconVideo, IconBook,
  IconSpeakerphone, IconTypography, IconShieldCheck, IconTrash,
  IconCheck, IconX, IconPlus, IconBan, IconPencil,
  IconMessages, IconHeart, IconAlertTriangle, IconPin, IconPinFilled,
  IconEye, IconEyeOff, IconLogout,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

// ── Types ────────────────────────────────────────────────────────────
interface Profile { id: string; email: string | null; prenom: string | null; nom: string | null; created_at: string }
interface Report {
  id: string; post_id: string | null; comment_id: string | null
  reporter_id: string; reason: string; status: string; created_at: string
  content?: string; author_id?: string; author?: string
}
interface Webinar {
  id: string; title: string; description: string | null; category: string
  host_name: string | null; host_role: string | null; date_label: string | null
  inscrits: number; status: string; featured: boolean; accent: string
}
interface GlossTerm { id: string; term: string; slug: string; definition: string; category: string }
interface Announcement { id: string; title: string; content: string | null; pinned: boolean; active: boolean; created_at: string }
interface SiteContent { key: string; label: string; value: string }

type TabId = 'dashboard' | 'moderation' | 'membres' | 'webinaires' | 'glossaire' | 'annonces' | 'contenus'

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'dashboard',  label: 'Tableau de bord', icon: IconLayoutDashboard },
  { id: 'moderation', label: 'Modération',      icon: IconFlag },
  { id: 'membres',    label: 'Membres',         icon: IconUsers },
  { id: 'webinaires', label: 'Webinaires',      icon: IconVideo },
  { id: 'glossaire',  label: 'Glossaire',       icon: IconBook },
  { id: 'annonces',   label: 'Annonces',        icon: IconSpeakerphone },
  { id: 'contenus',   label: 'Textes du site',  icon: IconTypography },
]

const WB_STATUS = [
  { value: 'upcoming',  label: 'À venir' },
  { value: 'live',      label: 'En direct' },
  { value: 'replay',    label: 'Replay' },
  { value: 'brouillon', label: 'Brouillon (masqué)' },
]

const WB_CATS = ['Général', 'Immobilier', 'ETF', 'PER', 'Fiscalité', 'IA & Finance', 'Débutant', 'Actions', 'Crypto']

const inputCls = 'w-full px-3 py-2 border border-[#ccc] rounded-lg text-[13px] bg-fond text-texte outline-none focus:border-vert font-sans'
const btnPrimary = 'flex items-center gap-1.5 bg-vert text-white border-none px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-vert-hover transition-colors font-sans disabled:opacity-50'
const btnGhost = 'flex items-center gap-1 text-[12px] text-muted border border-bordure bg-fond px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-fond-gris transition-colors font-sans'
const btnDanger = 'flex items-center gap-1 text-[12px] text-[#E24B4A] border border-[#F09595] bg-fond px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-[#FFF5F5] transition-colors font-sans'

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ═════════════════════════════════════════════════════════════════════
export default function AdminClient() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState<TabId>('dashboard')
  const [toast, setToast] = useState('')

  // Données par onglet
  const [stats, setStats] = useState({ membres: 0, posts: 0, likes: 0, comments: 0, reports: 0, webinars: 0 })
  const [reports, setReports] = useState<Report[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set())
  const [bannedIds, setBannedIds] = useState<Set<string>>(new Set())
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [glossTerms, setGlossTerms] = useState<GlossTerm[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [contents, setContents] = useState<SiteContent[]>([])

  // Formulaires
  const [wbForm, setWbForm] = useState<Partial<Webinar> | null>(null)
  const [glForm, setGlForm] = useState<Partial<GlossTerm> | null>(null)
  const [anForm, setAnForm] = useState<Partial<Announcement> | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // ── Auth + vérification admin ───────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/connexion'); return }
      setUser(session.user)
      const { data } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      setIsAdmin(!!data)
    })
  }, [router])

  // ── Chargements ─────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    const [m, p, l, c, r, w] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('webinars').select('*', { count: 'exact', head: true }),
    ])
    setStats({
      membres: m.count || 0, posts: p.count || 0, likes: l.count || 0,
      comments: c.count || 0, reports: r.count || 0, webinars: w.count || 0,
    })
  }, [])

  const loadReports = useCallback(async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50)
    const list = (data as Report[]) || []
    const postIds = list.filter(r => r.post_id).map(r => r.post_id as string)
    const commentIds = list.filter(r => r.comment_id).map(r => r.comment_id as string)
    const [{ data: posts }, { data: comments }] = await Promise.all([
      postIds.length ? supabase.from('posts').select('id,content,user_id,prenom').in('id', postIds) : Promise.resolve({ data: [] }),
      commentIds.length ? supabase.from('comments').select('id,content,user_id,prenom').in('id', commentIds) : Promise.resolve({ data: [] }),
    ])
    const pMap = new Map(((posts || []) as { id: string; content: string; user_id: string; prenom: string }[]).map(p => [p.id, p]))
    const cMap = new Map(((comments || []) as { id: string; content: string; user_id: string; prenom: string }[]).map(c => [c.id, c]))
    setReports(list.map(r => {
      const src = r.post_id ? pMap.get(r.post_id) : r.comment_id ? cMap.get(r.comment_id) : undefined
      return { ...r, content: src?.content, author_id: src?.user_id, author: src?.prenom }
    }))
  }, [])

  const loadMembers = useCallback(async () => {
    const [{ data: profs }, { data: admins }, { data: banned }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('admins').select('user_id'),
      supabase.from('banned_users').select('user_id'),
    ])
    setProfiles((profs as Profile[]) || [])
    setAdminIds(new Set(((admins || []) as { user_id: string }[]).map(a => a.user_id)))
    setBannedIds(new Set(((banned || []) as { user_id: string }[]).map(b => b.user_id)))
  }, [])

  const loadWebinars = useCallback(async () => {
    const { data } = await supabase.from('webinars').select('*').order('created_at', { ascending: false })
    setWebinars((data as Webinar[]) || [])
  }, [])

  const loadGloss = useCallback(async () => {
    const { data } = await supabase.from('glossary_terms').select('*').order('term')
    setGlossTerms((data as GlossTerm[]) || [])
  }, [])

  const loadAnnouncements = useCallback(async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnnouncements((data as Announcement[]) || [])
  }, [])

  const loadContents = useCallback(async () => {
    const { data } = await supabase.from('site_content').select('*').order('label')
    setContents((data as SiteContent[]) || [])
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    if (tab === 'dashboard') loadStats()
    if (tab === 'moderation') loadReports()
    if (tab === 'membres') loadMembers()
    if (tab === 'webinaires') loadWebinars()
    if (tab === 'glossaire') loadGloss()
    if (tab === 'annonces') loadAnnouncements()
    if (tab === 'contenus') loadContents()
  }, [isAdmin, tab, loadStats, loadReports, loadMembers, loadWebinars, loadGloss, loadAnnouncements, loadContents])

  // ── Actions modération ──────────────────────────────────────────────
  async function resolveReport(r: Report, action: 'delete' | 'dismiss') {
    if (action === 'delete') {
      if (r.post_id) await supabase.from('posts').delete().eq('id', r.post_id)
      if (r.comment_id) await supabase.from('comments').delete().eq('id', r.comment_id)
      await supabase.from('reports').update({ status: 'resolved' }).eq('id', r.id)
      showToast('🗑️ Contenu supprimé')
    } else {
      await supabase.from('reports').update({ status: 'dismissed' }).eq('id', r.id)
      showToast('Signalement rejeté')
    }
    loadReports()
  }

  async function banUser(userId: string, prenom?: string | null) {
    const reason = prompt(`Bannir ${prenom || 'ce membre'} ? Indique la raison :`)
    if (reason === null) return
    await supabase.from('banned_users').insert({ user_id: userId, reason, banned_by: user?.id })
    showToast('🚫 Membre banni')
    loadMembers()
    loadReports()
  }

  async function unbanUser(userId: string) {
    await supabase.from('banned_users').delete().eq('user_id', userId)
    showToast('✓ Membre débanni')
    loadMembers()
  }

  async function toggleAdmin(userId: string) {
    if (adminIds.has(userId)) {
      if (userId === user?.id) { alert('Tu ne peux pas retirer ton propre rôle admin.'); return }
      await supabase.from('admins').delete().eq('user_id', userId)
      showToast('Rôle admin retiré')
    } else {
      await supabase.from('admins').insert({ user_id: userId, role: 'admin' })
      showToast('✓ Nouveau admin')
    }
    loadMembers()
  }

  // ── Actions webinaires ──────────────────────────────────────────────
  async function saveWebinar() {
    if (!wbForm?.title?.trim()) { alert('Le titre est obligatoire.'); return }
    const payload = {
      title: wbForm.title.trim(),
      description: wbForm.description || '',
      category: wbForm.category || 'Général',
      host_name: wbForm.host_name || '',
      host_role: wbForm.host_role || '',
      date_label: wbForm.date_label || '',
      inscrits: wbForm.inscrits || 0,
      status: wbForm.status || 'upcoming',
      featured: wbForm.featured || false,
      accent: wbForm.accent || '#1D9E75',
    }
    if (wbForm.id) await supabase.from('webinars').update(payload).eq('id', wbForm.id)
    else await supabase.from('webinars').insert(payload)
    setWbForm(null)
    showToast('✓ Webinaire enregistré')
    loadWebinars()
  }

  async function deleteWebinar(id: string) {
    if (!confirm('Supprimer ce webinaire ?')) return
    await supabase.from('webinars').delete().eq('id', id)
    showToast('Webinaire supprimé')
    loadWebinars()
  }

  // ── Actions glossaire ───────────────────────────────────────────────
  async function saveGloss() {
    if (!glForm?.term?.trim() || !glForm?.definition?.trim()) { alert('Terme et définition obligatoires.'); return }
    const payload = {
      term: glForm.term.trim(),
      slug: glForm.slug?.trim() || slugify(glForm.term),
      definition: glForm.definition.trim(),
      category: glForm.category || 'Général',
    }
    if (glForm.id) await supabase.from('glossary_terms').update(payload).eq('id', glForm.id)
    else await supabase.from('glossary_terms').insert(payload)
    setGlForm(null)
    showToast('✓ Terme enregistré')
    loadGloss()
  }

  async function deleteGloss(id: string) {
    if (!confirm('Supprimer ce terme ?')) return
    await supabase.from('glossary_terms').delete().eq('id', id)
    loadGloss()
  }

  // ── Actions annonces ────────────────────────────────────────────────
  async function saveAnnouncement() {
    if (!anForm?.title?.trim()) { alert('Le titre est obligatoire.'); return }
    const payload = {
      title: anForm.title.trim(),
      content: anForm.content || '',
      pinned: anForm.pinned || false,
      active: anForm.active !== false,
    }
    if (anForm.id) await supabase.from('announcements').update(payload).eq('id', anForm.id)
    else await supabase.from('announcements').insert(payload)
    setAnForm(null)
    showToast('✓ Annonce enregistrée')
    loadAnnouncements()
  }

  async function toggleAnnouncement(a: Announcement, field: 'pinned' | 'active') {
    await supabase.from('announcements').update({ [field]: !a[field] }).eq('id', a.id)
    loadAnnouncements()
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Supprimer cette annonce ?')) return
    await supabase.from('announcements').delete().eq('id', id)
    loadAnnouncements()
  }

  // ── Actions contenus ────────────────────────────────────────────────
  async function saveContent(key: string, value: string) {
    await supabase.from('site_content').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
    showToast('✓ Texte mis à jour')
  }

  // ── Écrans d'accès ──────────────────────────────────────────────────
  if (isAdmin === null) return (
    <div className="min-h-screen bg-fond-gris font-sans flex items-center justify-center text-muted text-[14px]">
      Vérification des accès…
    </div>
  )

  if (!isAdmin) return (
    <div className="min-h-screen bg-fond-gris font-sans flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF5F5] flex items-center justify-center">
        <IconBan size={28} className="text-[#E24B4A]" />
      </div>
      <h1 className="text-[20px] font-semibold">Accès réservé</h1>
      <p className="text-[14px] text-muted max-w-[360px]">
        Cette zone est réservée à l&apos;équipe Finko. Si tu penses que c&apos;est une erreur, contacte un administrateur.
      </p>
      <Link href="/communaute" className="text-vert text-[14px] font-medium hover:underline">← Retour à la communauté</Link>
    </div>
  )

  const pendingReports = reports.filter(r => r.status === 'pending')

  // ── INTERFACE ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-fond-gris font-sans flex max-md:flex-col">

      {/* SIDEBAR */}
      <aside className="w-[230px] max-md:w-full bg-[#085041] text-white flex flex-col shrink-0 max-md:flex-row max-md:overflow-x-auto sticky top-0 h-screen max-md:h-auto max-md:static">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10 max-md:border-b-0 max-md:border-r shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#5DCAA5]" />
          <span className="text-[16px] font-medium">fin<em className="not-italic text-[#5DCAA5]">ko</em></span>
          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wide ml-1">Admin</span>
        </div>
        <nav className="flex-1 py-4 max-md:flex max-md:py-2">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full max-md:w-auto flex items-center gap-2.5 px-5 py-2.5 text-[13px] text-left border-none cursor-pointer font-sans transition-colors whitespace-nowrap ${
                  active ? 'bg-white/12 text-white font-medium' : 'text-white/60 bg-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {t.label}
                {t.id === 'moderation' && stats.reports > 0 && (
                  <span className="ml-auto max-md:ml-1 bg-[#E24B4A] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    {stats.reports}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 max-md:hidden">
          <Link href="/communaute" className="flex items-center gap-2 text-[12px] text-white/50 hover:text-white transition-colors">
            <IconLogout size={14} /> Retour au site
          </Link>
        </div>
      </aside>

      {/* CONTENU */}
      <main className="flex-1 p-8 max-md:p-4 overflow-y-auto">

        {/* ═══ DASHBOARD ═══ */}
        {tab === 'dashboard' && (
          <div>
            <h1 className="text-[22px] font-semibold mb-1">Tableau de bord</h1>
            <p className="text-[13px] text-muted mb-7">Vue d&apos;ensemble de la plateforme</p>
            <div className="grid grid-cols-3 max-md:grid-cols-2 gap-3 mb-8">
              {[
                { n: stats.membres, l: 'membres inscrits', icon: IconUsers, bg: '#E1F5EE', c: '#0F6E56' },
                { n: stats.posts, l: 'posts publiés', icon: IconMessages, bg: '#E6F1FB', c: '#185FA5' },
                { n: stats.likes, l: 'réactions', icon: IconHeart, bg: '#FEECEC', c: '#B91C1C' },
                { n: stats.comments, l: 'commentaires', icon: IconMessages, bg: '#FAEEDA', c: '#854F0B' },
                { n: stats.reports, l: 'signalements en attente', icon: IconAlertTriangle, bg: stats.reports > 0 ? '#FEECEC' : '#f0f0ee', c: stats.reports > 0 ? '#B91C1C' : '#888' },
                { n: stats.webinars, l: 'webinaires créés', icon: IconVideo, bg: '#EEEDFE', c: '#3C3489' },
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.l} className="bg-fond rounded-2xl border border-bordure p-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                      <Icon size={18} style={{ color: s.c }} />
                    </div>
                    <div className="text-[26px] font-semibold tracking-tight">{s.n}</div>
                    <div className="text-[12px] text-[#888]">{s.l}</div>
                  </div>
                )
              })}
            </div>
            <div className="bg-fond rounded-2xl border border-bordure p-6">
              <p className="text-[13px] font-medium mb-3">Actions rapides</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { setTab('webinaires'); setWbForm({}) }} className={btnPrimary}>
                  <IconPlus size={14} /> Nouveau webinaire
                </button>
                <button onClick={() => { setTab('annonces'); setAnForm({ active: true }) }} className={btnGhost}>
                  <IconSpeakerphone size={14} /> Publier une annonce
                </button>
                <button onClick={() => setTab('moderation')} className={btnGhost}>
                  <IconFlag size={14} /> Voir les signalements
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MODÉRATION ═══ */}
        {tab === 'moderation' && (
          <div>
            <h1 className="text-[22px] font-semibold mb-1">Modération</h1>
            <p className="text-[13px] text-muted mb-7">
              {pendingReports.length} signalement{pendingReports.length !== 1 ? 's' : ''} en attente
            </p>
            {reports.length === 0 ? (
              <div className="bg-fond rounded-2xl border border-bordure p-10 text-center text-muted text-[14px]">
                ✨ Aucun signalement — la communauté est saine !
              </div>
            ) : (
              reports.map(r => (
                <div key={r.id} className={`bg-fond rounded-2xl border p-5 mb-3 ${r.status === 'pending' ? 'border-[#F09595]' : 'border-bordure opacity-60'}`}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      r.status === 'pending' ? 'bg-[#FEECEC] text-[#B91C1C]'
                      : r.status === 'resolved' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-fond-gris text-[#888]'
                    }`}>
                      {r.status === 'pending' ? 'En attente' : r.status === 'resolved' ? 'Traité' : 'Rejeté'}
                    </span>
                    <span className="text-[11px] text-[#aaa]">{r.post_id ? 'Post' : 'Commentaire'} de <strong>{r.author || 'inconnu'}</strong></span>
                    <span className="text-[11px] text-[#ccc]">· {new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-[13px] text-texte bg-fond-gris rounded-lg px-4 py-3 mb-2">
                    {r.content || '(contenu déjà supprimé)'}
                  </p>
                  <p className="text-[12px] text-muted mb-3">Motif du signalement : <em>{r.reason}</em></p>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => resolveReport(r, 'delete')} className={btnDanger}>
                        <IconTrash size={13} /> Supprimer le contenu
                      </button>
                      {r.author_id && (
                        <button onClick={() => banUser(r.author_id!, r.author)} className={btnDanger}>
                          <IconBan size={13} /> Bannir l&apos;auteur
                        </button>
                      )}
                      <button onClick={() => resolveReport(r, 'dismiss')} className={btnGhost}>
                        <IconCheck size={13} /> Tout va bien, rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══ MEMBRES ═══ */}
        {tab === 'membres' && (
          <div>
            <h1 className="text-[22px] font-semibold mb-1">Membres</h1>
            <p className="text-[13px] text-muted mb-7">{profiles.length} membres inscrits</p>
            <div className="bg-fond rounded-2xl border border-bordure overflow-hidden">
              {profiles.map(p => {
                const isMe = p.id === user?.id
                const isAdm = adminIds.has(p.id)
                const isBanned = bannedIds.has(p.id)
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-bordure last:border-0 flex-wrap">
                    <div className="w-9 h-9 rounded-full bg-[#E1F5EE] text-[#0F6E56] flex items-center justify-center text-[13px] font-medium shrink-0">
                      {(p.prenom?.[0] || p.email?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <div className="text-[13px] font-medium flex items-center gap-1.5 flex-wrap">
                        {(p.prenom || '') + ' ' + (p.nom || '') || p.email}
                        {isMe && <span className="text-[10px] text-vert">(toi)</span>}
                        {isAdm && <span className="text-[10px] bg-[#E1F5EE] text-[#0F6E56] px-2 py-0.5 rounded-full flex items-center gap-0.5"><IconShieldCheck size={10} /> Admin</span>}
                        {isBanned && <span className="text-[10px] bg-[#FEECEC] text-[#B91C1C] px-2 py-0.5 rounded-full">Banni</span>}
                      </div>
                      <div className="text-[11px] text-[#aaa]">{p.email} · inscrit le {new Date(p.created_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleAdmin(p.id)} className={btnGhost} title={isAdm ? 'Retirer le rôle admin' : 'Nommer admin'}>
                        <IconShieldCheck size={13} /> {isAdm ? 'Retirer admin' : 'Nommer admin'}
                      </button>
                      {!isMe && (
                        isBanned
                          ? <button onClick={() => unbanUser(p.id)} className={btnGhost}><IconCheck size={13} /> Débannir</button>
                          : <button onClick={() => banUser(p.id, p.prenom)} className={btnDanger}><IconBan size={13} /> Bannir</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══ WEBINAIRES ═══ */}
        {tab === 'webinaires' && (
          <div>
            <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
              <div>
                <h1 className="text-[22px] font-semibold mb-1">Webinaires</h1>
                <p className="text-[13px] text-muted">Gère les webinaires affichés sur le site</p>
              </div>
              <button onClick={() => setWbForm({})} className={btnPrimary}><IconPlus size={14} /> Nouveau webinaire</button>
            </div>

            {wbForm && (
              <div className="bg-fond rounded-2xl border-2 border-vert p-6 mb-5">
                <p className="text-[14px] font-medium mb-4">{wbForm.id ? 'Modifier le webinaire' : 'Nouveau webinaire'}</p>
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3 mb-3">
                  <div className="col-span-2 max-md:col-span-1">
                    <label className="block text-[12px] font-medium mb-1">Titre *</label>
                    <input className={inputCls} value={wbForm.title || ''} onChange={e => setWbForm({ ...wbForm, title: e.target.value })} placeholder="Ex : ETF World vs ETF Europe" />
                  </div>
                  <div className="col-span-2 max-md:col-span-1">
                    <label className="block text-[12px] font-medium mb-1">Description</label>
                    <textarea className={inputCls} rows={2} value={wbForm.description || ''} onChange={e => setWbForm({ ...wbForm, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">Catégorie</label>
                    <select className={inputCls} value={wbForm.category || 'Général'} onChange={e => setWbForm({ ...wbForm, category: e.target.value })}>
                      {WB_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">Statut</label>
                    <select className={inputCls} value={wbForm.status || 'upcoming'} onChange={e => setWbForm({ ...wbForm, status: e.target.value })}>
                      {WB_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">Intervenant</label>
                    <input className={inputCls} value={wbForm.host_name || ''} onChange={e => setWbForm({ ...wbForm, host_name: e.target.value })} placeholder="Sophie L." />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">Rôle de l&apos;intervenant</label>
                    <input className={inputCls} value={wbForm.host_role || ''} onChange={e => setWbForm({ ...wbForm, host_role: e.target.value })} placeholder="Gestionnaire de portefeuille" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">Date affichée</label>
                    <input className={inputCls} value={wbForm.date_label || ''} onChange={e => setWbForm({ ...wbForm, date_label: e.target.value })} placeholder="24 juin · 18h30" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">Pré-inscrits affichés</label>
                    <input className={inputCls} type="number" value={wbForm.inscrits || 0} onChange={e => setWbForm({ ...wbForm, inscrits: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-[13px] mb-4 cursor-pointer">
                  <input type="checkbox" checked={wbForm.featured || false} onChange={e => setWbForm({ ...wbForm, featured: e.target.checked })} />
                  Mettre à la une (grand encart en haut de la page)
                </label>
                <div className="flex gap-2">
                  <button onClick={saveWebinar} className={btnPrimary}><IconCheck size={14} /> Enregistrer</button>
                  <button onClick={() => setWbForm(null)} className={btnGhost}>Annuler</button>
                </div>
              </div>
            )}

            {webinars.length === 0 && !wbForm ? (
              <div className="bg-fond rounded-2xl border border-bordure p-10 text-center text-muted text-[14px]">
                Aucun webinaire en base — la page affiche les exemples par défaut.
                <br />Crée ton premier webinaire pour prendre la main !
              </div>
            ) : (
              webinars.map(w => (
                <div key={w.id} className="bg-fond rounded-2xl border border-bordure p-5 mb-3 flex items-center gap-4 flex-wrap">
                  <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: w.accent }} />
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-[14px] font-medium flex items-center gap-2 flex-wrap">
                      {w.title}
                      {w.featured && <span className="text-[10px] bg-[#FAEEDA] text-[#854F0B] px-2 py-0.5 rounded-full">⭐ À la une</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        w.status === 'live' ? 'bg-[#FEECEC] text-[#B91C1C]'
                        : w.status === 'upcoming' ? 'bg-[#E1F5EE] text-[#0F6E56]'
                        : w.status === 'replay' ? 'bg-fond-gris text-[#888]' : 'bg-fond-gris text-[#aaa]'
                      }`}>
                        {WB_STATUS.find(s => s.value === w.status)?.label}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#888]">{w.category} · {w.host_name || 'Intervenant à définir'} · {w.date_label || 'date à définir'} · {w.inscrits} inscrits</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setWbForm(w)} className={btnGhost}><IconPencil size={13} /> Modifier</button>
                    <button onClick={() => deleteWebinar(w.id)} className={btnDanger}><IconTrash size={13} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ═══ GLOSSAIRE ═══ */}
        {tab === 'glossaire' && (
          <div>
            <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
              <div>
                <h1 className="text-[22px] font-semibold mb-1">Glossaire</h1>
                <p className="text-[13px] text-muted">{glossTerms.length} termes ajoutés (en plus des 47 termes de base)</p>
              </div>
              <button onClick={() => setGlForm({})} className={btnPrimary}><IconPlus size={14} /> Nouveau terme</button>
            </div>

            {glForm && (
              <div className="bg-fond rounded-2xl border-2 border-vert p-6 mb-5">
                <p className="text-[14px] font-medium mb-4">{glForm.id ? 'Modifier le terme' : 'Nouveau terme'}</p>
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3 mb-4">
                  <div>
                    <label className="block text-[12px] font-medium mb-1">Terme *</label>
                    <input className={inputCls} value={glForm.term || ''} onChange={e => setGlForm({ ...glForm, term: e.target.value, slug: slugify(e.target.value) })} placeholder="Ex : Stock-option" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1">Catégorie</label>
                    <input className={inputCls} value={glForm.category || ''} onChange={e => setGlForm({ ...glForm, category: e.target.value })} placeholder="Bourse, Épargne, Impôts…" />
                  </div>
                  <div className="col-span-2 max-md:col-span-1">
                    <label className="block text-[12px] font-medium mb-1">Définition *</label>
                    <textarea className={inputCls} rows={3} value={glForm.definition || ''} onChange={e => setGlForm({ ...glForm, definition: e.target.value })} placeholder="Explication claire et simple, sans jargon…" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveGloss} className={btnPrimary}><IconCheck size={14} /> Enregistrer</button>
                  <button onClick={() => setGlForm(null)} className={btnGhost}>Annuler</button>
                </div>
              </div>
            )}

            {glossTerms.map(g => (
              <div key={g.id} className="bg-fond rounded-2xl border border-bordure p-5 mb-3 flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[14px] font-medium">{g.term} <span className="text-[11px] text-[#aaa] font-normal">· {g.category}</span></div>
                  <p className="text-[13px] text-muted mt-1 leading-relaxed">{g.definition}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setGlForm(g)} className={btnGhost}><IconPencil size={13} /> Modifier</button>
                  <button onClick={() => deleteGloss(g.id)} className={btnDanger}><IconTrash size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ ANNONCES ═══ */}
        {tab === 'annonces' && (
          <div>
            <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
              <div>
                <h1 className="text-[22px] font-semibold mb-1">Annonces</h1>
                <p className="text-[13px] text-muted">L&apos;annonce épinglée s&apos;affiche en bannière dans la communauté</p>
              </div>
              <button onClick={() => setAnForm({ active: true })} className={btnPrimary}><IconPlus size={14} /> Nouvelle annonce</button>
            </div>

            {anForm && (
              <div className="bg-fond rounded-2xl border-2 border-vert p-6 mb-5">
                <p className="text-[14px] font-medium mb-4">{anForm.id ? "Modifier l'annonce" : 'Nouvelle annonce'}</p>
                <div className="mb-3">
                  <label className="block text-[12px] font-medium mb-1">Titre *</label>
                  <input className={inputCls} value={anForm.title || ''} onChange={e => setAnForm({ ...anForm, title: e.target.value })} placeholder="🔴 Webinaire ce soir à 18h30 !" />
                </div>
                <div className="mb-4">
                  <label className="block text-[12px] font-medium mb-1">Texte (optionnel)</label>
                  <input className={inputCls} value={anForm.content || ''} onChange={e => setAnForm({ ...anForm, content: e.target.value })} placeholder="Détail court affiché sous le titre" />
                </div>
                <label className="flex items-center gap-2 text-[13px] mb-4 cursor-pointer">
                  <input type="checkbox" checked={anForm.pinned || false} onChange={e => setAnForm({ ...anForm, pinned: e.target.checked })} />
                  Épingler dans la communauté (une seule annonce épinglée s&apos;affiche)
                </label>
                <div className="flex gap-2">
                  <button onClick={saveAnnouncement} className={btnPrimary}><IconCheck size={14} /> Publier</button>
                  <button onClick={() => setAnForm(null)} className={btnGhost}>Annuler</button>
                </div>
              </div>
            )}

            {announcements.map(a => (
              <div key={a.id} className={`bg-fond rounded-2xl border border-bordure p-5 mb-3 flex items-center gap-4 flex-wrap ${!a.active ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[14px] font-medium flex items-center gap-2">
                    {a.title}
                    {a.pinned && <span className="text-[10px] bg-[#E1F5EE] text-[#0F6E56] px-2 py-0.5 rounded-full">📌 Épinglée</span>}
                  </div>
                  {a.content && <p className="text-[12px] text-muted mt-0.5">{a.content}</p>}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => toggleAnnouncement(a, 'pinned')} className={btnGhost} title={a.pinned ? 'Désépingler' : 'Épingler'}>
                    {a.pinned ? <IconPinFilled size={13} /> : <IconPin size={13} />}
                  </button>
                  <button onClick={() => toggleAnnouncement(a, 'active')} className={btnGhost} title={a.active ? 'Désactiver' : 'Activer'}>
                    {a.active ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                  </button>
                  <button onClick={() => deleteAnnouncement(a.id)} className={btnDanger}><IconTrash size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ CONTENUS ═══ */}
        {tab === 'contenus' && (
          <div>
            <h1 className="text-[22px] font-semibold mb-1">Textes du site</h1>
            <p className="text-[13px] text-muted mb-7">Modifie les textes et chiffres affichés — sans toucher au code</p>
            {contents.map(c => (
              <ContentRow key={c.key} content={c} onSave={saveContent} />
            ))}
          </div>
        )}

      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-texte text-white px-5 py-3 rounded-[10px] text-[14px] z-[9999] font-sans shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}

// Ligne de contenu éditable avec bouton Enregistrer indépendant
function ContentRow({ content, onSave }: { content: SiteContent; onSave: (key: string, value: string) => void }) {
  const [value, setValue] = useState(content.value)
  const dirty = value !== content.value
  return (
    <div className="bg-fond rounded-2xl border border-bordure p-5 mb-3">
      <label className="block text-[12px] font-medium mb-1.5">{content.label}</label>
      <div className="flex gap-2 flex-wrap">
        <input
          className="flex-1 min-w-[220px] px-3 py-2 border border-[#ccc] rounded-lg text-[13px] bg-fond text-texte outline-none focus:border-vert font-sans"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button
          onClick={() => onSave(content.key, value)}
          disabled={!dirty}
          className="flex items-center gap-1.5 bg-vert text-white border-none px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-vert-hover transition-colors font-sans disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <IconCheck size={14} /> Enregistrer
        </button>
      </div>
    </div>
  )
}
