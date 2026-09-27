import type { Lead } from '../types/lead'

/** הכתובת של ה-Netlify Function שמדברת עם Airtable (netlify/functions/leads.mts) */
const API = '/api/leads'

async function request<T>(method: string, body?: unknown): Promise<T> {
  const res = await fetch(API, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || data === null) {
    throw new Error((data as { error?: string } | null)?.error ?? `שגיאת שרת (${res.status})`)
  }
  return data as T
}

export const leadsApi = {
  list: () => request<{ leads: Lead[] }>('GET').then((r) => r.leads),
  create: (leads: Lead[]) => request<{ leads: Lead[] }>('POST', { leads }).then((r) => r.leads),
  update: (recordId: string, changes: Partial<Lead>) =>
    request<{ lead: Lead }>('PATCH', { recordId, changes }).then((r) => r.lead),
  remove: (recordIds: string[]) => request<{ deleted: number }>('DELETE', { recordIds }),
}
