import type { Lead } from '../types/lead'
import { today } from '../utils/dates'

export function emptyLead(): Lead {
  return {
    id: crypto.randomUUID(),
    name: '',
    type: 'hotel',
    source: 'linkedin',
    company: '',
    role: '',
    phone: '',
    email: '',
    stage: 'to_contact',
    interest: 2,
    units: 0,
    notes: '',
    lastContact: '',
    nextFollowUp: '',
    createdAt: today(),
  }
}
