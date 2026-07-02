'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconBuildingBank, IconArrowDown, IconCheck, IconX,
  IconIdBadge2, IconVideo, IconFileText, IconTargetArrow,
  IconChartBar, IconHeadset, IconListNumbers, IconSparkles,
  IconReceipt, IconQuote, IconHelpCircle, IconRocket,
  IconMail, IconShieldLock, IconEyeOff, IconClock,
  IconPlus, IconStar, IconStarFilled, IconStarHalfFilled,
} from '@tabler/icons-react'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'
import { captureEmail } from '@/lib/capture'

/* ── Free email domains ── */
const FREE_DOMAINS = new Set([
  'gmail.com','googlemail.com','outlook.com','outlook.fr','hotmail.com','hotmail.fr',
  'live.com','live.fr','live.be','live.ca','yahoo.com','yahoo.fr','yahoo.be','yahoo.co.uk',
  'icloud.com','me.com','mac.com','aol.com','free.fr','orange.fr','sfr.fr','laposte.net',
  'wanadoo.fr','bbox.fr','numericable.fr','neuf.fr','alice.fr','club-internet.fr',
  'protonmail.com','proton.me','tutanota.com','tutamail.com','pm.me',
  'yandex.com','yandex.ru','mail.ru','gmx.com','gmx.fr','gmx.net',
  'zoho.com','fastmail.com','hey.com','rocketmail.com','aim.com',
])

const offres = [
  { icon: IconIdBadge2,    title: "Profil Entreprise",           desc: "Une page dédiée à votre marque : logo, description, secteur, contenu publié — tout ce qu'un membre veut savoir sur vous.",    features: ["Page personnalisée avec votre identité visuelle", 'Badge "Partenaire Finko" vérifié', 'Bouton "Suivre" pour les membres', "Score de crédibilité affiché"] },
  { icon: IconVideo,       title: "Webinaires Sponsorisés",      desc: "Organisez des sessions éducatives directement sur Finko. Vos experts devant une audience qui veut apprendre.",             features: ["Hébergement complet sur la plateforme", "Inscription et rappels automatiques", "Replay disponible après la session", "Stats détaillées d'audience"] },
  { icon: IconFileText,    title: "Contenu Éducatif",            desc: "Publiez des articles, guides et analyses directement dans la communauté. Votre marque = la référence.",                      features: ["Publication d'articles longs formats", "Mise en avant dans le fil communauté", "Tags thématiques pour la visibilité", "Commentaires et interactions membres"] },
  { icon: IconTargetArrow, title: "Publicité Ciblée",            desc: "Touchez exactement les bons profils : par âge, revenus, centres d'intérêt financiers ou comportement sur la plateforme.",   features: ["Ciblage comportemental avancé", "Formats natifs non-intrusifs", "Reporting en temps réel", "A/B testing intégré"] },
  { icon: IconChartBar,    title: "Tableau de Bord Analytics",   desc: "Suivez l'impact de chaque action : impressions, clics, abonnés gagnés, conversions — tout en un endroit.",                  features: ["Dashboard temps réel", "Comparaison période sur période", "Export CSV/PDF des rapports", "Alertes sur les pics d'engagement"] },
  { icon: IconHeadset,     title: "Accompagnement Dédié",        desc: "Un chargé de compte Finko vous aide à construire votre stratégie de présence et optimiser vos résultats.",                  features: ["Onboarding guidé en 48h", "Revue mensuelle de performance", "Recommandations éditoriales", "Support prioritaire (Pro & Entreprise)"] },
]

const steps = [
  { n: 1, title: 'Créez votre compte', desc: 'Inscrivez votre entreprise en 5 minutes. Ajoutez logo, description et vos informations de contact.' },
  { n: 2, title: 'Configurez votre présence', desc: 'Choisissez votre plan, paramétrez votre profil public et définissez vos objectifs de visibilité.' },
  { n: 3, title: 'Publiez du contenu', desc: "Partagez articles, webinaires et ressources. Notre équipe vous aide à calibrer le ton et les sujets." },
  { n: 4, title: 'Mesurez & optimisez', desc: 'Suivez vos performances dans le dashboard et ajustez votre stratégie en temps réel.' },
]

