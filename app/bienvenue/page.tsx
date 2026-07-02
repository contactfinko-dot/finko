import type { Metadata } from 'next'
import BienvenueClient from './BienvenueClient'

export const metadata: Metadata = { title: 'Finko · Bienvenue' }

export default function BienvenuePage() {
  return <BienvenueClient />
}
