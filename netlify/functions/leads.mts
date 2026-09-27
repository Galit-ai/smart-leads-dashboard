/**
 * API של הלידים: הדאשבורד פונה ל-/api/leads, והפונקציה הזו מדברת עם Airtable.
 *
 * למה צריך אותה? כדי לגשת ל-Airtable צריך מפתח סודי (Token). אם הוא יישב בקוד של האתר,
 * כל מי שנכנס לאתר יוכל לראות אותו. הפונקציה רצה בשרת של Netlify, והמפתח נשמר שם
 * במשתני הסביבה (Environment variables) – הדפדפן אף פעם לא רואה אותו.
 *
 *   GET    /api/leads                      – כל הלידים
 *   POST   /api/leads   { leads: Lead[] }  – הוספת לידים (אחד או יותר)
 *   PATCH  /api/leads   { recordId, changes } – עדכון ליד
 *   DELETE /api/leads   { recordIds: [] }  – מחיקת לידים
 */
import type { Lead } from '../../src/types/lead'
import { fieldsToLead, leadToFields, type AirtableFields } from '../../src/shared/airtableFields'

const API_URL = process.env.AIRTABLE_API_URL ?? 'https://api.airtable.com/v0'
const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'appv7CQmSWa9z0tLU'
const TABLE_ID = process.env.AIRTABLE_TABLE_ID ?? 'tblslyrb0i4x4Vesr'
/** Airtable מקבל עד 10 רשומות בבקשה אחת של יצירה, עדכון או מחיקה */
const BATCH = 10

interface AirtableRecord {
  id: string
  fields: AirtableFields
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function airtable(path: string, init: RequestInit = {}): Promise<unknown> {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new HttpError(500, 'חסר AIRTABLE_TOKEN במשתני הסביבה של Netlify')

  const res = await fetch(`${API_URL}/${BASE_ID}/${TABLE_ID}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = (body as { error?: { message?: string } }).error?.message ?? res.statusText
    throw new HttpError(res.status === 401 || res.status === 403 ? 502 : res.status, `Airtable: ${detail}`)
  }
  return body
}

function chunks<T>(items: T[]): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += BATCH) out.push(items.slice(i, i + BATCH))
  return out
}

async function listLeads(): Promise<Lead[]> {
  const leads: Lead[] = []
  let offset: string | undefined
  // Airtable מחזיר עד 100 רשומות בכל עמוד, וממשיכים עם offset עד שנגמר
  do {
    const query = offset ? `?offset=${encodeURIComponent(offset)}` : ''
    const page = (await airtable(query)) as { records: AirtableRecord[]; offset?: string }
    leads.push(...page.records.map((r) => fieldsToLead(r.id, r.fields)))
    offset = page.offset
  } while (offset)
  return leads
}

async function createLeads(leads: Lead[]): Promise<Lead[]> {
  const created: Lead[] = []
  for (const batch of chunks(leads)) {
    const res = (await airtable('', {
      method: 'POST',
      body: JSON.stringify({ records: batch.map((l) => ({ fields: leadToFields(l) })) }),
    })) as { records: AirtableRecord[] }
    created.push(...res.records.map((r) => fieldsToLead(r.id, r.fields)))
  }
  return created
}

async function updateLead(recordId: string, changes: Partial<Lead>): Promise<Lead> {
  const res = (await airtable('', {
    method: 'PATCH',
    body: JSON.stringify({ records: [{ id: recordId, fields: leadToFields(changes) }] }),
  })) as { records: AirtableRecord[] }
  const [record] = res.records
  return fieldsToLead(record.id, record.fields)
}

async function deleteLeads(recordIds: string[]): Promise<number> {
  let deleted = 0
  for (const batch of chunks(recordIds)) {
    const query = batch.map((id) => `records[]=${encodeURIComponent(id)}`).join('&')
    const res = (await airtable(`?${query}`, { method: 'DELETE' })) as { records: unknown[] }
    deleted += res.records.length
  }
  return deleted
}

export default async (req: Request): Promise<Response> => {
  try {
    switch (req.method) {
      case 'GET':
        return Response.json({ leads: await listLeads() })

      case 'POST': {
        const { leads } = (await req.json()) as { leads?: Lead[] }
        if (!Array.isArray(leads) || leads.length === 0) throw new HttpError(400, 'חסרים לידים')
        return Response.json({ leads: await createLeads(leads) }, { status: 201 })
      }

      case 'PATCH': {
        const { recordId, changes } = (await req.json()) as {
          recordId?: string
          changes?: Partial<Lead>
        }
        if (!recordId || !changes) throw new HttpError(400, 'חסר recordId או changes')
        return Response.json({ lead: await updateLead(recordId, changes) })
      }

      case 'DELETE': {
        const { recordIds } = (await req.json()) as { recordIds?: string[] }
        if (!Array.isArray(recordIds) || recordIds.length === 0) {
          throw new HttpError(400, 'חסרים recordIds')
        }
        return Response.json({ deleted: await deleteLeads(recordIds) })
      }

      default:
        return new Response('Method not allowed', { status: 405 })
    }
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500
    const message = err instanceof Error ? err.message : 'שגיאה לא צפויה'
    console.error(message)
    return Response.json({ error: message }, { status })
  }
}

export const config = { path: '/api/leads' }
