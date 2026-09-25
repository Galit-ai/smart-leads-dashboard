import type { Lead } from '../types/lead'
import type { FollowUp } from '../utils/smart'
import { leadScore, temperature } from '../utils/smart'
import { TempBadge } from './ui'

interface Props {
  followUps: FollowUp[]
  onMessage: (lead: Lead) => void
  onContacted: (lead: Lead) => void
}

export function TodayPanel({ followUps, onMessage, onContacted }: Props) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">למי לפנות היום</h2>
      <p className="mb-3 text-sm text-slate-500">מסודר לפי מי הכי חם ודחוף</p>

      {followUps.length === 0 ? (
        <p className="py-4 text-center text-slate-500">אין למי לחזור היום. כל הכבוד 👏</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {followUps.slice(0, 6).map(({ lead, reason }) => {
            const score = leadScore(lead)
            return (
              <li key={lead.id} className="flex flex-wrap items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-800">{lead.name}</span>
                    <TempBadge temp={temperature(score)} score={score} />
                  </div>
                  <div className="text-sm text-slate-500">
                    {lead.type === 'hotel'
                      ? lead.company || 'בית מלון'
                      : [lead.age > 0 && `גיל ${lead.age}`, lead.city].filter(Boolean).join(', ') ||
                        'לקוח פרטי'}{' '}
                    · {reason}
                  </div>
                </div>
                <button
                  onClick={() => onMessage(lead)}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  ✍️ הודעה
                </button>
                <button
                  onClick={() => onContacted(lead)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  ✓ פניתי
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {followUps.length > 6 && (
        <p className="mt-2 text-sm text-slate-500">ועוד {followUps.length - 6} בלוח למטה</p>
      )}
    </section>
  )
}
