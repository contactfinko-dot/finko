import type { Metadata } from 'next'
import CalculatricesClient from './CalculatricesClient'

export const metadata: Metadata = { title: 'Finko · Calculatrices financières' }

export default function CalculatricesPage() {
  return <CalculatricesClient />
}
