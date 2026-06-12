import Link from 'next/link'

export default function AboutPreview() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 border-t border-black/10">
      <div className="grid md:grid-cols-2 gap-16">
        <p className="text-xs tracking-widest uppercase text-black/40">About</p>
        <div>
          <p className="text-xl font-light leading-relaxed max-w-md">
            A designer and developer based somewhere. Interested in the space between
            intention and execution — where craft lives.
          </p>
          <div className="mt-10">
            <Link
              href="/about"
              className="text-xs tracking-widest uppercase border-b border-black pb-0.5 hover:opacity-40 transition-opacity"
            >
              More About →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
