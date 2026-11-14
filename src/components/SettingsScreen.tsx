import { useState } from 'react'
import type { Plan } from '../lib/schedule'
import { PlanForm } from './PlanForm'

interface SettingsScreenProps {
  plan: Plan
  onSubmit: (plan: Plan) => void
  onDelete: () => void
}

export function SettingsScreen({ plan, onSubmit, onDelete }: SettingsScreenProps) {
  const [saved, setSaved] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="screen">
      <PlanForm
        key={`${plan.name}-${plan.examDate}-${plan.startDate}-${plan.weekdayMinutes}-${plan.holidayMinutes}`}
        mode="edit"
        initial={plan}
        onSubmit={(next) => {
          onSubmit(next)
          setSaved(true)
        }}
      />
      {saved && <p className="saved">計画を保存しました。</p>}

      <section className="card danger-card">
        <h2>資格を削除</h2>
        <p>登録できる資格は1つです。削除すると計画と実績が消え、新規登録に戻ります。</p>
        <button type="button" className="danger" onClick={() => setConfirming(true)}>
          削除して登録し直す
        </button>
      </section>

      {confirming && (
        <div className="sheet-backdrop" onClick={() => setConfirming(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="資格の削除"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>資格を削除しますか</h2>
            <p>「{plan.name}」の計画と実績を削除します。</p>
            <button type="button" className="danger" onClick={onDelete}>
              削除する
            </button>
            <button type="button" className="text-button" onClick={() => setConfirming(false)}>
              やめる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
