export const metadata = { title: 'About — Freesh' }

export default function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-24 flex-1">
      <p className="text-xs tracking-widest uppercase text-black/40 mb-16">About</p>
      <div className="grid md:grid-cols-2 gap-16">
        <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-tight">
          Designer.
          <br />
          Developer.
          <br />
          <span className="italic">Curious person.</span>
        </h1>
        <div className="space-y-6 text-base font-light leading-relaxed text-black/70 max-w-md">
          <p>
            This is a placeholder bio. Fill in the real story here — what you care about,
            how you work, what you&apos;ve been doing.
          </p>
          <p>
            Currently based somewhere, working on things that matter. Open to collaborations
            and conversations.
          </p>
        </div>
      </div>
    </main>
  )
}
