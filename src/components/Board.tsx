import { useState } from 'react'
import type { Lead, LeadStage } from '../types/lead'
import { SOURCE_LABELS, STAGES, TYPE_LABELS } from '../types/lead'
import { formatDate } from '../utils/dates'
import { followUpFor, leadScore, temperature } from '../utils/smart'
import { Chip, TempBadge } from './ui'

interface Props {
  leads: Lead[]
  onMove: (id: string, stage: LeadStage) => void
  onEdit: (lead: Lead) => void
  onMessage: (lead: Lead) => void
}

export function Board({ leads, onMove, onEdit, onMessage }: Props) {
  const [dragOver, setDragOver] = useState<LeadStage | null>(null)

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STAGES.map((stage) => {
        const inStage = leads
          .filter((l) => l.stage === stage.id)
          .sort((a, b) => leadScore(b) - leadScore(a))
        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(stage.id)
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(null)
              onMove(e.dataTransfer.getData('text/plain'), stage.id)
            }}
            className={`flex w-64 shrink-0 flex-col rounded-2xl p-3 transition-colors ${
              dragOver === stage.id ? 'bg-violet-100' : 'bg-slate-200/60'
            }`}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="font-bold text-slate-700">{stage.label}</h3>
              <span className="text-sm text-slate-500">{inStage.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {inStage.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onMove={onMove}
                  onEdit={onEdit}
                  onMessage={onMessage}
                />
              ))}
              {inStage.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-400">גררי לכאן</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LeadCard({
  lead,
  onMove,
  onEdit,
  onMessage,
}: {
  lead: Lead
  onMove: Props['onMove']
  onEdit: Props['onEdit']
  onMessage: Props['onMessage']
}) {
  const score = leadScore(lead)
  const due = followUpFor(lead)
  const isOpen = lead.stage !== 'won' && lead.stage !== 'lost'

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
      className={`cursor-grab rounded-xl bg-white p-3 shadow-sm active:cursor-grabbing ${
        due ? 'ring-2 ring-violet-300' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onEdit(lead)}
          className="text-right font-medium text-slate-800 hover:text-violet-700"
        >
          {lead.name}
        </button>
        {isOpen && <TempBadge temp={temperature(score)} score={score} />}
      </div>
      {lead.company && <div className="text-sm text-slate-500">{lead.company}</div>}

      <div className="mt-2 flex flex-wrap gap-1">
        <Chip>{TYPE_LABELS[lead.type]}</Chip>
        <Chip>{SOURCE_LABELS[lead.source]}</Chip>
        {lead.units > 0 && <Chip>{lead.units} יח׳</Chip>}
      </div>

      {due && <div className="mt-2 text-xs font-medium text-violet-700">⏰ {due.reason}</div>}
      {!due && lead.nextFollowUp && isOpen && (
        <div className="mt-2 text-xs text-slate-500">לחזור ב-{formatDate(lead.nextFollowUp)}</div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <select
          value={lead.stage}
          onChange={(e) => onMove(lead.id, e.target.value as LeadStage)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-1 py-1 text-xs text-slate-600"
          aria-label="שלב"
        >
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {isOpen && (
          <button
            onClick={() => onMessage(lead)}
            className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
          >
            ✍️ הודעה
          </button>
        )}
      </div>
    </div>
  )
}
