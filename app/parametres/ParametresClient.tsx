'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconUser, IconTag, IconBell, IconLock, IconAlertTriangle,
  IconCheck, IconSeedling,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

const INTERESTS = ['Actions','ETF','SCPI','PER','Crypto','Fiscalité','Immobilier','Débutant','IA & Finance']
const NOTIFS = [
  { label: "Nouveaux webinaires", sub: "Reçois une alerte quand un webinaire est programmé", defaultOn: true },
  { label: "Réponses à mes posts", sub: "Sois notifié quand quelqu'un répond à tes posts", defaultOn: true },
  { label: "Newsletter hebdomadaire", sub: "Reçois le meilleur de la semaine chaque lundi", defaultOn: true },
  { label: "Tendances de la communauté", sub: "Reçois un résumé des sujets les plus actifs", defaultOn: false },
]

export default function ParametresClient() {
  const router = useRouter()
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState<string[]>(['Actions','ETF'])
  const [notifs, setNotifs] = useState(NOTIFS.map(n => n.defaultOn))
  const [pwd1, setPwd1] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [interestsMsg, setInterestsMsg] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/connexion'); return }
      const u = session.user
      setPrenom(u.user_metadata?.prenom || '')
      setNom(u.user_metadata?.nom || '')
      setBio(u.user_metadata?.bio || '')
      if (u.user_metadata?.interests?.length) setInterests(u.user_metadata.interests)
      setLoading(false)
    })
  }, [router])

  function toggleInterest(tag: string) {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function saveProfile() {
    const { error } = await supabase.auth.updateUser({ data: { prenom, nom, bio } })
    if (!error) {
      setProfileMsg("✓ Profil mis à jour !")
      setTimeout(() => setProfileMsg(''), 3000)
    }
  }

  async function saveInterests() {
    const { error } = await supabase.auth.updateUser({ data: { interests } })
    if (!error) {
      setInterestsMsg("✓ Centres d'intérêt mis à jour !")
      setTimeout(() => setInterestsMsg(''), 3000)
    }
  }

  async function changePassword() {
    setPwdErr('')
    if (pwd1 !== pwd2) { setPwdErr('Les mots de passe ne correspondent pas.'); return }
    if (pwd1.length < 8) { setPwdErr('Minimum 8 caractères.'); return }
    const { error } = await supabase.auth.updateUser({ password: pwd1 })
    if (error) { setPwdErr('Erreur : ' + error.message); return }
    setPwdMsg("✓ Mot de passe mis à jour !")
    setPwd1(''); setPwd2('')
    setTimeout(() => setPwdMsg(''), 3000)
  }

  async function deleteAccount() {
    if (!confirm("Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible.")) return
    await supabase.auth.signOut()
    router.push('/')
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const inputCls = "w-full px-3.5 py-2.5 border border-[#ccc] rounded-lg text-[14px] bg-fond text-texte outline-none focus:border-vert focus:ring-2 focus:ring-vert/10 font-sans"

  if (loading) return <div className="min-h-screen bg-fond-gris font-sans flex items-center justify-center text-muted text-[14px]">Chargement…</div>

  return (
    <div className="min-h-screen bg-fond-gris font-sans">
      {/* NAV */}
      <nav className="flex justify-between items-center px-10 py-4 border-b border-bordure bg-fond sticky top-0 z-10">
        <a href="/" className="flex items-center gap-2 text-[19px] font-medium text-texte no-underline">
          <span className="w-2 h-2 rounded-full bg-vert" />
          Fin<em className="not-italic text-vert">ko</em>
        </a>
        <div className="flex gap-2.5 items-center">
          <a href="/profil" className="text-[13px] text-muted hover:text-texte transition-colors">Mon profil</a>
          <button
            onClick={signOut}
            className="bg-transparent text-muted border border-[#ccc] px-3.5 py-1.5 rounded-lg text-[13px] cursor-pointer font-sans hover:bg-fond-gris transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </nav>

      <div className="max-w-[680px] mx-auto py-10 px-6 pb-16">
        <h1 className="text-[24px] font-semibold mb-1.5">Paramètres</h1>
        <p className="text-[14px] text-[#888] mb-8">Gère ton compte et tes préférences Finko</p>

        {/* INFORMATIONS */}
        <div className="bg-fond border border-bordure rounded-2xl overflow-hidden mb-5">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-bordure">
            <IconUser size={18} className="text-vert" />
            <span className="text-[14px] font-medium">Informations personnelles</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Prénom</label>
                <input className={inputCls} type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Nom</label>
                <input className={inputCls} type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[13px] font-medium mb-1.5">Bio</label>
              <input className={inputCls} type="text" value={bio} onChange={e => setBio(e.target.value)} placeholder="Passionné de finance, j'apprends chaque jour..." />
            </div>
            <button
              onClick={saveProfile}
              className="flex items-center gap-1.5 bg-vert text-white border-none px-5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-vert-hover transition-colors font-sans"
            >
              <IconCheck size={14} /> Enregistrer
            </button>
            {profileMsg && (
              <div className="mt-3 bg-[#E1F5EE] text-vert-dark rounded-lg px-4 py-3 text-[13px]">{profileMsg}</div>
            )}
          </div>
        </div>

        {/* INTÉRÊTS */}
        <div className="bg-fond border border-bordure rounded-2xl overflow-hidden mb-5">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-bordure">
            <IconTag size={18} className="text-vert" />
            <span className="text-[14px] font-medium">Mes centres d'intérêt</span>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-5">
              {INTERESTS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`text-[13px] px-3.5 py-1.5 rounded-full border cursor-pointer transition-all font-sans ${
                    interests.includes(tag)
                      ? 'bg-vert text-white border-vert'
                      : 'text-muted border-[#ccc] bg-fond hover:bg-fond-gris'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              onClick={saveInterests}
              className="flex items-center gap-1.5 bg-vert text-white border-none px-5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-vert-hover transition-colors font-sans"
            >
              <IconCheck size={14} /> Enregistrer
            </button>
            {interestsMsg && (
              <div className="mt-3 bg-[#E1F5EE] text-vert-dark rounded-lg px-4 py-3 text-[13px]">{interestsMsg}</div>
            )}
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-fond border border-bordure rounded-2xl overflow-hidden mb-5">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-bordure">
            <IconBell size={18} className="text-vert" />
            <span className="text-[14px] font-medium">Notifications</span>
          </div>
          <div className="px-6 divide-y divide-bordure">
            {NOTIFS.map((n, i) => (
              <div key={n.label} className="flex justify-between items-center py-3.5">
                <div className="flex-1">
                  <div className="text-[14px] font-medium mb-0.5">{n.label}</div>
                  <div className="text-[12px] text-[#888]">{n.sub}</div>
                </div>
                <button
                  onClick={() => setNotifs(prev => prev.map((v, j) => j === i ? !v : v))}
                  className={`w-[42px] h-6 rounded-full relative cursor-pointer border-none transition-colors shrink-0 ${notifs[i] ? 'bg-vert' : 'bg-[#e5e5e5]'}`}
                >
                  <span className={`absolute w-[18px] h-[18px] bg-white rounded-full top-[3px] transition-all ${notifs[i] ? 'left-[21px]' : 'left-[3px]'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SÉCURITÉ */}
        <div className="bg-fond border border-bordure rounded-2xl overflow-hidden mb-5">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-bordure">
            <IconLock size={18} className="text-vert" />
            <span className="text-[14px] font-medium">Sécurité</span>
          </div>
          <div className="p-6">
            <div className="mb-5">
              <label className="block text-[13px] font-medium mb-1.5">Nouveau mot de passe</label>
              <input className={inputCls} type="password" value={pwd1} onChange={e => setPwd1(e.target.value)} placeholder="8 caractères minimum" />
            </div>
            <div className="mb-5">
              <label className="block text-[13px] font-medium mb-1.5">Confirmer le mot de passe</label>
              <input className={inputCls} type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} placeholder="Répète le mot de passe" />
            </div>
            {pwdErr && <p className="text-[13px] text-[#E24B4A] mb-3">{pwdErr}</p>}
            <button
              onClick={changePassword}
              className="flex items-center gap-1.5 bg-vert text-white border-none px-5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-vert-hover transition-colors font-sans"
            >
              <IconLock size={14} /> Changer le mot de passe
            </button>
            {pwdMsg && (
              <div className="mt-3 bg-[#E1F5EE] text-vert-dark rounded-lg px-4 py-3 text-[13px]">{pwdMsg}</div>
            )}
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-fond border border-[#F09595] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[#F09595] bg-[#FFF5F5]">
            <IconAlertTriangle size={18} className="text-[#E24B4A]" />
            <span className="text-[14px] font-medium">Zone dangereuse</span>
          </div>
          <div className="p-6">
            <p className="text-[13px] text-muted mb-4">La suppression de ton compte est irréversible. Toutes tes données seront effacées.</p>
            <button
              onClick={deleteAccount}
              className="flex items-center gap-1.5 bg-transparent text-[#E24B4A] border border-[#E24B4A] px-5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#FFF5F5] transition-colors font-sans"
            >
              <IconSeedling size={14} /> Supprimer mon compte
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
