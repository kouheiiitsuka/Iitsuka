import { formatJapaneseDate } from '../lib/dates'
import { formatDuration } from '../lib/format'
import { buildReference, describeDailyPlan } from '../lib/reference'
import type { Logs, Plan, WeekSummary } from '../lib/schedule'

interface ReferenceScreenProps {
  plan: Plan
  logs: Logs
  weeks: WeekSummary[]
  today: string
}

export function ReferenceScreen({ plan, logs, weeks, today }: ReferenceScreenProps) {
  const reference = buildReference(plan, logs, weeks, today)

  return (
    <div className="screen">
      <header className="topbar">
        <span className="seal seal-small">勉</span>
        <div>
          <p className="eyebrow">参考情報</p>
          <h1>{plan.name}</h1>
        </div>
      </header>

      <section className="stat-grid">
        <article>
          <p>試験日</p>
          <strong>{formatJapaneseDate(reference.examDate)}</strong>
        </article>
        <article>
          <p>残り日数</p>
          <strong>{reference.countdownLabel}</strong>
        </article>
        <article>
          <p>計画の1日平均</p>
          <strong>{formatDuration(reference.averagePlanned)}</strong>
        </article>
        <article>
          <p>実績の1日平均</p>
          <strong>{reference.averageActual === null ? 'まだありません' : formatDuration(reference.averageActual)}</strong>
        </article>
      </section>

      <section className="card">
        <h2>あなたの計画</h2>
        <dl className="facts">
          <div>
            <dt>設定した勉強時間</dt>
            <dd>{describeDailyPlan(plan)}</dd>
          </div>
          <div>
            <dt>試験前日までの計画</dt>
            <dd>
              {formatDuration(reference.plannedTotal)} / {reference.studyDayCount}日
            </dd>
          </div>
          <div>
            <dt>記録した実績</dt>
            <dd>{formatDuration(reference.actualTotal)}</dd>
          </div>
          <div>
            <dt>これから必要な時間</dt>
            <dd>{formatDuration(reference.remaining)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>この資格の目安</h2>
        {reference.catalog ? (
          <>
            <p className="catalog-name">{reference.catalog.name}</p>
            <dl className="facts">
              <div>
                <dt>一般的な総学習時間</dt>
                <dd>約{reference.catalog.typicalHours}時間</dd>
              </div>
              <div>
                <dt>標準的な期間</dt>
                <dd>{reference.catalog.period}</dd>
              </div>
            </dl>
            <p className="summary">{reference.catalog.summary}</p>
            {reference.catalog.typicalHoursNote && <p className="fine">{reference.catalog.typicalHoursNote}</p>}
            {reference.gapNote && <p className="gap-note">{reference.gapNote}</p>}
          </>
        ) : (
          <p className="summary">
            この資格名の一般的な学習時間は登録されていません。試験日と、入力した計画から計算した平均は上に出しています。
          </p>
        )}
        <p className="disclaimer">
          一般的な学習時間は公開情報をもとにした目安で、合格を保証する時間ではありません。
        </p>
      </section>
    </div>
  )
}
