import type { Metadata } from 'next'
import WebinairesClient from './WebinairesClient'

export const metadata: Metadata = { title: 'Finko · Webinaires' }

export default function WebinairesPage() {
  return <WebinairesClient />
}
