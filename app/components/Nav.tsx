'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconUsers,
  IconVideo,
  IconCalculator,
  IconBuilding,
  IconMenu2,
  IconX,
} from '@tabler/icons-react'

const links = [
  { href: '/communaute',   label: 'Communauté',    icon: IconUsers },
  { href: '/webinaires',   label: 'Webinaires',    icon: IconVideo },
  { href: '/calculatrices',label: 'Calculatrices', icon: IconCalculator },
  { href: '/entreprises',  label: 'Entreprises',   icon: IconBuilding },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="border-b border-bordure bg-fond sticky top-0 z-50 animate-fade-in">
      <div className="flex justify-between items-center px-10 max-md:px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-[19px] font-medium text-texte">
          <div className="w-2 h-2 rounded-full bg-vert" />
          <span>fin<em className="not-italic text-vert">ko</em></span>
        </Link>

        <div className="flex gap-7 max-md:hidden">
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

        <div className="flex items-center gap-2.5 max-md:hidden">
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

        {/* Burger mobile */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          className="hidden max-md:flex items-center justify-center w-9 h-9 bg-transparent border-none cursor-pointer text-texte"
        >
          {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="hidden max-md:block border-t border-bordure bg-fond px-5 py-3 animate-fade-in">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 py-3 text-[14px] border-b border-[#f0f0ee] ${
                  active ? 'text-vert font-medium' : 'text-texte'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
          <div className="flex gap-2.5 pt-4 pb-2">
            <Link
              href="/connexion"
              onClick={() => setOpen(false)}
              className="flex-1 text-center text-[13px] text-texte border border-bordure px-4 py-2.5 rounded-md"
            >
              Connexion
            </Link>
            <Link
              href="/connexion"
              onClick={() => setOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-vert-dark text-white text-[13px] font-medium px-4 py-2.5 rounded-md"
            >
              <IconBuilding size={15} />
              Espace entreprise
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
