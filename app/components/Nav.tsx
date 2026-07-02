'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import {
  IconUsers,
  IconVideo,
  IconCalculator,
  IconBuilding,
  IconMenu2,
  IconX,
  IconBell,
  IconSettings,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/communaute',   label: 'Communauté',    icon: IconUsers },
  { href: '/webinaires',   label: 'Webinaires',    icon: IconVideo },
  { href: '/calculatrices',label: 'Calculatrices', icon: IconCalculator },
  { href: '/entreprises',  label: 'Entreprises',   icon: IconBuilding },
]

interface Notif {
  id: string
  type: string
  content: string
  read: boolean
  created_at: string
}

function notifTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}

const NOTIF_ICONS: Record<string, { emoji: string; bg: string }> = {
  like:    { emoji: '❤️', bg: '#FEECEC' },
  comment: { emoji: '💬', bg: '#E6F1FB' },
  follow:  { emoji: '👤', bg: '#E1F5EE' },
  mention: { emoji: '📣', bg: '#EEEDFE' },
  post:    { emoji: '📝', bg: '#FAEEDA' },
}

function NotifBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, content, read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifs((data as Notif[]) || [])
  }, [userId])

  useEffect(() => {
    load()
    // Nom unique : le composant est monté deux fois (bureau + mobile)
    const ch = supabase.channel(`nav-notifs-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [userId, load])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  async function markAsRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  async function markAllAsRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  }

  const unread = notifs.filter(n => !n.read).length

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-9 h-9 bg-transparent border-none cursor-pointer text-muted hover:text-vert transition-colors"
      >
        <IconBell size={20} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#E24B4A] text-white rounded-full text-[10px] font-semibold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+10px)] right-0 w-[340px] max-md:w-[300px] max-md:-right-20 bg-fond border border-bordure rounded-[14px] shadow-xl z-[999] overflow-hidden animate-fade-in">
          <div className="flex justify-between items-center px-5 py-4 border-b border-bordure">
            <span className="text-[14px] font-semibold">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[12px] text-vert bg-transparent border-none cursor-pointer font-sans hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="max-h-[380px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-10 px-4 text-[#aaa]">
                <div className="text-[32px] mb-2">🔔</div>
                <div className="text-[13px]">Pas encore de notifications</div>
              </div>
            ) : (
              notifs.map(n => {
                const ic = NOTIF_ICONS[n.type] || NOTIF_ICONS.post
                return (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full text-left flex gap-2.5 px-5 py-3.5 border-b border-[#f0f0f0] cursor-pointer transition-colors bg-transparent border-x-0 border-t-0 font-sans relative hover:bg-[#f8f8f6] ${
                      n.read ? '' : 'bg-[#F0FAF6] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-vert'
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] shrink-0"
                      style={{ background: ic.bg }}
                    >
                      {ic.emoji}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13px] text-texte leading-[1.4] mb-[3px]">{n.content}</span>
                      <span className="block text-[11px] text-[#aaa]">{notifTime(n.created_at)}</span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

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

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const prenom = user ? (user.user_metadata?.prenom || user.email?.split('@')[0] || 'Membre') : ''
  const initiale = prenom.charAt(0).toUpperCase()
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <nav className="border-b border-bordure bg-fond sticky top-0 z-50 animate-fade-in">
      <div className="flex justify-between items-center px-10 max-md:px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-[19px] font-medium text-texte">
          <div className="w-2 h-2 rounded-full bg-vert" />
          <span>fin<em className="not-italic text-vert">ko</em></span>
        </Link>

        <div className="flex gap-7 max-md:hidden">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 text-[13px] transition-colors ${
                  active ? 'text-vert font-medium' : 'text-muted hover:text-texte'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Zone droite : connecté ou non */}
        <div className="flex items-center gap-2.5 max-md:hidden">
          {!authReady ? (
            <div className="w-24 h-8" />
          ) : user ? (
            <>
              <Link href="/profil" className="flex items-center gap-2 text-[13px] text-texte hover:opacity-80 transition-opacity">
                <span className="w-8 h-8 rounded-full bg-vert text-white flex items-center justify-center text-[13px] font-medium overflow-hidden relative">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    : initiale}
                </span>
                {prenom}
              </Link>
              <Link href="/parametres" aria-label="Paramètres" className="flex items-center justify-center w-9 h-9 text-muted hover:text-vert transition-colors">
                <IconSettings size={19} />
              </Link>
              <NotifBell userId={user.id} />
              <button
                onClick={signOut}
                className="bg-transparent text-muted border border-[#ccc] px-3.5 py-[7px] rounded-md text-[13px] cursor-pointer font-sans hover:bg-fond-gris transition-colors"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-[13px] text-muted hover:text-texte transition-colors">
                Connexion
              </Link>
              <Link
                href="/entreprises"
                className="flex items-center gap-1.5 bg-vert-dark text-white text-[13px] font-medium px-[18px] py-2 rounded-md transition-opacity hover:opacity-90"
              >
                <IconBuilding size={15} />
                Espace entreprise
              </Link>
            </>
          )}
        </div>

        {/* Burger + cloche mobile */}
        <div className="hidden max-md:flex items-center gap-1">
          {user && <NotifBell userId={user.id} />}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            className="flex items-center justify-center w-9 h-9 bg-transparent border-none cursor-pointer text-texte"
          >
            {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="hidden max-md:block border-t border-bordure bg-fond px-5 py-3 animate-fade-in">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 py-3 text-[14px] border-b border-[#f0f0ee] ${
                  active ? 'text-vert font-medium' : 'text-texte'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
          {user ? (
            <>
              <Link href="/profil" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-3 text-[14px] text-texte border-b border-[#f0f0ee]">
                <span className="w-7 h-7 rounded-full bg-vert text-white flex items-center justify-center text-[12px] font-medium overflow-hidden relative">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    : initiale}
                </span>
                Mon profil
              </Link>
              <Link href="/parametres" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-3 text-[14px] text-texte border-b border-[#f0f0ee]">
                <IconSettings size={17} />
                Paramètres
              </Link>
              <div className="pt-4 pb-2">
                <button
                  onClick={() => { setOpen(false); signOut() }}
                  className="w-full text-center text-[13px] text-muted border border-[#ccc] px-4 py-2.5 rounded-md bg-transparent cursor-pointer font-sans"
                >
                  Se déconnecter
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2.5 pt-4 pb-2">
              <Link
                href="/connexion"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-[13px] text-texte border border-bordure px-4 py-2.5 rounded-md"
              >
                Connexion
              </Link>
              <Link
                href="/entreprises"
                onClick={() => setOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-vert-dark text-white text-[13px] font-medium px-4 py-2.5 rounded-md"
              >
                <IconBuilding size={15} />
                Espace entreprise
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
