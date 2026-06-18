export default function Footer() {
  return (
    <footer className="border-t border-black mt-auto">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase text-black/40">
          Etsu.
        </span>
        <span className="text-xs tracking-widest text-black/40">
          {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  )
}
