import { matchCatalog, type CatalogEntry } from './catalog'
import { diffDays } from './dates'
import { formatDuration } from './format'
import { isStudyDay, readMinutes, type Logs, type Plan, type WeekSummary } from './schedule'

export interface ReferenceView {
  examDate: string
  daysUntilExam: number
  countdownLabel: string
  plannedTotal: number
  actualTotal: number
  remaining: number
  studyDayCount: number
  averagePlanned: number
  averageActual: number | null
  catalog: CatalogEntry | null
  gapNote: string | null
}

export function buildReference(
  plan: Plan,
  logs: Logs,
  weeks: WeekSummary[],
  today: string,
): ReferenceView {
  const plannedTotal = weeks.reduce((total, week) => total + week.baseMinutes, 0)
  const actualTotal = weeks.reduce((total, week) => total + week.actualMinutes, 0)
  const remaining = weeks
    .filter((week) => week.status === 'current' || week.status === 'future')
    .reduce(
      (total, week) =>
        total + Math.max(0, week.requiredMinutes - (week.status === 'current' ? week.actualMinutes : 0)),
      0,
    )
  const studyDayCount = weeks.reduce((total, week) => total + week.studyDates.length, 0)

  const completedDates = weeks.flatMap((week) => week.studyDates).filter((date) => date < today)
  const todayActual = isStudyDay(plan, today) ? readMinutes(logs, today) : 0
  const loggedMinutes =
    completedDates.reduce((total, date) => total + readMinutes(logs, date), 0) + todayActual
  const averageDays = completedDates.length + (todayActual > 0 ? 1 : 0)
  const averageActual = loggedMinutes > 0 && averageDays > 0 ? Math.round(loggedMinutes / averageDays) : null

  const daysUntilExam = diffDays(today, plan.examDate)
  const catalog = matchCatalog(plan.name)
  const plannedHours = plannedTotal / 60
  let gapNote: string | null = null
  if (catalog) {
    const diff = Math.round(catalog.typicalHours - plannedHours)
    if (diff > 1) gapNote = `一般的な目安より約${diff}時間少ない計画です。`
    else if (diff < -1) gapNote = `一般的な目安より約${-diff}時間多い計画です。`
    else gapNote = '一般的な目安とほぼ同じ計画です。'
  }

  return {
    examDate: plan.examDate,
    daysUntilExam,
    countdownLabel:
      daysUntilExam > 0 ? `${daysUntilExam}日` : daysUntilExam === 0 ? '本日' : `${-daysUntilExam}日経過`,
    plannedTotal,
    actualTotal,
    remaining,
    studyDayCount,
    averagePlanned: studyDayCount > 0 ? Math.round(plannedTotal / studyDayCount) : 0,
    averageActual,
    catalog,
    gapNote,
  }
}

export function describeDailyPlan(plan: Plan): string {
  return `平日 ${formatDuration(plan.weekdayMinutes)} / 休日 ${formatDuration(plan.holidayMinutes)}`
}
