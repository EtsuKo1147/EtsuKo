import Link from 'next/link'

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'WORKS', href: '/works' },
  { label: 'ABOUT', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-black">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium tracking-widest uppercase">
          Freesh
        </Link>
        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-widest text-black hover:opacity-40 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
