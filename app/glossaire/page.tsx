import type { Metadata } from 'next'
import GlossiareClient from './GlossiareClient'

export const metadata: Metadata = { title: 'Finko · Glossaire financier' }

export default function GlossairePage() {
  return <GlossiareClient />
}
