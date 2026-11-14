import { useState, type FormEvent } from 'react'
import { formatJapaneseDate, isIsoDate, todayIso } from '../lib/dates'
import { matchCatalog } from '../lib/catalog'
import type { Plan } from '../lib/schedule'
import { HourStepper } from './HourStepper'

const PLAN_MAX = 12 * 60

interface PlanFormProps {
  mode: 'create' | 'edit'
  initial?: Plan
  onSubmit: (plan: Plan) => void
}

export function PlanForm({ mode, initial, onSubmit }: PlanFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [examDate, setExamDate] = useState(initial?.examDate ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayIso())
  const [weekdayMinutes, setWeekdayMinutes] = useState(initial?.weekdayMinutes ?? 60)
  const [holidayMinutes, setHolidayMinutes] = useState(initial?.holidayMinutes ?? 120)
  const [error, setError] = useState('')

  const catalog = matchCatalog(name)

  function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('資格名を入力してください。')
      return
    }
    if (!isIsoDate(startDate) || !isIsoDate(examDate)) {
      setError('学習開始日と試験日を入力してください。')
      return
    }
    if (startDate >= examDate) {
      setError('学習開始日は試験日より前にしてください。')
      return
    }
    if (mode === 'create' && examDate <= todayIso()) {
      setError('試験日は明日以降にしてください。')
      return
    }
    if (weekdayMinutes === 0 && holidayMinutes === 0) {
      setError('平日か休日のどちらかに勉強時間を入れてください。')
      return
    }
    setError('')
    onSubmit({
      name: trimmed,
      examDate,
      startDate,
      weekdayMinutes,
      holidayMinutes,
    })
  }

  return (
    <form className="form" onSubmit={submit}>
      {mode === 'create' ? (
        <header className="intro">
          <span className="seal">勉</span>
          <p className="eyebrow">合格ペース</p>
          <h1>試験日までの勉強を、週で管理する</h1>
          <p className="lede">
            資格は1つだけ登録できます。平日と休日の勉強時間から、毎週の目標を作ります。
          </p>
        </header>
      ) : (
        <header className="topbar">
          <span className="seal seal-small">勉</span>
          <div>
            <p className="eyebrow">設定</p>
            <h1>計画を変更</h1>
          </div>
        </header>
      )}

      <label className="field">
        <span>資格名</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={40}
          placeholder="例）宅地建物取引士"
          autoComplete="off"
        />
      </label>

      <div className="chips" aria-label="資格名の例">
        {['基本情報', '宅建', '簿記2級', 'FP2級', 'TOEIC'].map((example) => (
          <button key={example} type="button" className="chip" onClick={() => setName(example)}>
            {example}
          </button>
        ))}
      </div>

      {catalog && (
        <p className="catalog-hint">
          {catalog.name}の一般的な学習時間は約{catalog.typicalHours}時間です。
          {catalog.typicalHoursNote ? catalog.typicalHoursNote : ''}
        </p>
      )}

      <label className="field">
        <span>試験日</span>
        <input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} />
        {isIsoDate(examDate) && <em className="date-readout">{formatJapaneseDate(examDate)}</em>}
      </label>

      <label className="field">
        <span>学習開始日</span>
        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        {isIsoDate(startDate) && <em className="date-readout">{formatJapaneseDate(startDate)}</em>}
      </label>

      <HourStepper
        label="平日（月〜金）"
        minutes={weekdayMinutes}
        max={PLAN_MAX}
        onChange={setWeekdayMinutes}
      />
      <HourStepper
        label="休日（土日）"
        minutes={holidayMinutes}
        max={PLAN_MAX}
        onChange={setHolidayMinutes}
      />

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="primary">
        {mode === 'create' ? 'この資格で始める' : '計画を保存'}
      </button>
    </form>
  )
}
