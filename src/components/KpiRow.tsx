import type { Lead } from '../types/lead'
import { leadScore, temperature } from '../utils/smart'

interface Props {
  leads: Lead[]
  followUpCount: number
}

export function KpiRow({ leads, followUpCount }: Props) {
  const open = leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost')
  const hot = open.filter((l) => temperature(leadScore(l)) === 'hot').length
  const won = leads.filter((l) => l.stage === 'won').length
  const closed = won + leads.filter((l) => l.stage === 'lost').length
  const winRate = closed ? Math.round((won / closed) * 100) : null

  const cards = [
    { label: 'לידים פתוחים', value: open.length, tone: 'text-slate-800' },
    { label: 'לידים חמים', value: hot, tone: 'text-rose-600' },
    { label: 'לפנות היום', value: followUpCount, tone: 'text-violet-600' },
    { label: 'נסגרו', value: won, tone: 'text-emerald-600' },
    {
      label: 'אחוז סגירה',
      value: winRate === null ? '—' : `${winRate}%`,
      tone: 'text-slate-800',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">{c.label}</div>
          <div className={`mt-1 text-3xl font-bold ${c.tone}`}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}
