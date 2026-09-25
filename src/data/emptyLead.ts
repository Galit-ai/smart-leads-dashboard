import type { Lead, LeadType } from '../types/lead'
import { today } from '../utils/dates'

export function emptyLead(type: LeadType = 'private'): Lead {
  return {
    id: crypto.randomUUID(),
    name: '',
    type,
    source: type === 'hotel' ? 'linkedin' : 'instagram',
    company: '',
    role: '',
    phone: '',
    email: '',
    age: 0,
    gender: '',
    city: '',
    country: type === 'private' ? 'גרמניה' : '',
    consent: false,
    stage: 'to_contact',
    interest: 2,
    units: 0,
    notes: '',
    lastContact: '',
    nextFollowUp: '',
    createdAt: today(),
  }
}

/** משלים שדות חסרים בלידים שנשמרו בגרסה קודמת של הדאשבורד */
export function normalizeLead(raw: Partial<Lead>): Lead {
  return { ...emptyLead(raw.type ?? 'private'), ...raw } as Lead
}
