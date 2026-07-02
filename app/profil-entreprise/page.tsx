import type { Metadata } from 'next'
import ProfilEntrepriseClient from './ProfilEntrepriseClient'

export const metadata: Metadata = { title: 'Finko · Profil Entreprise — Nalo' }

export default function ProfilEntreprisePage() {
  return <ProfilEntrepriseClient />
}
