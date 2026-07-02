import type { Metadata } from 'next'
import ConnexionClient from './ConnexionClient'

export const metadata: Metadata = { title: 'Finko · Connexion' }

export default function ConnexionPage() {
  return <ConnexionClient />
}
