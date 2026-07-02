import type { Metadata } from 'next'
import AccueilClient from './AccueilClient'

export const metadata: Metadata = {
  title: 'Finko · La finance, on en parle ensemble',
  description: "Rejoins des curieux qui partagent leurs expériences d'investissement. Sans jargon, sans vendeur, entre pairs.",
}

export default function Home() {
  return <AccueilClient />
}