const temos = [
  { stars: 5,   text: "« Finko nous a permis d'atteindre une audience vraiment qualifiée. Nos webinaires affichent un taux de complétion de 74 %, bien au-dessus de nos autres canaux. »",                                                          init: "SL", name: "Sophie L.",  role: "Directrice Marketing · Nalo",  color: "bg-[#E1F5EE] text-[#085041]" },
  { stars: 5,   text: "« En 3 mois sur Finko, notre page a gagné plus de 1 200 abonnés qualifiés. Le ciblage est bluffant comparé aux réseaux sociaux généralistes. »",                                                                            init: "MR", name: "Marc R.",    role: "CMO · Cashbee",                color: "bg-[#E6F1FB] text-[#185FA5]" },
  { stars: 4.5, text: "« L'équipe Finko est très réactive. Ils nous ont aidé à calibrer notre contenu pour résonner avec une communauté d'investisseurs particuliers. Très bonne expérience. »",                                                   init: "AC", name: "Amélie C.",  role: "Brand Manager · Linxea",       color: "bg-[#F3E6FB] text-[#6B21A8]" },
]

const faqs = [
  { q: 'Notre entreprise doit-elle être dans le secteur financier ?', a: "Pas nécessairement. Finko accueille toute entreprise dont les produits ou services concernent la gestion financière personnelle : banques, assurances, proptech, fintech, CGPI, comptables, coaches financiers, etc. Nous validons chaque demande pour garantir la qualité de l'écosystème." },
  { q: 'Peut-on faire de la publicité directe pour un produit financier ?', a: "Les promotions directes sont possibles dans les espaces publicitaires dédiés, mais dans la communauté le contenu doit rester éducatif et utile. Notre équipe vous aide à trouver le bon équilibre entre visibilité de marque et valeur ajoutée pour les membres." },
  { q: 'Combien de temps pour voir les premiers résultats ?', a: "En général, nos partenaires constatent les premières interactions significatives dès la première semaine après la publication de leur premier contenu. Les résultats s'amplifient sur 30 à 60 jours à mesure que votre profil gagne en abonnés et en crédibilité." },
  { q: 'Peut-on annuler à tout moment ?', a: 'Oui, sans engagement. Vous pouvez annuler votre plan Pro à tout moment depuis votre tableau de bord. Votre profil et votre contenu restent accessibles en lecture dans le plan Starter.' },
  { q: 'Les données de nos audiences nous appartiennent-elles ?', a: "Les données analytics de votre page (impressions, clics, abonnés) vous appartiennent et sont exportables. Les données personnelles des membres restent propriété de Finko conformément au RGPD — nous ne revendons pas de données individuelles." },
]

