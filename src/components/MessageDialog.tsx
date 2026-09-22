import { useState } from 'react'
import type { Lead } from '../types/lead'
import { draftMessage } from '../utils/messages'
import { Modal } from './ui'

interface Props {
  lead: Lead
  onContacted: (lead: Lead) => void
  onClose: () => void
}

export function MessageDialog({ lead, onContacted, onClose }: Props) {
  const [text, setText] = useState(() => draftMessage(lead))
  const [copied, setCopied] = useState(false)

  const phone = lead.phone.replace(/\D/g, '').replace(/^0/, '972')

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
      <textarea
        className="min-h-44 w-full rounded-lg border border-slate-200 p-3 text-slate-800 focus:border-violet-400 focus:outline-none"
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
