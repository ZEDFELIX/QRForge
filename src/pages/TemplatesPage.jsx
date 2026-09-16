import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Wand2, ArrowRight } from 'lucide-react'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../utils/templates.js'

// Map template category icons by lucide name
const ICON_MAP = {
  build: null, // handled by fallback
}

export default function TemplatesPage() {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filtered = TEMPLATES.filter((t) => {
    const inCat = category === 'all' || t.category === category
    const q = query.trim().toLowerCase()
    const inQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    return inCat && inQuery
  })

  const applyTemplate = (template) => {
    navigate(`/app/create?template=${encodeURIComponent(template.id)}`)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Templates</h1>
        <p className="text-sm text-slate-500">
          Start from a ready-made template — then customize colors, logo, and content. All free.
        </p>
      </header>

      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates…"
          className="input w-full pl-10"
          aria-label="Search templates"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              category === c.id ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">No templates match your search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Wand2 size={20} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {t.category}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{t.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{t.description}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:underline">
                Use template <ArrowRight size={12} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}