export type LeadType = 'hotel' | 'private'

export type LeadSource =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'google'
  | 'referral'
  | 'other'

export type LeadStage = 'to_contact' | 'contacted' | 'talking' | 'won' | 'lost'

export type Gender = 'female' | 'male' | 'other' | ''

/** 1 = לא ברור, 2 = מתעניין, 3 = מתעניין מאוד */
export type Interest = 1 | 2 | 3

/** JOOLE מיועד לבני 18 ומעלה בלבד (גם לפי תנאי השימוש של החברה) */
export const MIN_AGE = 18

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
  /** לקוחות פרטיים: גיל, 0 אם לא ידוע */
  age: number
  gender: Gender
  city: string
  country: string
  /** הליד הסכים לקבל פניות (למשל מילא טופס) – חובה לפי GDPR באירופה */
  consent: boolean
  stage: LeadStage
  interest: Interest
  /** בתי מלון: מספר חדרים / יחידות (הערכה) */
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
  private: 'לקוחות פרטיים',
  hotel: 'בתי מלון',
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  facebook: 'פייסבוק',
  instagram: 'אינסטגרם',
  tiktok: 'טיקטוק',
  linkedin: 'לינקדאין',
  google: 'גוגל',
  referral: 'המלצה',
  other: 'אחר',
}

export const GENDER_LABELS: Record<Exclude<Gender, ''>, string> = {
  female: 'בת',
  male: 'בן',
  other: 'אחר',
}

export const INTEREST_LABELS: Record<Interest, string> = {
  1: 'לא ברור',
  2: 'מתעניין',
  3: 'מתעניין מאוד',
}
