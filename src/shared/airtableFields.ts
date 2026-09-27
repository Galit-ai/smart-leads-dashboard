/**
 * המרה בין ליד בדאשבורד לבין רשומה בטבלה "לידים JOOLE" ב-Airtable.
 * משמש גם את ה-Netlify Function (בשרת) וגם את סקריפט הזריעה, ולכן אין פה קוד של דפדפן.
 *
 * ב-Airtable השדות והבחירות בעברית (כדי שיהיה נוח לעבוד ישירות בטבלה),
 * ובקוד הערכים באנגלית – הטבלאות למטה מתרגמות בין השניים.
 */
import type { Gender, Interest, Lead, LeadSource, LeadStage, LeadType } from '../types/lead'

/** שמות העמודות בטבלה ב-Airtable */
export const F = {
  name: 'שם',
  id: 'מזהה ליד',
  type: 'סוג',
  source: 'מקור',
  stage: 'שלב',
  company: 'מלון / חברה',
  role: 'תפקיד',
  phone: 'טלפון',
  email: 'אימייל',
  age: 'גיל',
  gender: 'מין',
  city: 'עיר',
  country: 'מדינה',
  referredBy: 'מי המליץ',
  consent: 'הסכמה לפנייה',
  interest: 'רמת עניין',
  units: 'מספר חדרים',
  notes: 'הערות',
  lastContact: 'קשר אחרון',
  nextFollowUp: 'לחזור בתאריך',
  createdAt: 'נוצר ב',
} as const

const TYPE: Record<LeadType, string> = { private: 'לקוח פרטי', hotel: 'בית מלון' }
const SOURCE: Record<LeadSource, string> = {
  facebook: 'פייסבוק',
  instagram: 'אינסטגרם',
  tiktok: 'טיקטוק',
  linkedin: 'לינקדאין',
  google: 'גוגל',
  referral: 'המלצה',
  other: 'אחר',
}
const STAGE: Record<LeadStage, string> = {
  to_contact: 'לפנות',
  contacted: 'פניתי',
  talking: 'בשיחה',
  won: 'נסגר',
  lost: 'לא רלוונטי',
}
const GENDER: Record<Exclude<Gender, ''>, string> = { female: 'בת', male: 'בן', other: 'אחר' }
const INTEREST: Record<Interest, string> = { 1: 'לא ברור', 2: 'מתעניין', 3: 'מתעניין מאוד' }

/** מחפש את המפתח לפי הערך בעברית (למשל "בשיחה" → "talking") */
function reverse<K extends string>(map: Record<K, string>, value: unknown): K | undefined {
  return (Object.keys(map) as K[]).find((k) => map[k] === value)
}

export type AirtableFields = Record<string, unknown>

/** ליד (או חלק ממנו) → שדות של Airtable. מעביר רק את השדות שקיימים באובייקט. */
export function leadToFields(lead: Partial<Lead>): AirtableFields {
  const f: AirtableFields = {}
  const text = (key: keyof typeof F, v: string | undefined) => {
    if (v !== undefined) f[F[key]] = v
  }
  const date = (key: keyof typeof F, v: string | undefined) => {
    if (v !== undefined) f[F[key]] = v || null // Airtable לא מקבל מחרוזת ריקה בשדה תאריך
  }

  text('name', lead.name)
  text('id', lead.id)
  if (lead.type) f[F.type] = TYPE[lead.type]
  if (lead.source) f[F.source] = SOURCE[lead.source]
  if (lead.stage) f[F.stage] = STAGE[lead.stage]
  text('company', lead.company)
  text('role', lead.role)
  text('phone', lead.phone)
  text('email', lead.email)
  if (lead.age !== undefined) f[F.age] = lead.age || null
  if (lead.gender !== undefined) f[F.gender] = lead.gender ? GENDER[lead.gender] : null
  text('city', lead.city)
  text('country', lead.country)
  text('referredBy', lead.referredBy)
  if (lead.consent !== undefined) f[F.consent] = lead.consent
  if (lead.interest !== undefined) f[F.interest] = INTEREST[lead.interest]
  if (lead.units !== undefined) f[F.units] = lead.units || null
  text('notes', lead.notes)
  date('lastContact', lead.lastContact)
  date('nextFollowUp', lead.nextFollowUp)
  date('createdAt', lead.createdAt)
  return f
}

/** רשומה מ-Airtable → ליד. שדות ריקים מקבלים ערך ברירת מחדל. */
export function fieldsToLead(recordId: string, f: AirtableFields): Lead {
  const str = (key: keyof typeof F) => (typeof f[F[key]] === 'string' ? (f[F[key]] as string) : '')
  const num = (key: keyof typeof F) => (typeof f[F[key]] === 'number' ? (f[F[key]] as number) : 0)
  const type = reverse(TYPE, f[F.type]) ?? 'private'

  return {
    recordId,
    // רשומה שנוספה ישירות ב-Airtable אין לה מזהה ליד – משתמשים במזהה של Airtable
    id: str('id') || recordId,
    name: str('name'),
    type,
    source: reverse(SOURCE, f[F.source]) ?? 'other',
    stage: reverse(STAGE, f[F.stage]) ?? 'to_contact',
    company: str('company'),
    role: str('role'),
    phone: str('phone'),
    email: str('email'),
    age: num('age'),
    gender: reverse(GENDER, f[F.gender]) ?? '',
    city: str('city'),
    country: str('country'),
    referredBy: str('referredBy'),
    consent: f[F.consent] === true,
    interest: (Number(reverse(INTEREST as Record<string, string>, f[F.interest])) || 2) as Interest,
    units: num('units'),
    notes: str('notes'),
    lastContact: str('lastContact'),
    nextFollowUp: str('nextFollowUp'),
    createdAt: str('createdAt'),
  }
}
