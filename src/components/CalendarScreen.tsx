import { useState } from 'react'
import { formatJapaneseDate, formatMonthLabel, isWeekend, monthMatrix, parseIso } from '../lib/dates'
import { formatDuration, formatHoursCompact } from '../lib/format'
import {
  achievementMark,
  isStudyDay,
  plannedMinutes,
  readMinutes,
  type Logs,
  type Plan,
  type StatusMessage,
  type WeekSummary,
} from '../lib/schedule'
import { HourStepper } from './HourStepper'
import { MessageCard } from './MessageCard'

interface CalendarScreenProps {
  plan: Plan
  logs: Logs
  weeks: WeekSummary[]
  message: StatusMessage
  today: string
  onChangeLog: (date: string, minutes: number) => void
}

export function CalendarScreen({
  plan,
  logs,
  weeks,
  message,
  today,
  onChangeLog,
}: CalendarScreenProps) {
  const initial = parseIso(today)
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() + 1 })
  const [selected, setSelected] = useState<string | null>(null)
  const matrix = monthMatrix(cursor.year, cursor.month)

  function shift(offset: number) {
    const date = new Date(cursor.year, cursor.month - 1 + offset, 1)
    setCursor({ year: date.getFullYear(), month: date.getMonth() + 1 })
  }

  const selectedStudy = selected !== null && isStudyDay(plan, selected)

  return (
    <div className="screen">
      <header className="topbar">
        <span className="seal seal-small">勉</span>
        <div>
          <p className="eyebrow">月次カレンダー</p>
          <h1>{plan.name}</h1>
        </div>
      </header>

      <MessageCard message={message} />

      <section className="card calendar-card">
        <div className="month-nav">
          <button type="button" onClick={() => shift(-1)} aria-label="前の月">
            ‹
          </button>
          <h2>{formatMonthLabel(cursor.year, cursor.month)}</h2>
          <button type="button" onClick={() => shift(1)} aria-label="次の月">
            ›
          </button>
        </div>

        <div className="week-row week-head">
          {['月', '火', '水', '木', '金', '土', '日'].map((label) => (
            <span key={label}>{label}</span>
          ))}
          <span className="achieve-head">達成</span>
        </div>

        {matrix.map((dates) => {
          const week = weeks.find((item) => item.weekStart === dates[0])
          const mark = achievementMark(week)
          return (
            <div
              key={dates[0]}
              className={week?.status === 'current' ? 'week-row is-current' : 'week-row'}
            >
              {dates.map((date) => {
                const inMonth = parseIso(date).getMonth() + 1 === cursor.month
                const study = isStudyDay(plan, date)
                const exam = date === plan.examDate
                const actual = readMinutes(logs, date)
                const planned = plannedMinutes(plan, date)
                return (
                  <button
                    key={date}
                    type="button"
                    className={[
                      'day',
                      inMonth ? '' : 'is-outside',
                      date === today ? 'is-today' : '',
                      study && actual >= planned && planned > 0 ? 'is-met' : '',
                    ].join(' ')}
                    disabled={!study}
                    onClick={() => setSelected(date)}
                  >
                    <span className="day-num">{parseIso(date).getDate()}</span>
                    {exam ? (
                      <span className="day-mark">試験</span>
                    ) : study ? (
                      <span className="day-hours">{actual > 0 ? formatHoursCompact(actual) : '·'}</span>
                    ) : null}
                  </button>
                )
              })}
              <div
                className={`achieve tone-${mark.tone}`}
                role="status"
                aria-label={`${mark.primary} ${mark.secondary}。${mark.detail}`}
              >
                <strong>{mark.primary}</strong>
                <span>{mark.secondary}</span>
              </div>
            </div>
          )
        })}
      </section>

      {selected && selectedStudy && (
        <div className="sheet-backdrop" onClick={() => setSelected(null)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="勉強時間の実績"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="sheet-date">{formatJapaneseDate(selected)}</p>
            <p className="fine">
              {isWeekend(selected) ? '休日' : '平日'}の計画 {formatDuration(plannedMinutes(plan, selected))}
            </p>
            <HourStepper
              label="実績"
              minutes={readMinutes(logs, selected)}
              max={16 * 60}
              onChange={(minutes) => onChangeLog(selected, minutes)}
            />
            <button type="button" className="text-button" onClick={() => setSelected(null)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
