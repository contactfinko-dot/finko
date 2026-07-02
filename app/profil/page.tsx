import type { Metadata } from 'next'
import ProfilClient from './ProfilClient'

export const metadata: Metadata = { title: 'Finko · Mon Profil' }

export default function ProfilPage() {
  return <ProfilClient />
}
