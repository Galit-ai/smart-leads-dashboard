import { emptyLead } from '../data/emptyLead'
import type { Gender, Lead, LeadSource, LeadType } from '../types/lead'
import { MIN_AGE } from '../types/lead'
import { today } from './dates'

/**
 * קורא קובץ CSV שהורד מטופס לידים (פייסבוק/אינסטגרם, טיקטוק, לינקדאין, גוגל).
 * פייסבוק מוריד לרוב קובץ UTF-16 מופרד בטאבים, השאר UTF-8 עם פסיקים – שניהם נתמכים.
 */
export async function readSpreadsheetFile(file: File): Promise<string[][]> {
  const buf = new Uint8Array(await file.arrayBuffer())
  let text: string
  if (buf[0] === 0xff && buf[1] === 0xfe) text = new TextDecoder('utf-16le').decode(buf)
  else if (buf[0] === 0xfe && buf[1] === 0xff) text = new TextDecoder('utf-16be').decode(buf)
  else text = new TextDecoder('utf-8').decode(buf)
  return parseDelimited(text.replace(/^\uFEFF/, ''))
}

export function parseDelimited(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const delimiter = ['\t', ';', ','].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best,
  )

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === delimiter) {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((v) => v.trim()))
}

/** שמות עמודות אפשריים (אנגלית, גרמנית, עברית) לכל שדה */
const COLUMNS = {
  name: ['full_name', 'full name', 'name', 'vollständiger name', 'שם', 'שם מלא'],
  firstName: ['first_name', 'first name', 'vorname', 'שם פרטי'],
  lastName: ['last_name', 'last name', 'nachname', 'שם משפחה'],
  email: ['email', 'e-mail', 'email address', 'אימייל', 'מייל'],
  phone: ['phone_number', 'phone', 'phone number', 'telefon', 'telefonnummer', 'טלפון'],
  city: ['city', 'stadt', 'עיר'],
  country: ['country', 'land', 'מדינה'],
  age: ['age', 'alter', 'גיל'],
  birth: ['date_of_birth', 'date of birth', 'birthday', 'dob', 'geburtsdatum', 'תאריך לידה'],
  gender: ['gender', 'geschlecht', 'מין'],
  platform: ['platform', 'source', 'פלטפורמה', 'מקור'],
  company: ['company_name', 'company', 'hotel', 'firma', 'מלון', 'חברה'],
  role: ['job_title', 'job title', 'position', 'תפקיד'],
} as const

function parseGender(v: string): Gender {
  const s = v.trim().toLowerCase()
  if (['female', 'f', 'w', 'weiblich', 'woman', 'אישה', 'נקבה', 'בת'].includes(s)) return 'female'
  if (['male', 'm', 'männlich', 'man', 'גבר', 'זכר', 'בן'].includes(s)) return 'male'
  return s ? 'other' : ''
}

function parsePlatform(v: string): LeadSource | null {
  const s = v.trim().toLowerCase()
  if (s === 'fb' || s.includes('facebook')) return 'facebook'
  if (s === 'ig' || s.includes('instagram')) return 'instagram'
  if (s.includes('tiktok')) return 'tiktok'
  if (s.includes('linkedin')) return 'linkedin'
  if (s.includes('google')) return 'google'
  return null
}

function ageFromBirthDate(v: string): number {
  // תומך ב-YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY, MM/DD/YYYY (פייסבוק)
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  const dotted = v.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/)
  let y: number, m: number, d: number
  if (iso) [y, m, d] = [+iso[1], +iso[2], +iso[3]]
  else if (dotted) {
    ;[d, m, y] = [+dotted[1], +dotted[2], +dotted[3]]
    if (m > 12) [d, m] = [m, d]
  } else return 0
  const [ty, tm, td] = today().split('-').map(Number)
  return ty - y - (tm < m || (tm === m && td < d) ? 1 : 0)
}

export interface ImportResult {
  leads: Lead[]
  /** שורות שדולגו כי הגיל מתחת ל-18 */
  underage: number
  /** שורות בלי שם, אימייל או טלפון */
  empty: number
  /** עמודות שזוהו, להצגה למשתמשת */
  recognized: string[]
}

export function rowsToLeads(rows: string[][], type: LeadType, defaultSource: LeadSource): ImportResult {
  const [header = [], ...data] = rows
  const cols = header.map((h) => h.trim().toLowerCase())
  const idx = Object.fromEntries(
    Object.entries(COLUMNS).map(([field, names]) => [
      field,
      cols.findIndex((c) => (names as readonly string[]).includes(c)),
    ]),
  ) as Record<keyof typeof COLUMNS, number>
  const get = (row: string[], field: keyof typeof COLUMNS) =>
    idx[field] >= 0 ? (row[idx[field]] ?? '').trim() : ''

  const result: ImportResult = {
    leads: [],
    underage: 0,
    empty: 0,
    recognized: Object.entries(idx)
      .filter(([, i]) => i >= 0)
      .map(([f]) => f),
  }

  for (const row of data) {
    const name =
      get(row, 'name') || [get(row, 'firstName'), get(row, 'lastName')].filter(Boolean).join(' ')
    const email = get(row, 'email')
    const phone = get(row, 'phone').replace(/^p:/, '') // פייסבוק מוסיף "p:" לטלפון
    if (!name && !email && !phone) {
      result.empty++
      continue
    }

    const age = Number(get(row, 'age')) || ageFromBirthDate(get(row, 'birth'))
    if (age > 0 && age < MIN_AGE) {
      result.underage++
      continue
    }

    result.leads.push({
      ...emptyLead(type),
      name: name || email || phone,
      email,
      phone,
      age,
      gender: parseGender(get(row, 'gender')),
      city: get(row, 'city'),
      country: get(row, 'country') || (type === 'private' ? 'גרמניה' : ''),
      company: get(row, 'company'),
      role: get(row, 'role'),
      source: parsePlatform(get(row, 'platform')) ?? defaultSource,
      // מי שמילא טופס לידים השאיר פרטים כדי שיחזרו אליו
      consent: true,
      notes: 'יובא מקובץ טופס לידים',
    })
  }
  return result
}
