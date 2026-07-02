import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'

export const metadata: Metadata = { title: "Finko · Conditions d'utilisation" }

const SECTIONS = [
  {
    title: '1. Objet',
    body: "Finko est une plateforme communautaire d'échange autour des finances personnelles. En créant un compte, tu acceptes les présentes conditions d'utilisation.",
  },
  {
    title: '2. Pas de conseil financier',
    body: "Finko n'est pas un conseiller en investissements financiers. Les contenus publiés par les membres ou les intervenants sont des opinions personnelles et ne constituent en aucun cas des recommandations d'investissement. Chaque membre reste seul responsable de ses décisions financières.",
  },
  {
    title: '3. Transactions interdites',
    body: "Toute transaction financière entre membres est strictement interdite sur la plateforme : vente de produits financiers, sollicitation d'investissement, gestion de fonds pour le compte d'autrui, parrainages rémunérés non déclarés.",
  },
  {
    title: '4. Comportement',
    body: "Les échanges doivent rester respectueux. Sont interdits : le spam, la publicité non sollicitée, le harcèlement, la désinformation volontaire et l'usurpation d'identité. Finko se réserve le droit de supprimer tout contenu ou compte contrevenant.",
  },
  {
    title: '5. Contenu publié',
    body: "Tu restes propriétaire des contenus que tu publies. En les publiant, tu accordes à Finko une licence d'affichage sur la plateforme. Tu peux supprimer tes posts à tout moment.",
  },
  {
    title: '6. Suppression de compte',
    body: "Tu peux supprimer ton compte à tout moment depuis les paramètres. La suppression est définitive et entraîne l'effacement de tes données personnelles.",
  },
]

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-fond font-sans flex flex-col">
      <Nav />
      <main className="flex-1 max-w-[680px] mx-auto py-14 px-6">
        <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3">Légal</p>
        <h1 className="text-[32px] font-semibold tracking-tight mb-2">Conditions d&apos;utilisation</h1>
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
