import { hexToRgba } from '../utils/textPage.js'

// Renders a text landing page from a decoded config. Used by the on-scan page
// (/p/:data) AND as the live preview inside the generator, so what you design
// is exactly what a phone shows. Themes: light | gradient | dark.

export default function TextPageView({ title, text, accent, theme, big }) {
  const color = accent || '#635bff'
  const displayTitle = title || text.trim().split('\n')[0] || ''

  const style =
    theme === 'dark'
      ? { background: '#0b0d1c', color: '#cbd5e1' }
      : theme === 'gradient'
        ? { background: `linear-gradient(180deg, ${hexToRgba(color, 0.16)}, #ffffff 62%)`, color: '#334155' }
        : { background: '#fafbfe', color: '#475569' }

  return (
    <div className="relative overflow-hidden rounded-[28px] p-8 text-center sm:p-12" style={style}>
      {/* soft accent blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: hexToRgba(color, 0.22) }}
        />
        <div
          className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full blur-3xl"
          style={{ background: hexToRgba(color, theme === 'dark' ? 0.14 : 0.18) }}
        />
      </div>

      <div className="relative">
        {displayTitle && (
          <>
            <h1
              className={`font-display font-extrabold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              } ${big ? 'text-4xl leading-[1.05] sm:text-5xl' : 'text-3xl leading-tight sm:text-4xl'}`}
            >
              {displayTitle}
            </h1>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full" style={{ background: color }} />
          </>
        )}

        {text && (
          <p className="mt-6 whitespace-pre-wrap break-words text-base leading-relaxed sm:text-lg">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}