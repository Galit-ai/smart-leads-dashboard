import { useEffect, useState } from 'react'
import type { Lead } from '../types/lead'
import { normalizeLead } from './emptyLead'
import { exampleLeads } from './exampleLeads'

const STORAGE_KEY = 'smart-leads-dashboard:leads'

function load(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return (JSON.parse(raw) as Partial<Lead>[]).map(normalizeLead)
  } catch {
    // אחסון חסום או נתונים פגומים – מתחילים מהדוגמאות
  }
  return exampleLeads()
}

/**
 * הלידים נשמרים בדפדפן (localStorage), כך שהם נשארים גם אחרי רענון.
 * שימי לב: הם שמורים רק בדפדפן הזה ובמחשב הזה.
 */
export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
    } catch {
      // אין מה לעשות אם האחסון חסום; הנתונים יישארו עד רענון
    }
  }, [leads])

  function saveLead(lead: Lead) {
    setLeads((prev) =>
      prev.some((l) => l.id === lead.id)
        ? prev.map((l) => (l.id === lead.id ? lead : l))
        : [lead, ...prev],
    )
  }

  function updateLead(id: string, changes: Partial<Lead>) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)))
  }

  function deleteLead(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  /** מוסיף לידים מקובץ, ומדלג על מי שכבר קיים (לפי אימייל או טלפון). מחזיר כמה נוספו. */
  function importLeads(incoming: Lead[]): number {
    const key = (l: Lead) => [l.email.trim().toLowerCase(), l.phone.replace(/\D/g, '')]
    const seen = new Set(leads.flatMap(key).filter(Boolean))
    const fresh: Lead[] = []
    for (const l of incoming) {
      const keys = key(l).filter(Boolean)
      if (keys.some((k) => seen.has(k))) continue
      keys.forEach((k) => seen.add(k))
      fresh.push(l)
    }
    setLeads((prev) => [...fresh, ...prev])
    return fresh.length
  }

  function clearExamples() {
    setLeads((prev) => prev.filter((l) => !l.id.startsWith('ex-')))
  }

  const hasExamples = leads.some((l) => l.id.startsWith('ex-'))

  return { leads, saveLead, updateLead, deleteLead, importLeads, clearExamples, hasExamples }
}
