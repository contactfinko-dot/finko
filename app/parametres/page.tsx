import type { Metadata } from 'next'
import ParametresClient from './ParametresClient'

export const metadata: Metadata = { title: 'Finko · Paramètres' }

export default function ParametresPage() {
  return <ParametresClient />
}
