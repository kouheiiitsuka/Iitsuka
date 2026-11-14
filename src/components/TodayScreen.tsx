import { useState } from 'react'
import { formatJapaneseDate, weekdayLabel } from '../lib/dates'
import { formatDuration, formatHoursCompact } from '../lib/format'
import { describeDailyPlan, buildReference } from '../lib/reference'
import {
  plannedMinutes,
  readMinutes,
  type Logs,
  type Plan,
  type StatusMessage,
  type WeekSummary,
} from '../lib/schedule'
import { HourStepper } from './HourStepper'
import { MessageCard } from './MessageCard'

interface TodayScreenProps {
  plan: Plan
  logs: Logs
  weeks: WeekSummary[]
  message: StatusMessage
  today: string
  onChangeLog: (date: string, minutes: number) => void
  onOpenReference: () => void
}

export function TodayScreen({
  plan,
  logs,
  weeks,
  message,
  today,
  onChangeLog,
  onOpenReference,
}: TodayScreenProps) {
  const reference = buildReference(plan, logs, weeks, today)
  const focus =
    weeks.find((week) => week.status === 'current') ??
    weeks.find((week) => week.status === 'future') ??
    weeks[weeks.length - 1]
  const [selected, setSelected] = useState(today)
  const activeDate = focus?.dates.includes(selected) ? selected : (focus?.dates.includes(today) ? today : focus?.dates[0])
  const percent =
    focus && focus.requiredMinutes > 0
      ? Math.min(100, Math.round((focus.actualMinutes / focus.requiredMinutes) * 100))
      : 0

  return (
    <div className="screen">
      <header className="hero">
        <div className="hero-brand">
          <span className="seal">勉</span>
          <div>
            <p className="eyebrow light">合格ペース</p>
            <p className="hero-date">{formatJapaneseDate(today)}</p>
          </div>
        </div>
        <h1>{plan.name}</h1>
        <p className="countdown">
          <span>{reference.countdownLabel}</span>
        </p>
        <p className="countdown-caption">
          {reference.daysUntilExam > 0 ? '試験まで' : '試験日'} · {formatJapaneseDate(plan.examDate)}
        </p>
      </header>

      <MessageCard message={message} />

      {focus && activeDate && (
        <section className="card">
          <div className="card-heading">
            <h2>実績を記録</h2>
            <p>{describeDailyPlan(plan)}</p>
          </div>
          <div className="day-strip" role="list">
            {focus.dates.map((date) => {
              const study = focus.studyDates.includes(date)
              const actual = readMinutes(logs, date)
              return (
                <button
                  key={date}
                  type="button"
                  role="listitem"
                  className={[
                    'strip-day',
                    date === activeDate ? 'is-selected' : '',
                    date === today ? 'is-today' : '',
                    study ? '' : 'is-off',
                  ].join(' ')}
                  onClick={() => study && setSelected(date)}
                  disabled={!study}
                >
                  <span>{weekdayLabel(date)}</span>
                  <strong>{Number(date.slice(-2))}</strong>
                  <em>{study ? (actual > 0 ? formatHoursCompact(actual) : '−') : ''}</em>
                </button>
              )
            })}
          </div>
          <p className="day-plan">
            {formatJapaneseDate(activeDate)}の計画は{formatDuration(plannedMinutes(plan, activeDate))}です。
          </p>
          <HourStepper
            label="この日の実績"
            minutes={readMinutes(logs, activeDate)}
            max={16 * 60}
            onChange={(minutes) => onChangeLog(activeDate, minutes)}
          />
        </section>
      )}

      {focus && (
        <section className="card">
          <div className="card-heading">
            <h2>今週</h2>
            <p>
              {formatDuration(focus.actualMinutes)} / {formatDuration(focus.requiredMinutes)}
            </p>
          </div>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </div>
          <p className="fine">
            達成率 {percent}%
            {focus.carriedMinutes > 0
              ? ` · 先週からの繰越 ${formatDuration(focus.carriedMinutes)} を含む`
              : ''}
          </p>
        </section>
      )}

      <button type="button" className="link-row" onClick={onOpenReference}>
        <span>参考情報</span>
        <strong>
          {reference.catalog
            ? `一般的な目安 約${reference.catalog.typicalHours}時間`
            : '試験日と平均学習時間'}
        </strong>
      </button>
    </div>
  )
}
