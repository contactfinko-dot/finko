import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import Footer from '@/app/components/Footer'

export const metadata: Metadata = { title: 'Finko · À propos' }

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-fond font-sans flex flex-col">
      <Nav />
      <main className="flex-1 max-w-[680px] mx-auto py-14 px-6">
        <p className="text-[11px] font-medium tracking-[2.5px] uppercase text-vert mb-3">À propos</p>
        <h1 className="text-[32px] font-semibold tracking-tight mb-6">La finance, on en parle ensemble</h1>
        <div className="text-[15px] text-muted leading-[1.8] space-y-5">
          <p>
            Finko est née d&apos;un constat simple : en France, on ne parle pas d&apos;argent.
            Ni à table, ni entre amis, ni au travail. Résultat, chacun se débrouille seul
            face à des décisions qui engagent des années — épargner, investir, préparer sa retraite.
          </p>
          <p>
            Finko est une communauté indépendante où des curieux partagent leurs expériences
            d&apos;investissement : ce qui a marché, ce qui n&apos;a pas marché, et pourquoi.
            Sans jargon, sans vendeur, entre pairs.
          </p>
          <p>
            Nous ne sommes pas un conseiller financier. Aucun contenu publié sur Finko ne
            constitue une recommandation d&apos;investissement. Les échanges sont des opinions
            personnelles, et chaque membre reste responsable de ses décisions.
          </p>
          <p>
            La plateforme est gratuite, sans publicité et sans commission. Les professionnels
            qui interviennent dans nos webinaires le font à titre gracieux, dans le cadre
            d&apos;échanges transparents avec la communauté.
          </p>
        </div>
        <div className="mt-10 p-6 bg-[#E1F5EE] rounded-2xl border border-[#9FE1CB]">
          <p className="text-[14px] text-[#085041] font-medium mb-1">Une question, une idée ?</p>
          <p className="text-[13px] text-[#0F6E56]">
            Écris-nous : <a href="mailto:partenariats@finko.fr" className="underline">partenariats@finko.fr</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
