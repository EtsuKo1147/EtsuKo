import Link from 'next/link'
import { works } from '@/data/works'

export default function SelectedWorks() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <p className="text-xs tracking-widest uppercase text-black/40 mb-12">
        Selected Works
      </p>
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
            {i === works.length - 1 && (
              <div className="border-t border-black/10" />
            )}
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <Link
          href="/works"
          className="text-xs tracking-widest uppercase border-b border-black pb-0.5 hover:opacity-40 transition-opacity"
        >
          All Works →
        </Link>
      </div>
    </section>
  )
}