export default function EntreprisesClient() {
  const [unlocked, setUnlocked]       = useState(false)
  const [gateEmail, setGateEmail]     = useState('')
  const [gateStatus, setGateStatus]   = useState<'idle' | 'valid' | 'error'>('idle')
  const [gateMsg, setGateMsg]         = useState('')
  const [annual, setAnnual]           = useState(true)
  const [openFaq, setOpenFaq]         = useState<number | null>(0)

  function handleGateInput(val: string) {
    setGateEmail(val)
    if (!val) { setGateStatus('idle'); return }
    clearTimeout((window as any)._gateTimer)
    ;(window as any)._gateTimer = setTimeout(() => {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if (!emailRe.test(val)) { setGateStatus('error'); setGateMsg('Veuillez saisir une adresse email valide.'); return }
      const domain = val.split('@')[1].toLowerCase()
      if (FREE_DOMAINS.has(domain)) { setGateStatus('error'); setGateMsg('Les messageries personnelles ne sont pas acceptées. Veuillez utiliser votre adresse email professionnelle.'); return }
      setGateStatus('valid')
      captureEmail(val, 'entreprise')
      setTimeout(() => setUnlocked(true), 600)
    }, 420)
  }

  return (
    <div className="min-h-screen bg-fond font-sans">
      <Nav />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-20 px-10">
        <img src="/pexels-pavel-danilyuk-7180280.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-[center_30%] z-0" />
        <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(160deg,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.55) 50%,rgba(4,26,18,0.72) 100%)' }} />
        <div className="absolute inset-0 z-[2]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full z-[2] -top-48 -right-24" style={{ background: 'radial-gradient(circle,rgba(29,158,117,0.14),transparent 70%)' }} />

        <div className="relative z-[3] max-w-[780px] mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-[12px] text-vert-lite font-medium mb-8">
            <IconBuildingBank size={14} /> Espace Entreprises &amp; Partenaires
          </div>
          <h1 className="text-[52px] font-semibold leading-[1.08] tracking-[-2px] text-white mb-6">
            Votre marque au cœur<br />de la <em className="not-italic text-vert-lite">communauté financière</em>
          </h1>
          <p className="text-[17px] text-white/65 leading-relaxed max-w-[520px] mx-auto mb-10">
            Finko connecte vos produits et services aux personnes qui parlent déjà d'investissement, de budget et d'épargne chaque jour.
          </p>
          <div className="flex gap-3 justify-center mb-12">
            <a href="#gate" className="inline-flex items-center gap-2 bg-vert text-white px-7 py-3.5 rounded-lg text-[14px] font-medium hover:bg-vert-hover transition-colors">
              <IconArrowDown size={16} /> Accéder aux informations partenaires
            </a>
          </div>
          <div className="flex justify-center border border-white/15 rounded-xl overflow-hidden max-w-[360px] mx-auto">
            <div className="flex-1 px-6 py-5 text-center border-r border-white/12">
              <div className="text-[26px] font-semibold text-white">14 800+</div>
              <div className="text-[12px] text-white/50 mt-0.5">Membres actifs</div>
            </div>
            <div className="flex-1 px-6 py-5 text-center">
              <div className="text-[26px] font-semibold text-white">320+</div>
              <div className="text-[12px] text-white/50 mt-0.5">Discussions/semaine</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GATE ── */}
      {!unlocked && (
        <section id="gate" className="relative border-y border-bordure py-20 px-8 overflow-hidden">
          <img src="/pexels-pavel-danilyuk-7180280.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-[center_30%] blur-[18px] scale-[1.08] opacity-55 pointer-events-none" />
          <div className="absolute inset-0 bg-[rgba(4,26,18,0.5)]" />
          <div className="relative z-10 bg-white/97 border border-white/60 rounded-2xl max-w-[520px] mx-auto px-10 py-12 text-center shadow-[0_16px_60px_rgba(0,0,0,0.25)]">
            <div className="w-14 h-14 bg-[#E1F5EE] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IconBuildingBank size={28} className="text-vert" />
            </div>
            <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3">Accès partenaires</p>
            <h2 className="text-[24px] font-medium tracking-[-0.5px] text-texte mb-3 leading-snug">
              14 800 investisseurs actifs.<br />Combien vous connaissent ?
            </h2>
            <p className="text-[14px] text-muted leading-relaxed mb-8 max-w-[380px] mx-auto">
              Renseignez l'email de votre organisation pour accéder aux données d'audience et aux opportunités partenaires.
            </p>
            <div className="mb-3">
              <div className="relative">
                <input
                  type="email"
                  value={gateEmail}
                  onChange={e => handleGateInput(e.target.value)}
                  placeholder="prenom.nom@votre-entreprise.fr"
                  className={`w-full px-[18px] py-3.5 border rounded-xl text-[14px] outline-none transition-all font-sans ${
                    gateStatus === 'valid' ? 'border-vert bg-[#f8fdf9] ring-2 ring-vert/10' :
                    gateStatus === 'error' ? 'border-red-400 ring-2 ring-red-400/10' :
                    'border-[#ccc] focus:border-vert focus:ring-2 focus:ring-vert/10'
                  }`}
                  disabled={gateStatus === 'valid'}
                />
              </div>
              {gateStatus === 'error' && (
                <p className="text-[12px] text-red-500 text-left mt-1.5 px-0.5">{gateMsg}</p>
              )}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[12px] text-[#aaa] mt-4">
              <IconShieldLock size={14} /> Adresse email professionnelle uniquement — aucun démarchage
            </p>
            <div className="flex gap-6 justify-center mt-6 pt-6 border-t border-[#f0f0ee]">
              {[['IconShieldLock', 'RGPD conforme'], ['IconEyeOff', 'Non revendu'], ['IconClock', 'Accès immédiat']].map(([, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-[#aaa]">
                  <IconCheck size={14} className="text-vert" />{label}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── GATED CONTENT ── */}
      {unlocked && (
        <div className="animate-fade-in-up">

          {/* LOGOS */}
          <div className="py-8 px-10 border-b border-bordure bg-fond-gris">
            <p className="text-center text-[11px] font-medium tracking-[2px] uppercase text-[#aaa] mb-6">Ils nous font confiance</p>
            <div className="flex justify-center items-center gap-12 flex-wrap">
              {['BNP Paribas','Boursorama','Linxea','Nalo','Yomoni','Cashbee'].map(n => (
                <div key={n} className="bg-fond border border-bordure rounded-lg px-6 py-2.5 text-[13px] font-semibold text-[#888]">{n}</div>
              ))}
            </div>
          </div>

          {/* OFFRES */}
          <section className="py-20 px-10 max-w-[1060px] mx-auto">
            <div className="text-center mb-14">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3"><IconSparkles size={13} /> Ce que vous obtenez</p>
              <h2 className="text-[36px] font-medium tracking-[-1px] mb-3">Tout ce qu'il faut pour<br />être présent où ça compte</h2>
              <p className="text-[15px] text-[#555] max-w-[480px] mx-auto leading-relaxed">Des outils pensés pour mettre en valeur votre expertise auprès d'une audience qualifiée et engagée.</p>
            </div>
            <div className="grid grid-cols-3 border border-bordure rounded-2xl overflow-hidden" style={{ gap: '0.75px', background: '#e5e5e5' }}>
              {offres.map(({ icon: Icon, title, desc, features }) => (
                <div key={title} className="p-7 bg-fond hover:bg-[#f8f8f6] transition-colors">
                  <div className="w-12 h-12 bg-[#E1F5EE] rounded-xl flex items-center justify-center mb-5">
                    <Icon size={24} className="text-vert" />
                  </div>
                  <h3 className="text-[17px] font-medium mb-2">{title}</h3>
                  <p className="text-[13px] text-[#555] leading-relaxed mb-5">{desc}</p>
                  <div className="flex flex-col gap-1.5">
                    {features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-[12px] text-[#555]">
                        <IconCheck size={14} className="text-vert shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="bg-fond-gris border-y border-bordure py-20 px-10">
            <div className="max-w-[860px] mx-auto">
              <div className="text-center mb-14">
                <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3"><IconListNumbers size={13} /> Comment ça marche</p>
                <h2 className="text-[36px] font-medium tracking-[-1px] mb-3">Présent sur Finko en 4 étapes</h2>
                <p className="text-[15px] text-[#555] max-w-[440px] mx-auto leading-relaxed">De la création de compte à vos premières interactions membres, tout est guidé.</p>
              </div>
              <div className="grid grid-cols-4 gap-8">
                {steps.map(({ n, title, desc }) => (
                  <div key={n} className="text-center">
                    <div className="w-11 h-11 bg-vert rounded-full flex items-center justify-center text-[16px] font-semibold text-white mx-auto mb-4">{n}</div>
                    <h4 className="text-[14px] font-medium mb-1.5">{title}</h4>
                    <p className="text-[13px] text-[#555] leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PRICING */}
          <section className="py-20 px-10 max-w-[960px] mx-auto">
            <div className="text-center mb-14">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3"><IconReceipt size={13} /> Tarifs</p>
              <h2 className="text-[36px] font-medium tracking-[-1px] mb-3">Des plans pour chaque ambition</h2>
              <p className="text-[15px] text-[#555] max-w-[440px] mx-auto leading-relaxed">Commencez gratuitement, évoluez quand vous êtes prêt.</p>
            </div>
            <div className="flex items-center justify-center gap-3 mb-10 text-[13px] text-[#555]">
              <span>Mensuel</span>
              <button
                onClick={() => setAnnual(p => !p)}
                className={`w-11 h-6 rounded-full relative transition-colors ${annual ? 'bg-vert' : 'bg-[#ccc]'}`}
              >
                <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-all ${annual ? 'right-[3px]' : 'left-[3px]'}`} />
              </button>
              <span>Annuel</span>
              <span className="bg-[#E1F5EE] text-[#085041] text-[11px] font-medium px-2.5 py-0.5 rounded-full">-20%</span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {/* STARTER */}
              <div className="border border-bordure rounded-2xl p-8 bg-fond">
                <p className="text-[14px] font-medium text-[#888] mb-2">Starter</p>
                <p className="text-[38px] font-semibold tracking-[-1.5px] mb-1">Gratuit</p>
                <p className="text-[13px] text-[#555] leading-snug mb-6 pb-6 border-b border-bordure">Pour tester la plateforme et établir une première présence.</p>
                <div className="flex flex-col gap-2.5 mb-7">
                  {[['Profil entreprise de base', true],['3 publications/mois', true],['Badge partenaire', true],['Webinaires', false],['Publicité ciblée', false],['Analytics avancés', false]].map(([f, on]) => (
                    <div key={f as string} className={`flex items-start gap-2 text-[13px] leading-snug ${on ? 'text-[#555]' : 'text-[#aaa]'}`}>
                      {on ? <IconCheck size={15} className="text-vert shrink-0 mt-px" /> : <IconX size={15} className="text-[#ccc] shrink-0 mt-px" />}{f}
                    </div>
                  ))}
                </div>
                <Link href="/dashboard-entreprise" className="block w-full py-3 rounded-lg text-[14px] font-medium text-center text-vert border border-vert hover:bg-[#E1F5EE] transition-colors">Créer un compte</Link>
              </div>
              {/* PRO */}
              <div className="border border-vert rounded-2xl p-8 bg-fond relative shadow-[0_0_0_1px_#1D9E75]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-vert text-white text-[11px] font-medium px-3.5 py-1 rounded-full whitespace-nowrap">Recommandé</div>
                <p className="text-[14px] font-medium text-[#888] mb-2">Pro</p>
                <p className="text-[38px] font-semibold tracking-[-1.5px] mb-1">
                  {annual ? '€79' : '€99'}<span className="text-[16px] font-normal text-[#888]">/mois</span>
                </p>
                <p className="text-[13px] text-[#555] leading-snug mb-6 pb-6 border-b border-bordure">Pour les équipes marketing qui veulent un impact mesurable sur leur audience.</p>
                <div className="flex flex-col gap-2.5 mb-7">
                  {['Profil personnalisé complet','Publications illimitées','2 webinaires/mois inclus','Publicité ciblée (budget libre)','Analytics complets + export','Support prioritaire'].map(f => (
                    <div key={f} className="flex items-start gap-2 text-[13px] text-[#555] leading-snug">
                      <IconCheck size={15} className="text-vert shrink-0 mt-px" />{f}
                    </div>
                  ))}
                </div>
                <Link href="/dashboard-entreprise" className="block w-full py-3 rounded-lg text-[14px] font-medium text-center bg-vert text-white hover:bg-vert-hover transition-colors">Démarrer l'essai gratuit</Link>
              </div>
              {/* ENTERPRISE */}
              <div className="border border-bordure rounded-2xl p-8 bg-fond">
                <p className="text-[14px] font-medium text-[#888] mb-2">Entreprise</p>
                <p className="text-[38px] font-semibold tracking-[-1.5px] mb-1">Sur mesure</p>
                <p className="text-[13px] text-[#555] leading-snug mb-6 pb-6 border-b border-bordure">Pour les institutions financières et marques qui veulent une présence maximale.</p>
                <div className="flex flex-col gap-2.5 mb-7">
                  {['Tout le plan Pro','Webinaires illimités','Mise en avant homepage','Intégrations API dédiées','Chargé de compte dédié','SLA et contrat sur mesure'].map(f => (
                    <div key={f} className="flex items-start gap-2 text-[13px] text-[#555] leading-snug">
                      <IconCheck size={15} className="text-vert shrink-0 mt-px" />{f}
                    </div>
                  ))}
                </div>
                <a href="mailto:partenariats@finko.fr" className="block w-full py-3 rounded-lg text-[14px] font-medium text-center bg-texte text-white hover:bg-[#333] transition-colors">Contacter l'équipe</a>
              </div>
            </div>
          </section>

          {/* TEMOIGNAGES */}
          <section className="bg-fond-gris border-y border-bordure py-20 px-10">
            <div className="max-w-[960px] mx-auto">
              <div className="text-center mb-12">
                <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3"><IconQuote size={13} /> Témoignages</p>
                <h2 className="text-[32px] font-medium tracking-[-0.75px] mb-2">Ce que disent nos partenaires</h2>
                <p className="text-[14px] text-[#555]">Des entreprises de toutes tailles ont déjà choisi Finko pour leur présence digitale.</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {temos.map(({ stars, text, init, name, role, color }) => (
                  <div key={name} className="bg-fond border border-bordure rounded-2xl p-7">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: Math.floor(stars) }).map((_, i) => <IconStarFilled key={i} size={14} className="text-[#F5A623]" />)}
                      {stars % 1 ? <IconStarHalfFilled size={14} className="text-[#F5A623]" /> : null}
                    </div>
                    <p className="text-[13px] text-[#444] leading-relaxed mb-5 italic">{text}</p>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 ${color}`}>{init}</div>
                      <div>
                        <p className="text-[13px] font-medium">{name}</p>
                        <p className="text-[11px] text-[#888]">{role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 px-10 max-w-[680px] mx-auto">
            <div className="text-center mb-12">
              <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3"><IconHelpCircle size={13} /> FAQ</p>
              <h2 className="text-[32px] font-medium tracking-[-0.75px] mb-2">Questions fréquentes</h2>
              <p className="text-[14px] text-[#555]">Tout ce que vous voulez savoir avant de démarrer.</p>
            </div>
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="border-b border-bordure">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center py-5 text-[14px] font-medium text-left gap-4"
                >
                  {q}
                  <IconPlus size={18} className={`text-[#888] shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="text-[13px] text-[#555] leading-relaxed pb-5">{a}</p>
                )}
              </div>
            ))}
          </section>

          {/* FINAL CTA */}
          <section className="py-20 px-10 text-center" style={{ background: 'linear-gradient(135deg,#042e26,#085041)' }}>
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[2.5px] uppercase text-vert-lite mb-4"><IconRocket size={13} /> Prêt à démarrer ?</p>
            <h2 className="text-[38px] font-medium tracking-[-1px] text-white mb-4">
              Rejoignez les marques qui<br />misent sur <em className="not-italic text-vert-lite">Finko</em>
            </h2>
            <p className="text-[16px] text-white/65 max-w-[440px] mx-auto mb-10 leading-relaxed">Créez votre profil entreprise gratuitement aujourd'hui. Aucune carte bancaire requise.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/dashboard-entreprise" className="inline-flex items-center gap-2 bg-vert text-white px-7 py-3.5 rounded-lg text-[14px] font-medium hover:bg-vert-hover transition-colors">
                <IconRocket size={16} /> Créer mon espace entreprise
              </Link>
              <a href="mailto:partenariats@finko.fr" className="inline-flex items-center gap-2 text-white px-7 py-3.5 rounded-lg text-[14px] font-medium border border-white/25 bg-white/08 hover:bg-white/15 transition-colors">
                <IconMail size={16} /> Parler à l'équipe
              </a>
            </div>
          </section>

          <Footer />
        </div>
      )}
    </div>
  )
}
