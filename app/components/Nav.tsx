'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconUsers,
  IconVideo,
  IconCalculator,
  IconBuilding,
} from '@tabler/icons-react'

const links = [
  { href: '/communaute',   label: 'Communauté',    icon: IconUsers },
  { href: '/webinaires',   label: 'Webinaires',    icon: IconVideo },
  { href: '/calculatrices',label: 'Calculatrices', icon: IconCalculator },
  { href: '/entreprises',  label: 'Entreprises',   icon: IconBuilding },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex justify-between items-center px-10 py-4 border-b border-bordure bg-fond sticky top-0 z-50 animate-fade-in">
      <Link href="/" className="flex items-center gap-2 text-[19px] font-medium text-texte">
        <div className="w-2 h-2 rounded-full bg-vert" />
        <span>fin<em className="not-italic text-vert">ko</em></span>
      </Link>

      <div className="flex gap-7">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 text-[13px] transition-colors ${
                active ? 'text-vert font-medium' : 'text-muted hover:text-texte'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-2.5">
        <Link href="/connexion" className="text-[13px] text-muted hover:text-texte transition-colors">
          Connexion
        </Link>
        <Link
          href="/connexion"
          className="flex items-center gap-1.5 bg-vert-dark text-white text-[13px] font-medium px-[18px] py-2 rounded-md transition-opacity hover:opacity-90"
        >
          <IconBuilding size={15} />
          Espace entreprise
        </Link>
      </div>
    </nav>
  )
}
