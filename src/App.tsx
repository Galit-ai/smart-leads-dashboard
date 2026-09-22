import { useMemo, useState } from 'react'
import { Board } from './components/Board'
import { KpiRow } from './components/KpiRow'
import { LeadForm } from './components/LeadForm'
import { MessageDialog } from './components/MessageDialog'
import { TodayPanel } from './components/TodayPanel'
import { emptyLead } from './data/emptyLead'
import { useLeads } from './data/useLeads'
import type { Lead, LeadSource, LeadType } from './types/lead'
import { SOURCE_LABELS, TYPE_LABELS } from './types/lead'
import { daysBetween, today } from './utils/dates'
import { todaysFollowUps } from './utils/smart'

export default function App() {
  const { leads, saveLead, updateLead, deleteLead, clearExamples, hasExamples } = useLeads()
  const [editing, setEditing] = useState<{ lead: Lead; isNew: boolean } | null>(null)
  const [messaging, setMessaging] = useState<Lead | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<LeadType | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all')

  const followUps = useMemo(() => todaysFollowUps(leads), [leads])

  const visible = leads.filter((l) => {
    if (typeFilter !== 'all' && l.type !== typeFilter) return false
    if (sourceFilter !== 'all' && l.source !== sourceFilter) return false
    const q = search.trim()
    return !q || `${l.name} ${l.company} ${l.role} ${l.notes}`.includes(q)
  })

  function markContacted(lead: Lead) {
    const t = today()
    updateLead(lead.id, {
      lastContact: t,
      stage: lead.stage === 'to_contact' ? 'contacted' : lead.stage,
      // תזכורת שכבר הגיע זמנה – טופלה
      nextFollowUp:
        lead.nextFollowUp && daysBetween(lead.nextFollowUp, t) >= 0 ? '' : lead.nextFollowUp,
    })
  }

  const filterClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none'

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-l from-violet-700 to-fuchsia-600 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <h1 className="text-2xl font-bold">דאשבורד ניהול לידים חכם</h1>
            <p className="text-sm text-violet-100">Joole · בתי מלון ולקוחות פרטיים</p>
          </div>
          <button
            onClick={() => setEditing({ lead: emptyLead(), isNew: true })}
            className="rounded-xl bg-white px-4 py-2 font-bold text-violet-700 shadow hover:bg-violet-50"
          >
            + ליד חדש
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5">
        {hasExamples && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>
              כרגע מוצגים לידים לדוגמה, כדי שתראי איך זה עובד. כשתתחילי להוסיף אנשים אמיתיים,
              אפשר למחוק אותם.
            </span>
            <button
              onClick={clearExamples}
              className="rounded-lg bg-amber-100 px-3 py-1 font-medium hover:bg-amber-200"
            >
              מחיקת הדוגמאות
            </button>
          </div>
        )}

        <KpiRow leads={leads} followUpCount={followUps.length} />

        <TodayPanel followUps={followUps} onMessage={setMessaging} onContacted={markContacted} />

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="me-auto text-lg font-bold text-slate-800">כל הלידים</h2>
            <input
              className={`${filterClass} w-40`}
              placeholder="חיפוש…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={filterClass}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as LeadType | 'all')}
            >
              <option value="all">כל הסוגים</option>
              {Object.entries(TYPE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className={filterClass}
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as LeadSource | 'all')}
            >
              <option value="all">כל המקורות</option>
              {Object.entries(SOURCE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <Board
            leads={visible}
            onMove={(id, stage) => updateLead(id, { stage })}
            onEdit={(lead) => setEditing({ lead, isNew: false })}
            onMessage={setMessaging}
          />
        </section>

        <p className="text-center text-xs text-slate-400">
          הלידים נשמרים בדפדפן הזה בלבד. בדפדפן או במחשב אחר הם לא יופיעו.
        </p>
      </main>

      {editing && (
        <LeadForm
          initial={editing.lead}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={(lead) => {
            saveLead(lead)
            setEditing(null)
          }}
          onDelete={(id) => {
            deleteLead(id)
            setEditing(null)
          }}
        />
      )}

      {messaging && (
        <MessageDialog
          lead={messaging}
          onContacted={markContacted}
          onClose={() => setMessaging(null)}
        />
      )}
    </div>
  )
}
