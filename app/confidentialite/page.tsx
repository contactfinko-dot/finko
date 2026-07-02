import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'

export const metadata: Metadata = { title: 'Finko · Politique de confidentialité' }

const SECTIONS = [
  {
    title: '1. Données collectées',
    body: "Lors de la création de ton compte : adresse email, prénom et nom (facultatif), mot de passe chiffré. Lors de l'utilisation : tes publications, réactions, commentaires, votes de sentiment et préférences (centres d'intérêt, bio, avatar).",
  },
  {
    title: '2. Utilisation des données',
    body: "Tes données servent uniquement au fonctionnement de la plateforme : affichage de ton profil, notifications, personnalisation du fil. Finko ne vend aucune donnée à des tiers et n'affiche aucune publicité ciblée.",
  },
  {
    title: '3. Hébergement',
    body: "Les données sont hébergées chez Supabase sur des serveurs situés dans l'Union européenne (région eu-west-1), conformément au RGPD.",
  },
  {
    title: '4. Newsletter',
    body: "Si tu t'inscris à la newsletter ou aux alertes webinaires, ton email est utilisé uniquement pour ces envois. Tu peux te désinscrire à tout moment via le lien présent dans chaque email.",
  },
  {
    title: '5. Tes droits',
    body: "Conformément au RGPD, tu disposes d'un droit d'accès, de rectification, de portabilité et de suppression de tes données. La suppression de ton compte depuis les paramètres efface tes données personnelles. Pour toute demande : partenariats@finko.fr.",
  },
  {
    title: '6. Cookies',
    body: "Finko utilise uniquement des cookies techniques nécessaires à la connexion (session d'authentification). Aucun cookie publicitaire ou de pistage tiers n'est déposé.",
  },
]

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-fond font-sans flex flex-col">
      <Nav />
      <main className="flex-1 max-w-[680px] mx-auto py-14 px-6">
        <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3">Légal</p>
        <h1 className="text-[32px] font-semibold tracking-tight mb-2">Politique de confidentialité</h1>
        <p className="text-[13px] text-[#aaa] mb-10">Dernière mise à jour : juillet 2026</p>
        {SECTIONS.map(s => (
          <section key={s.title} className="mb-8">
            <h2 className="text-[17px] font-medium mb-2">{s.title}</h2>
            <p className="text-[14px] text-muted leading-[1.75]">{s.body}</p>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  )
}
