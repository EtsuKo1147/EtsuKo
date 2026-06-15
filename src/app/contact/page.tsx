export const metadata = { title: 'Contact — Etsu.' }

export default function ContactPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-24 flex-1">
      <p className="text-xs tracking-widest uppercase text-black/40 mb-16">Contact</p>
      <h1 className="text-4xl md:text-6xl font-light leading-none tracking-tight mb-16">
        Say hello.
      </h1>
      <div className="space-y-4 text-sm font-light text-black/60">
        <p className="text-xs tracking-widest uppercase text-black/30 mb-2">Email</p>
        <a
          href="mailto:hello@example.com"
          className="text-xl font-light border-b border-black/20 pb-0.5 hover:border-black hover:text-black transition-colors"
        >
          hello@example.com
        </a>
      </div>
    </main>
  )
}
