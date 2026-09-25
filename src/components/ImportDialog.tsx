import { useState } from 'react'
import type { LeadSource, LeadType } from '../types/lead'
import { MIN_AGE, SOURCE_LABELS, TYPE_LABELS } from '../types/lead'
import type { ImportResult } from '../utils/importCsv'
import { readSpreadsheetFile, rowsToLeads } from '../utils/importCsv'
import { Modal } from './ui'

interface Props {
  type: LeadType
  onImport: (result: ImportResult) => number
  onClose: () => void
}

const input =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-violet-400 focus:outline-none'

export function ImportDialog({ type, onImport, onClose }: Props) {
  const [source, setSource] = useState<LeadSource>(type === 'hotel' ? 'linkedin' : 'facebook')
  const [rows, setRows] = useState<string[][] | null>(null)
  const [fileName, setFileName] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState<number | null>(null)

  const preview = rows ? rowsToLeads(rows, type, source) : null

  async function pickFile(file: File | undefined) {
    if (!file) return
    setError('')
    setAdded(null)
    try {
      const parsed = await readSpreadsheetFile(file)
      if (parsed.length < 2) throw new Error('empty')
      setRows(parsed)
      setFileName(file.name)
    } catch {
      setRows(null)
      setError('לא הצלחתי לקרוא את הקובץ. צריך קובץ CSV (בגוגל שיטס / אקסל: "הורדה בתור CSV").')
    }
  }

  return (
    <Modal title={`ייבוא לידים – ${TYPE_LABELS[type]}`} onClose={onClose}>
      {added !== null ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-slate-700">
            ✓ נוספו {added} לידים חדשים.
            {preview && preview.leads.length > added &&
              ` ${preview.leads.length - added} כבר היו ברשימה ולא נוספו שוב.`}
          </p>
          <button
            onClick={onClose}
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
          >
            סגירה
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-slate-600">
            מורידים את הלידים מטופס הלידים של הקמפיין (פייסבוק/אינסטגרם, טיקטוק, לינקדאין או
            גוגל) כקובץ CSV, ומעלים אותו כאן.
          </p>

          <label className="flex flex-col gap-1">
            <span className="text-slate-600">מאיפה הלידים (אם זה לא כתוב בקובץ)</span>
            <select
              className={input}
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
            >
              {Object.entries(SOURCE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-slate-600">קובץ</span>
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv"
              onChange={(e) => pickFile(e.target.files?.[0])}
              className="text-slate-700 file:me-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-violet-700"
            />
          </label>

          {error && <p className="text-rose-600">{error}</p>}

          {preview && (
            <div className="rounded-lg bg-slate-50 p-3 text-slate-700">
              <div className="font-medium">{fileName}</div>
              <div>נמצאו {preview.leads.length} לידים לייבוא.</div>
              {preview.underage > 0 && (
                <div className="text-amber-700">
                  {preview.underage === 1 ? 'שורה אחת דולגה' : `${preview.underage} שורות דולגו`}{' '}
                  כי הגיל מתחת ל-{MIN_AGE}.
                </div>
              )}
              {preview.empty > 0 && (
                <div className="text-slate-500">{preview.empty === 1 ? 'שורה ריקה אחת דולגה' : `${preview.empty} שורות ריקות דולגו`}.</div>
              )}
              {preview.leads.length > 0 && (
                <div className="mt-1 text-slate-500">
                  לדוגמה: {preview.leads.slice(0, 3).map((l) => l.name).join(', ')}
                </div>
              )}
            </div>
          )}

          <label className="flex items-start gap-2 text-slate-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              האנשים בקובץ מילאו טופס והסכימו שיחזרו אליהם. (באירופה אסור לפנות למי שלא הסכים –
              GDPR)
            </span>
          </label>

          <div className="flex gap-2">
            <button
              disabled={!preview || preview.leads.length === 0 || !consent}
              onClick={() => preview && setAdded(onImport(preview))}
              className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ייבוא
            </button>
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">
              ביטול
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
