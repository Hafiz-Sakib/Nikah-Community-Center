import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { foodItems, foodCats, foodPkgs, img } from '../data'

/* Dish photo: public/images/food-<id>.webp. Until the file exists, a soft gradient + emoji tile is shown. */
function FoodImg({ item }) {
  const [bad, setBad] = useState(false)
  const cat = foodCats.find((c) => c.id === item.cat)
  if (bad) return <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-soft to-slate-100 text-5xl" aria-hidden>{cat?.emoji}</div>
  return <img src={img(`food-${item.id}.webp`)} alt={`${item.name} (${item.bn})`} loading="lazy" onError={() => setBad(true)} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
}

const pill = (on) => `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${on ? 'bg-brand text-white shadow-glow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`

export default function FoodMenu({ limit }) {
  const [pkg, setPkg] = useState('all')
  const [cat, setCat] = useState('all')
  const count = (id) => foodItems.filter((i) => i.by[id]).length
  let list = foodItems.filter((i) => (pkg === 'all' || i.by[pkg]) && (cat === 'all' || i.cat === cat))
  if (limit) list = list.slice(0, limit)
  const sel = foodPkgs.find((p) => p.id === pkg)

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by package">
        <button onClick={() => setPkg('all')} aria-pressed={pkg === 'all'} className={pill(pkg === 'all')}>All packages</button>
        {foodPkgs.map((p) => <button key={p.id} onClick={() => setPkg(p.id)} aria-pressed={pkg === p.id} className={pill(pkg === p.id)}>{p.name} <span className={pkg === p.id ? 'text-white/80' : 'text-slate-500'}>· {count(p.id)} dishes</span></button>)}
      </div>
      {!limit && (
        <div className="mt-3 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
          <button onClick={() => setCat('all')} aria-pressed={cat === 'all'} className={pill(cat === 'all')}>All dishes</button>
          {foodCats.map((c) => <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id} className={pill(cat === c.id)}><span aria-hidden>{c.emoji}</span> {c.label}</button>)}
        </div>
      )}

      <motion.ul layout className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((it) => {
            const c = foodCats.find((x) => x.id === it.cat)
            return (
              <motion.li key={it.id} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.25 }}
                className="group overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-slate-200/80">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <FoodImg item={it} />
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">{c?.emoji} {c?.label}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-fg">{it.name}</h3>
                  <p className="text-sm text-slate-600">{it.bn}</p>
                  <div className="mt-3 border-t border-slate-200/80 pt-3 text-[13px]">
                    {sel ? (
                      <p className="text-slate-700"><span className="font-semibold text-brand-ink">{sel.short}:</span> {it.by[sel.id]}</p>
                    ) : (
                      <ul className="space-y-1">
                        {foodPkgs.map((p) => (
                          <li key={p.id} className="flex items-start justify-between gap-3">
                            <span className={it.by[p.id] ? 'font-semibold text-brand-ink' : 'text-slate-400'}>{p.short}</span>
                            <span className={`text-right ${it.by[p.id] ? 'text-slate-700' : 'text-slate-400'}`}>{it.by[p.id] || '—'}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </motion.ul>
      {list.length === 0 && <p className="mt-10 text-center text-slate-600">No dishes in this category for the selected package.</p>}
    </div>
  )
}
