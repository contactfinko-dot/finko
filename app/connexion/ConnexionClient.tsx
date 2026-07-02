'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconArrowLeft, IconLogin, IconUserPlus, IconEye, IconEyeOff,
  IconBrandGoogle, IconBrandApple, IconMessages, IconVideo,
  IconNews, IconShieldCheck, IconBan,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

const APP_URL    = process.env.NEXT_PUBLIC_APP_URL    ?? ''
const MAKE_WH    = process.env.NEXT_PUBLIC_MAKE_WEBHOOK ?? ''

/* ── Left panel features ── */
const features = [
  { icon: IconMessages, text: "Discute avec des gens qui s'intéressent à la finance" },
  { icon: IconVideo,    text: 'Accède aux webinaires gratuits avec des professionnels' },
  { icon: IconNews,     text: "Suis l'actu des marchés expliquée simplement" },
]

export default function ConnexionClient() {
  const [tab, setTab]               = useState<'login' | 'register'>('login')
  const [showPwd, setShowPwd]       = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  /* --- login state --- */
  const [loginEmail, setLoginEmail]   = useState('')
  const [loginPwd,   setLoginPwd]     = useState('')
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')

  /* --- register state --- */
  const [rPrenom, setRPrenom]         = useState('')
  const [rNom,    setRNom]            = useState('')
  const [rEmail,  setREmail]          = useState('')
  const [rPwd,    setRPwd]            = useState('')
  const [rStatus, setRStatus]         = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [rMsg,    setRMsg]            = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!loginEmail || !loginPwd) return
    setLoginStatus('loading')
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPwd })
    if (error) { setLoginStatus('err'); return }
    setLoginStatus('ok')
    setTimeout(() => { window.location.href = '/communaute' }, 800)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!rEmail || !rPwd) return
    if (rPwd.length < 8) { setRMsg('Mot de passe trop court (8 caractères minimum).'); setRStatus('err'); return }
    setRStatus('loading')
    const { error } = await supabase.auth.signUp({
      email: rEmail, password: rPwd,
      options: { data: { prenom: rPrenom, nom: rNom } },
    })
    if (error) { setRMsg(error.message); setRStatus('err'); return }
    fetch(MAKE_WH, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: rEmail, source: 'inscription_compte' }) })
    setRStatus('ok')
    setTimeout(() => { setTab('login'); setLoginEmail(rEmail) }, 2000)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${APP_URL}/communaute` } })
  }

  async function handleForgot() {
    if (!forgotEmail) return
    setForgotStatus('sending')
    try {
      await Promise.race([
        supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: `${APP_URL}/connexion` }),
        new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 8000)),
      ])
    } catch { /* timeout treated as success */ }
    setForgotStatus('sent')
    setTimeout(() => { setForgotOpen(false); setForgotStatus('idle') }, 2000)
  }

  return (
    <div className="min-h-screen bg-fond-gris font-sans">

      {/* NAV */}
      <nav className="flex justify-between items-center px-10 py-4 border-b border-bordure bg-fond">
        <Link href="/" className="flex items-center gap-2 text-[19px] font-medium text-texte">
          <div className="w-2 h-2 rounded-full bg-vert" />
          <span>fin<em className="not-italic text-vert">ko</em></span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-[13px] text-muted hover:text-texte transition-colors">
          <IconArrowLeft size={15} /> Retour à l'accueil
        </Link>
      </nav>

      {/* PAGE */}
      <div className="grid md:grid-cols-2 min-h-[calc(100vh-57px)]">

        {/* LEFT — dark green */}
        <div className="hidden md:flex bg-vert-dark p-14 flex-col justify-center relative overflow-hidden">
          <div className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.04] -top-24 -right-24" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-white/[0.04] -bottom-36 -left-24" />
          <div className="relative z-10">
            <p className="text-[11px] font-medium tracking-[2px] uppercase text-vert-lite mb-6">Bienvenue sur Finko</p>
            <h2 className="text-[34px] font-medium leading-[1.15] tracking-[-1px] text-white mb-5">
              Un espace pour<br />apprendre et <em className="not-italic text-vert-lite">échanger</em>
            </h2>
            <p className="text-[15px] text-white/65 leading-relaxed max-w-[360px] mb-10">
              Finko c'est une communauté de curieux. On discute finance, on partage ce qu'on apprend, et on progresse ensemble.
            </p>
            <div className="flex flex-col gap-4 mb-8">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-vert-lite" />
                  </div>
                  <span className="text-[14px] text-white/80">{text}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.08] border-l-[3px] border-vert-lite px-5 py-4">
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-vert-lite uppercase tracking-wide mb-1">
                <IconShieldCheck size={14} /> Important
              </p>
              <p className="text-[13px] text-white/70 leading-snug">
                Finko est une plateforme d'apprentissage et de discussion. Toute transaction financière entre membres est strictement interdite.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex flex-col justify-center bg-fond px-14 py-14">
          <div className="max-w-[400px] mx-auto w-full">

            {/* TABS */}
            <div className="flex border-b border-bordure mb-8">
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-3 text-[14px] font-medium border-b-2 -mb-px transition-colors ${
                    tab === t ? 'text-vert border-vert' : 'text-[#aaa] border-transparent'
                  }`}
                >
                  {t === 'login' ? 'Se connecter' : 'Créer un compte'}
                </button>
              ))}
            </div>

            {/* LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin}>
                <h2 className="text-[22px] font-medium tracking-[-0.5px] mb-1">Content de te revoir</h2>
                <p className="text-[14px] text-[#555] mb-8 leading-relaxed">Reconnecte-toi pour continuer la discussion.</p>
                <div className="mb-5">
                  <label className="block text-[13px] font-medium mb-1.5">Email</label>
                  <input className="input" type="email" placeholder="ton@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
                <div className="mb-2">
                  <label className="block text-[13px] font-medium mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input className="input pr-10" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={loginPwd} onChange={e => setLoginPwd(e.target.value)} />
                    <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa]">
                      {showPwd ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="text-right mb-5">
                  <button type="button" onClick={() => setForgotOpen(true)} className="text-[12px] text-vert">Mot de passe oublié ?</button>
                </div>
                {loginStatus === 'err' && <p className="text-[13px] text-red-600 mb-4">Email ou mot de passe incorrect.</p>}
                <button type="submit" disabled={loginStatus === 'loading' || loginStatus === 'ok'} className="btn-submit mb-6">
                  <IconLogin size={16} />
                  {loginStatus === 'loading' ? 'Connexion...' : loginStatus === 'ok' ? '✓ Connecté !' : 'Se connecter'}
                </button>
                <Divider />
                <SocialButtons onGoogle={handleGoogle} />
                <p className="text-[13px] text-[#555] text-center mt-4">
                  Pas encore de compte ?{' '}
                  <button type="button" onClick={() => setTab('register')} className="text-vert font-medium">Créer un compte</button>
                </p>
              </form>
            )}

            {/* REGISTER */}
            {tab === 'register' && (
              <form onSubmit={handleRegister}>
                <h2 className="text-[22px] font-medium tracking-[-0.5px] mb-1">Rejoins la communauté</h2>
                <p className="text-[14px] text-[#555] mb-5 leading-relaxed">Gratuit. Pour apprendre et discuter.</p>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3.5 flex gap-2.5 mb-5">
                  <IconBan size={18} className="text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-red-800 mb-0.5">Toute transaction financière est interdite</p>
                    <p className="text-[12px] text-red-700 leading-snug">Finko est uniquement un espace d'apprentissage. Aucun virement entre membres n'est autorisé.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Prénom</label>
                    <input className="input" type="text" placeholder="Jean" value={rPrenom} onChange={e => setRPrenom(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5">Nom</label>
                    <input className="input" type="text" placeholder="Dupont" value={rNom} onChange={e => setRNom(e.target.value)} />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-medium mb-1.5">Email</label>
                  <input className="input" type="email" placeholder="ton@email.com" value={rEmail} onChange={e => setREmail(e.target.value)} />
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-medium mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input className="input pr-10" type={showPwd ? 'text' : 'password'} placeholder="8 caractères minimum" value={rPwd} onChange={e => setRPwd(e.target.value)} />
                    <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa]">
                      {showPwd ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                </div>
                {rStatus === 'err' && <p className="text-[13px] text-red-600 mb-4">{rMsg}</p>}
                {rStatus === 'ok'  && <p className="text-[13px] text-vert mb-4">🎉 Bienvenue ! Tu peux maintenant te connecter.</p>}
                <button type="submit" disabled={rStatus === 'loading' || rStatus === 'ok'} className="btn-submit mb-6">
                  <IconUserPlus size={16} />
                  {rStatus === 'loading' ? 'Création en cours...' : rStatus === 'ok' ? '✓ Compte créé !' : 'Créer mon compte'}
                </button>
                <Divider />
                <SocialButtons onGoogle={handleGoogle} />
                <p className="text-[12px] text-[#aaa] text-center mt-6 leading-relaxed">
                  En créant un compte tu acceptes nos <a href="#" className="text-vert">CGU</a> et notre <a href="#" className="text-vert">politique de confidentialité</a>.
                </p>
                <p className="text-[13px] text-[#555] text-center mt-3">
                  Déjà un compte ?{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-vert font-medium">Se connecter</button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* MODAL forgot password */}
      {forgotOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-fond rounded-2xl p-8 w-[90%] max-w-sm">
            <h3 className="text-[18px] font-medium mb-1">Mot de passe oublié ?</h3>
            <p className="text-[13px] text-muted mb-6 leading-relaxed">Entre ton email et on t'envoie un lien pour réinitialiser ton mot de passe.</p>
            <input
              className="input mb-4"
              type="email"
              placeholder="ton@email.com"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setForgotOpen(false)} className="flex-1 border border-bordure rounded-lg py-2.5 text-[13px]">Annuler</button>
              <button onClick={handleForgot} disabled={forgotStatus !== 'idle'} className="flex-1 bg-vert text-white rounded-lg py-2.5 text-[13px] font-medium">
                {forgotStatus === 'sending' ? 'Envoi...' : forgotStatus === 'sent' ? '✓ Envoyé !' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-px bg-bordure" />
      <span className="text-[12px] text-[#aaa]">ou continuer avec</span>
      <div className="flex-1 h-px bg-bordure" />
    </div>
  )
}

function SocialButtons({ onGoogle }: { onGoogle: () => void }) {
  return (
    <>
      <button type="button" onClick={onGoogle} className="btn-social mb-2.5">
        <IconBrandGoogle size={18} /> Continuer avec Google
      </button>
      <button type="button" className="btn-social">
        <IconBrandApple size={18} /> Continuer avec Apple
      </button>
    </>
  )
}
