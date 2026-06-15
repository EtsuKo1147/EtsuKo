import { works } from '@/data/works'
import Link from 'next/link'

export const metadata = { title: 'Works — Etsu.' }

export default function WorksPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-24 flex-1">
      <p className="text-xs tracking-widest uppercase text-black/40 mb-16">All Works</p>
      <ul>
        {works.map((work, i) => (
          <li key={work.id}>
            <Link
              href={work.href}
              className="group flex items-baseline justify-between py-6 border-t border-black/10 hover:border-black transition-colors"
            >
              <div className="flex items-baseline gap-6">
                <span className="text-xs text-black/30 w-6">{work.id}</span>
                <div>
                  <span className="text-2xl font-light">{work.title}</span>
                  <span className="ml-4 text-xs tracking-widest uppercase text-black/40">
                    {work.category}
                  </span>
                </div>
              </div>
              <span className="text-xs text-black/30">{work.year}</span>
            </Link>
            {i === works.length - 1 && <div className="border-t border-black/10" />}
          </li>
        ))}
      </ul>
    </main>
  )
}
