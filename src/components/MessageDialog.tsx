import { useState } from 'react'
import type { Lead } from '../types/lead'
import type { Lang } from '../utils/messages'
import { LANG_LABELS, defaultLang, draftMessage } from '../utils/messages'
import { Modal } from './ui'

interface Props {
  lead: Lead
  onContacted: (lead: Lead) => void
  onClose: () => void
}

export function MessageDialog({ lead, onContacted, onClose }: Props) {
  const [lang, setLang] = useState<Lang>(() => defaultLang(lead))
  const [text, setText] = useState(() => draftMessage(lead, lang))
  const [copied, setCopied] = useState(false)

  const phone = whatsappNumber(lead.phone, lead.country)

  function changeLang(next: Lang) {
    setLang(next)
    setText(draftMessage(lead, next))
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // הדפדפן חסם גישה ללוח – אפשר לסמן ולהעתיק ידנית
    }
  }

  return (
    <Modal title={`הודעה ל${lead.name}`} onClose={onClose}>
      <p className="mb-2 text-sm text-slate-500">
        טיוטה לפי סוג הלקוח והשלב. כדאי להוסיף משפט אישי לפני ששולחים.
      </p>
      <div className="mb-2 flex gap-1">
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => changeLang(l)}
            className={`rounded-lg px-3 py-1 text-sm ${
              l === lang ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>
      <textarea
        className="min-h-44 w-full rounded-lg border border-slate-200 p-3 text-slate-800 focus:border-violet-400 focus:outline-none"
        dir={lang === 'he' ? 'rtl' : 'ltr'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={copy}
          className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
        >
          {copied ? '✓ הועתק' : '📋 העתקה'}
        </button>
        {phone && (
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
          >
            שליחה בוואטסאפ
          </a>
        )}
        <button
          onClick={() => {
            onContacted(lead)
            onClose()
          }}
          className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
        >
          ✓ שלחתי, לסמן שפניתי
        </button>
      </div>
    </Modal>
  )
}

/** מספר בפורמט בינלאומי לוואטסאפ. מספר מקומי (מתחיל ב-0) מקבל קידומת לפי המדינה. */
function whatsappNumber(phone: string, country: string): string {
  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return ''
  if (trimmed.startsWith('+')) return digits
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('0')) {
    if (/גרמניה|germany|deutschland/i.test(country)) return `49${digits.slice(1)}`
    if (/ישראל|israel/i.test(country) || !country) return `972${digits.slice(1)}`
  }
  return digits
}
