import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finko',
  description: 'La plateforme financière française',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-fond text-texte antialiased">
        {children}
      </body>
    </html>
  )
}
