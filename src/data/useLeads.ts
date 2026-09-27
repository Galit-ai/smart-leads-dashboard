import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lead } from '../types/lead'
import { normalizeLead } from './emptyLead'
import { exampleLeads } from './exampleLeads'
import { leadsApi } from './leadsApi'

const STORAGE_KEY = 'smart-leads-dashboard:leads'
const EXAMPLES_CLEARED_KEY = 'smart-leads-dashboard:examples-cleared'

/**
 * airtable – הלידים מגיעים מבסיס הנתונים ונשמרים בו (דרך /api/leads)
 * local    – אין חיבור לשרת (למשל בהרצה מקומית), הלידים נשמרים רק בדפדפן
 */
export type StorageMode = 'loading' | 'airtable' | 'local'

function loadLocal(): Lead[] {
  let stored: Lead[] = []
  let examplesCleared = false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) stored = (JSON.parse(raw) as Partial<Lead>[]).map(normalizeLead)
    examplesCleared = localStorage.getItem(EXAMPLES_CLEARED_KEY) === '1'
  } catch {
    // אחסון חסום או נתונים פגומים – מתחילים מהדוגמאות
  }
  if (examplesCleared) return stored
  // דוגמאות שנוספו בגרסה חדשה מופיעות גם אצל מי שכבר פתחה את הדאשבורד
  const ids = new Set(stored.map((l) => l.id))
  return [...stored, ...exampleLeads().filter((l) => !ids.has(l.id))]
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [mode, setMode] = useState<StorageMode>('loading')
  /** למה אין חיבור לבסיס הנתונים, או מה נכשל בשמירה האחרונה */
  const [error, setError] = useState('')

  // הגרסה העדכנית של הלידים, כדי למצוא recordId גם מתוך קריאה אסינכרונית
  const leadsRef = useRef(leads)
  useEffect(() => {
    leadsRef.current = leads
  }, [leads])

  const reload = useCallback(
    () =>
      leadsApi.list().then(
        (fromDb) => {
          setLeads(fromDb.map(normalizeLead))
          setMode('airtable')
          setError('')
        },
        (err: unknown) => {
          setLeads(loadLocal())
          setMode('local')
          setError(err instanceof Error ? err.message : String(err))
        },
      ),
    [],
  )

  useEffect(() => {
    void reload()
  }, [reload])

  // בשמירה מקומית – כל שינוי נכתב לדפדפן
  useEffect(() => {
    if (mode !== 'local') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
    } catch {
      // אין מה לעשות אם האחסון חסום; הנתונים יישארו עד רענון
    }
  }, [leads, mode])

  /** שולח שינוי ל-Airtable ברקע. המסך כבר התעדכן, אז רק מדווחים אם נכשל. */
  function sync(task: () => Promise<unknown>) {
    if (mode !== 'airtable') return
    task().catch((err) => setError(`השינוי לא נשמר ב-Airtable: ${err instanceof Error ? err.message : err}`))
  }

  /** אחרי יצירה, Airtable מחזיר recordId – שומרים אותו על הליד */
  function attachRecordIds(created: Lead[]) {
    const byId = new Map(created.map((l) => [l.id, l.recordId]))
    setLeads((prev) =>
      prev.map((l) => (byId.has(l.id) ? { ...l, recordId: byId.get(l.id) } : l)),
    )
  }

  function saveLead(lead: Lead) {
    const existing = leadsRef.current.find((l) => l.id === lead.id)
    setLeads((prev) =>
      existing ? prev.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...prev],
    )
    if (existing?.recordId) {
      const recordId = existing.recordId
      sync(() => leadsApi.update(recordId, lead))
    } else if (!existing) {
      sync(() => leadsApi.create([lead]).then(attachRecordIds))
    }
  }

  function updateLead(id: string, changes: Partial<Lead>) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)))
    const recordId = leadsRef.current.find((l) => l.id === id)?.recordId
    if (recordId) sync(() => leadsApi.update(recordId, changes))
  }

  function deleteLead(id: string) {
    const recordId = leadsRef.current.find((l) => l.id === id)?.recordId
    setLeads((prev) => prev.filter((l) => l.id !== id))
    if (recordId) sync(() => leadsApi.remove([recordId]))
  }

  /** מוסיף לידים מקובץ, ומדלג על מי שכבר קיים (לפי אימייל או טלפון). מחזיר כמה נוספו. */
  function importLeads(incoming: Lead[]): number {
    const key = (l: Lead) => [l.email.trim().toLowerCase(), l.phone.replace(/\D/g, '')]
    const seen = new Set(leadsRef.current.flatMap(key).filter(Boolean))
    const fresh: Lead[] = []
    for (const l of incoming) {
      const keys = key(l).filter(Boolean)
      if (keys.some((k) => seen.has(k))) continue
      keys.forEach((k) => seen.add(k))
      fresh.push(l)
    }
    setLeads((prev) => [...fresh, ...prev])
    if (fresh.length) sync(() => leadsApi.create(fresh).then(attachRecordIds))
    return fresh.length
  }

  function clearExamples() {
    const examples = leadsRef.current.filter((l) => l.id.startsWith('ex-'))
    setLeads((prev) => prev.filter((l) => !l.id.startsWith('ex-')))
    if (mode === 'local') {
      try {
        localStorage.setItem(EXAMPLES_CLEARED_KEY, '1')
      } catch {
        // אחסון חסום – הדוגמאות יחזרו אחרי רענון
      }
    }
    const recordIds = examples.flatMap((l) => (l.recordId ? [l.recordId] : []))
    if (recordIds.length) sync(() => leadsApi.remove(recordIds))
  }

  const hasExamples = leads.some((l) => l.id.startsWith('ex-'))

  return {
    leads,
    mode,
    error,
    reload,
    saveLead,
    updateLead,
    deleteLead,
    importLeads,
    clearExamples,
    hasExamples,
  }
}
