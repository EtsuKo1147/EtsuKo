import Link from 'next/link'

export default function ContactSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-32 border-t border-black/10">
      <p className="text-xs tracking-widest uppercase text-black/40 mb-8">Contact</p>
      <h2 className="text-4xl md:text-6xl font-light leading-none tracking-tight mb-12">
        Let&apos;s work
        <br />
        <span className="italic">together.</span>
      </h2>
      <Link
        href="/contact"
        className="text-xs tracking-widest uppercase border-b border-black pb-0.5 hover:opacity-40 transition-opacity"
      >
        Get in Touch →
      </Link>
    </section>
  )
}
