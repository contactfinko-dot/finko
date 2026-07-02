import type { Metadata } from 'next'
import CommunauteClient from './CommunauteClient'

export const metadata: Metadata = { title: 'Finko · Communauté' }

export default function CommunautePage() {
  return <CommunauteClient />
}
