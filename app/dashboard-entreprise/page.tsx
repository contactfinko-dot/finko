import type { Metadata } from 'next'
import DashboardEntrepriseClient from './DashboardEntrepriseClient'

export const metadata: Metadata = { title: 'Finko · Tableau de bord Entreprise' }

export default function DashboardEntreprisePage() {
  return <DashboardEntrepriseClient />
}
