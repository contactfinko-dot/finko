import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-bordure px-10 py-8 flex justify-between items-center bg-fond text-sm">
      <div className="flex items-center gap-2 text-[16px] font-medium">
        <div className="w-2 h-2 rounded-full bg-vert" />
        <span>fin<em className="not-italic text-vert">ko</em></span>
      </div>
      <div className="flex gap-8">
        {['À propos', 'Conditions', 'Confidentialité'].map(l => (
          <Link key={l} href="#" className="text-[#888] hover:text-texte transition-colors text-[13px]">{l}</Link>
        ))}
        <a href="mailto:partenariats@finko.fr" className="text-[#888] hover:text-texte transition-colors text-[13px]">Contact</a>
      </div>
      <span className="text-[12px] text-[#bbb]">© 2026 Finko. Tous droits réservés.</span>
    </footer>
  )
}
