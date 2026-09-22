import type { Lead } from '../types/lead'
import { daysBetween, today } from './dates'

export type Temperature = 'hot' | 'warm' | 'cold'

export const TEMPERATURE_LABELS: Record<Temperature, string> = {
  hot: '🔥 חם',
  warm: '☀️ פושר',
  cold: '❄️ קר',
}

/** אחרי כמה ימים בלי קשר צריך לחזור לליד, לפי השלב */
const FOLLOW_UP_AFTER_DAYS: Partial<Record<Lead['stage'], number>> = {
  contacted: 4,
  talking: 3,
}

/**
 * ציון 0–100: כמה כדאי להשקיע בליד עכשיו.
 * בית מלון שווה יותר מלקוח פרטי, התעניינות ושלב מתקדם מעלים,
 * וליד שלא דיברנו איתו הרבה זמן מתקרר.
 */
export function leadScore(lead: Lead, now = today()): number {
  if (lead.stage === 'won' || lead.stage === 'lost') return 0

  let score = lead.type === 'hotel' ? 30 : 10
  score += (lead.interest - 1) * 15
  if (lead.stage === 'talking') score += 20
  if (lead.stage === 'contacted') score += 5
  if (lead.source === 'referral') score += 10
  score += Math.min(lead.units, 50) / 5

  if (lead.lastContact) {
    const silentDays = daysBetween(lead.lastContact, now)
    if (silentDays > 14) score -= 15
    else if (silentDays > 7) score -= 5
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function temperature(score: number): Temperature {
  if (score >= 55) return 'hot'
  if (score >= 30) return 'warm'
  return 'cold'
}

export interface FollowUp {
  lead: Lead
  reason: string
  /** כמה ימים באיחור (0 = היום) */
  overdueDays: number
}

/** מי צריך לקבל ממך הודעה היום, ולמה */
export function followUpFor(lead: Lead, now = today()): FollowUp | null {
  if (lead.stage === 'won' || lead.stage === 'lost') return null

  if (lead.nextFollowUp) {
    const overdue = daysBetween(lead.nextFollowUp, now)
    if (overdue >= 0) {
      return {
        lead,
        reason: overdue === 0 ? 'קבעת לחזור אליו היום' : `קבעת לחזור לפני ${overdue} ימים`,
        overdueDays: overdue,
      }
    }
    return null
  }

  if (lead.stage === 'to_contact') {
    return { lead, reason: 'עוד לא פנית', overdueDays: 0 }
  }

  const limit = FOLLOW_UP_AFTER_DAYS[lead.stage]
  if (limit && lead.lastContact) {
    const silentDays = daysBetween(lead.lastContact, now)
    if (silentDays >= limit) {
      return { lead, reason: `אין קשר כבר ${silentDays} ימים`, overdueDays: silentDays - limit }
    }
  }
  return null
}

/** רשימת "למי לפנות היום", הכי דחוף וחם ראשון */
export function todaysFollowUps(leads: Lead[], now = today()): FollowUp[] {
  return leads
    .map((l) => followUpFor(l, now))
    .filter((f): f is FollowUp => f !== null)
    .sort(
      (a, b) =>
        leadScore(b.lead, now) - leadScore(a.lead, now) || b.overdueDays - a.overdueDays,
    )
}
