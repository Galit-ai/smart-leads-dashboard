export type LeadType = 'hotel' | 'private'

export type LeadSource = 'linkedin' | 'facebook' | 'referral' | 'other'

export type LeadStage = 'to_contact' | 'contacted' | 'talking' | 'won' | 'lost'

/** 1 = לא ברור, 2 = מתעניין, 3 = מתעניין מאוד */
export type Interest = 1 | 2 | 3

export interface Lead {
  id: string
  name: string
  type: LeadType
  source: LeadSource
  /** שם המלון / החברה (לבתי מלון) */
  company: string
  /** תפקיד, למשל "מנהל רכש" */
  role: string
  phone: string
  email: string
  stage: LeadStage
  interest: Interest
  /** כמה יחידות אפשר למכור (הערכה) */
  units: number
  notes: string
  /** תאריך בפורמט YYYY-MM-DD, ריק אם עוד לא היה קשר */
  lastContact: string
  /** תאריך בפורמט YYYY-MM-DD, ריק אם לא נקבע */
  nextFollowUp: string
  createdAt: string
}

export const STAGES: { id: LeadStage; label: string }[] = [
  { id: 'to_contact', label: 'לפנות' },
  { id: 'contacted', label: 'פניתי' },
  { id: 'talking', label: 'בשיחה' },
  { id: 'won', label: 'נסגר 🎉' },
  { id: 'lost', label: 'לא רלוונטי' },
]

export const TYPE_LABELS: Record<LeadType, string> = {
  hotel: 'בית מלון',
  private: 'לקוח פרטי',
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  linkedin: 'לינקדאין',
  facebook: 'פייסבוק',
  referral: 'המלצה',
  other: 'אחר',
}

export const INTEREST_LABELS: Record<Interest, string> = {
  1: 'לא ברור',
  2: 'מתעניין',
  3: 'מתעניין מאוד',
}
