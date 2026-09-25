import { useState } from 'react'
import type { Lead, LeadSource } from '../types/lead'
import { SOURCE_LABELS } from '../types/lead'

/** פרופיל קהל היעד של הלקוחות הפרטיים, והגדרות מומלצות לקמפיינים */
const PROFILE = [
  { label: 'גיל', value: '18–21' },
  { label: 'מדינה', value: 'גרמניה' },
  { label: 'מין', value: 'בנים ובנות' },
  { label: 'רמה סוציו-אקונומית', value: 'ממוצעת ומעלה' },
]

const INTERESTS = [
  'מסיבות, פסטיבלים וחיי לילה',
  'דייטינג, זוגיות ויחסים',
  'טיפוח, אופנה וסטייל',
  'מתנות מיוחדות וייחודיות',
]

const PLATFORM_TIPS: { source: LeadSource; tip: string }[] = [
  {
    source: 'instagram',
    tip: 'הערוץ המרכזי לגיל הזה. מודעת טופס לידים (Lead Ads) עם טירגוט 18–21 בגרמניה ותחומי העניין שלמעלה.',
  },
  {
    source: 'facebook',
    tip: 'אותו מנהל מודעות כמו אינסטגרם. פחות פעיל בגיל הזה, אבל זול יותר ללידים.',
  },
  {
    source: 'tiktok',
    tip: 'חזק מאוד בגיל הזה, אבל מגביל פרסום של מוצרים מהתחום. כדאי לבדוק את המדיניות, ואולי להתחיל בתוכן אורגני או משפיענים.',
  },
  {
    source: 'google',
    tip: 'מתאים לתפוס מי שכבר מחפש "מתנה מיוחדת" (Geschenkidee). מודעות חיפוש עם טופס לידים.',
  },
]

export function AudiencePanel({ leads }: { leads: Lead[] }) {
  const [open, setOpen] = useState(false)

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.source] = (acc[l.source] ?? 0) + 1
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])
  const female = leads.filter((l) => l.gender === 'female').length
  const male = leads.filter((l) => l.gender === 'male').length
  const ages = leads.map((l) => l.age).filter((a) => a > 0)
  const avgAge = ages.length ? (ages.reduce((s, a) => s + a, 0) / ages.length).toFixed(1) : '—'

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800">קהל היעד</h2>
          <p className="text-sm text-slate-500">
            {PROFILE.map((p) => p.value).join(' · ')}
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          {open ? 'הסתרה' : 'פרטים והמלצות לקמפיין'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {bySource.map(([source, count]) => (
          <span key={source} className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">
            {SOURCE_LABELS[source as LeadSource]}: {count}
          </span>
        ))}
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
          בנות {female} · בנים {male}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">גיל ממוצע {avgAge}</span>
      </div>

      {open && (
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <h3 className="mb-1 font-bold text-slate-700">תחומי עניין לטירגוט</h3>
            <ul className="list-inside list-disc text-slate-600">
              {INTERESTS.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="mt-2 text-slate-500">
              את הרמה הסוציו-אקונומית אי אפשר לבחור ישירות ברשתות. מתקרבים אליה דרך תחומי עניין
              כמו מותגי אופנה, טיולים ופסטיבלים.
            </p>
            <p className="mt-2 font-medium text-amber-700">
              גיל מינימום 18 בכל קמפיין. JOOLE הוא מוצר למבוגרים בלבד, והרשתות מחייבות את זה.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-bold text-slate-700">לפי פלטפורמה</h3>
            <ul className="flex flex-col gap-2 text-slate-600">
              {PLATFORM_TIPS.map((p) => (
                <li key={p.source}>
                  <span className="font-medium text-slate-700">{SOURCE_LABELS[p.source]}:</span>{' '}
                  {p.tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
