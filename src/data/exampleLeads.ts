import type { Lead } from '../types/lead'
import { addDays, today } from '../utils/dates'
import { emptyLead } from './emptyLead'

/** לידים לדוגמה, כדי לראות איך הדאשבורד נראה. אפשר למחוק אותם בלחיצה. */
export function exampleLeads(): Lead[] {
  const t = today()
  const ex = (id: string, fields: Partial<Lead>): Lead => ({
    ...emptyLead(fields.type),
    ...fields,
    id: `ex-${id}`,
  })

  return [
    // לקוחות פרטיים – גרמניה, 18–21
    ex('p1', {
      name: 'Lena (דוגמה)',
      type: 'private',
      source: 'instagram',
      age: 20,
      gender: 'female',
      city: 'ברלין',
      consent: true,
      stage: 'talking',
      interest: 3,
      lastContact: addDays(t, -3),
      notes: 'מחפשת מתנה ליום הולדת של בן הזוג',
    }),
    ex('p2', {
      name: 'Jonas (דוגמה)',
      type: 'private',
      source: 'tiktok',
      age: 19,
      gender: 'male',
      city: 'מינכן',
      consent: true,
      stage: 'to_contact',
      interest: 2,
      notes: 'השאיר פרטים בטופס של הקמפיין',
    }),
    ex('p3', {
      name: 'Mia (דוגמה)',
      type: 'private',
      source: 'facebook',
      age: 21,
      gender: 'female',
      city: 'המבורג',
      consent: true,
      stage: 'contacted',
      interest: 2,
      lastContact: addDays(t, -5),
    }),
    ex('p4', {
      name: 'Leon (דוגמה)',
      type: 'private',
      source: 'google',
      age: 18,
      gender: 'male',
      city: 'קלן',
      consent: true,
      stage: 'won',
      interest: 3,
      lastContact: addDays(t, -8),
    }),

    // בתי מלון
    ex('h1', {
      name: 'דנה (דוגמה)',
      type: 'hotel',
      source: 'linkedin',
      company: 'מלון לדוגמה בתל אביב',
      role: 'מנהלת חדרים',
      stage: 'talking',
      interest: 3,
      units: 40,
      lastContact: addDays(t, -4),
      notes: 'ביקשה הצעת מחיר לכל הקומה החמישית',
    }),
    ex('h2', {
      name: 'יוסי (דוגמה)',
      type: 'hotel',
      source: 'linkedin',
      company: 'מלון בוטיק לדוגמה',
      role: 'מנהל רכש',
      stage: 'contacted',
      interest: 2,
      units: 15,
      lastContact: addDays(t, -6),
    }),
    ex('h3', {
      name: 'רון (דוגמה)',
      type: 'hotel',
      source: 'referral',
      company: 'מלון לדוגמה באילת',
      role: 'מנכ"ל',
      stage: 'to_contact',
      interest: 1,
      units: 25,
      notes: 'המלצה של דנה',
    }),
  ]
}
