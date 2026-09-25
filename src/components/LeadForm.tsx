import type { ReactNode } from 'react'
import { useState } from 'react'
import type { Gender, Interest, Lead, LeadSource, LeadStage, LeadType } from '../types/lead'
import {
  GENDER_LABELS,
  INTEREST_LABELS,
  MIN_AGE,
  SOURCE_LABELS,
  STAGES,
  TYPE_LABELS,
} from '../types/lead'
import { Modal } from './ui'

interface Props {
  initial: Lead
  isNew: boolean
  onSave: (lead: Lead) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const input =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-violet-400 focus:outline-none'

export function LeadForm({ initial, isNew, onSave, onDelete, onClose }: Props) {
  const [lead, setLead] = useState(initial)
  const set = <K extends keyof Lead>(key: K, value: Lead[K]) =>
    setLead((prev) => ({ ...prev, [key]: value }))
  const underage = lead.type === 'private' && lead.age > 0 && lead.age < MIN_AGE

  return (
    <Modal title={isNew ? 'ליד חדש' : lead.name || 'עריכת ליד'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (underage) return
          onSave({ ...lead, name: lead.name.trim() })
        }}
        className="grid grid-cols-2 gap-3 text-sm"
      >
        <Field label="שם *" wide>
          <input
            required
            autoFocus
            className={input}
            value={lead.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>

        <Field label="סוג לקוח">
          <select
            className={input}
            value={lead.type}
            onChange={(e) => set('type', e.target.value as LeadType)}
          >
            {Object.entries(TYPE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="מאיפה מכירים">
          <select
            className={input}
            value={lead.source}
            onChange={(e) => set('source', e.target.value as LeadSource)}
          >
            {Object.entries(SOURCE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        {lead.type === 'hotel' && (
          <>
            <Field label="שם המלון">
              <input
                className={input}
                value={lead.company}
                onChange={(e) => set('company', e.target.value)}
              />
            </Field>
            <Field label="תפקיד">
              <input
                className={input}
                value={lead.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="למשל: מנהל רכש"
              />
            </Field>
            <Field label="מספר חדרים (הערכה)" wide>
              <input
                className={input}
                type="number"
                min={0}
                value={lead.units}
                onChange={(e) => set('units', Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>
          </>
        )}

        {lead.type === 'private' && (
          <>
            <Field label="גיל">
              <input
                className={`${input} ${underage ? 'border-rose-400' : ''}`}
                type="number"
                min={MIN_AGE}
                value={lead.age || ''}
                onChange={(e) => set('age', Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>
            <Field label="מין">
              <select
                className={input}
                value={lead.gender}
                onChange={(e) => set('gender', e.target.value as Gender)}
              >
                <option value="">לא ידוע</option>
                {Object.entries(GENDER_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            {underage && (
              <p className="col-span-2 -mt-1 text-rose-600">
                JOOLE מיועד לבני {MIN_AGE} ומעלה בלבד. אי אפשר לשמור ליד מתחת לגיל הזה.
              </p>
            )}
            <Field label="עיר">
              <input
                className={input}
                value={lead.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </Field>
            <Field label="מדינה">
              <input
                className={input}
                value={lead.country}
                onChange={(e) => set('country', e.target.value)}
              />
            </Field>
            <label className="col-span-2 flex items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={lead.consent}
                onChange={(e) => set('consent', e.target.checked)}
              />
              הסכים/ה לקבל ממני פניות (מילא/ה טופס או פנה/תה אליי)
            </label>
          </>
        )}

        <Field label="טלפון">
          <input
            className={input}
            dir="ltr"
            value={lead.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </Field>
        <Field label="אימייל">
          <input
            className={input}
            dir="ltr"
            type="email"
            value={lead.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field label="שלב">
          <select
            className={input}
            value={lead.stage}
            onChange={(e) => set('stage', e.target.value as LeadStage)}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="רמת עניין">
          <select
            className={input}
            value={lead.interest}
            onChange={(e) => set('interest', Number(e.target.value) as Interest)}
          >
            {([1, 2, 3] as const).map((i) => (
              <option key={i} value={i}>
                {INTEREST_LABELS[i]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="קשר אחרון" wide>
          <input
            className={input}
            type="date"
            value={lead.lastContact}
            onChange={(e) => set('lastContact', e.target.value)}
          />
        </Field>

        <Field label="לחזור אליו בתאריך" wide>
          <input
            className={input}
            type="date"
            value={lead.nextFollowUp}
            onChange={(e) => set('nextFollowUp', e.target.value)}
          />
        </Field>

        <Field label="הערות" wide>
          <textarea
            className={`${input} min-h-20`}
            value={lead.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </Field>

        <div className="col-span-2 mt-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={underage}
            className="disabled:opacity-40 rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
          >
            שמירה
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100"
          >
            ביטול
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`למחוק את ${lead.name}?`)) onDelete(lead.id)
              }}
              className="ms-auto rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50"
            >
              מחיקה
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

function Field({
  label,
  wide,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1 ${wide ? 'col-span-2' : ''}`}>
      <span className="text-slate-600">{label}</span>
      {children}
    </label>
  )
}
