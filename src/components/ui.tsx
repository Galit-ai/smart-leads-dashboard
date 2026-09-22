import type { ReactNode } from 'react'
import type { Temperature } from '../utils/smart'
import { TEMPERATURE_LABELS } from '../utils/smart'

const TEMP_CLASSES: Record<Temperature, string> = {
  hot: 'bg-rose-100 text-rose-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-sky-100 text-sky-700',
}

export function TempBadge({ temp, score }: { temp: Temperature; score: number }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${TEMP_CLASSES[temp]}`}
      title={`ציון ${score} מתוך 100`}
    >
      {TEMPERATURE_LABELS[temp]}
    </span>
  )
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
      {children}
    </span>
  )
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="mt-8 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 text-2xl leading-none text-slate-400 hover:text-slate-700"
            aria-label="סגירה"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
