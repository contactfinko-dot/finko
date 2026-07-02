import type { Metadata } from 'next'
import EntreprisesClient from './EntreprisesClient'

export const metadata: Metadata = { title: 'Finko · Espace Entreprises' }

export default function EntreprisesPage() {
  return <EntreprisesClient />
}
