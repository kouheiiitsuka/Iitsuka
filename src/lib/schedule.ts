import { addDays, isWeekend, startOfWeek } from './dates'
import { formatDuration } from './format'

export interface Plan {
  name: string
  examDate: string
  startDate: string
  weekdayMinutes: number
  holidayMinutes: number
}

export type Logs = Record<string, number>

export type WeekStatus = 'past' | 'current' | 'future'

export interface WeekSummary {
  weekStart: string
  weekEnd: string
  dates: string[]
  studyDates: string[]
  baseMinutes: number
  carriedMinutes: number
  requiredMinutes: number
  actualMinutes: number
  shortfallMinutes: number
  status: WeekStatus
}

export type MessageTone = 'good' | 'close' | 'behind' | 'alert' | 'neutral'

export interface StatusMessage {
  tone: MessageTone
  title: string
  body: string
}

export interface AchievementMark {
  primary: string
  secondary: string
  tone: MessageTone | 'future'
  detail: string
}

const MAX_LOG_MINUTES = 16 * 60

export function readMinutes(logs: Logs, date: string): number {
  const value = logs[date]
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0
  return Math.min(Math.round(value), MAX_LOG_MINUTES)
}

export function isStudyDay(plan: Plan, iso: string): boolean {
  return iso >= plan.startDate && iso < plan.examDate
}

export function plannedMinutes(plan: Plan, iso: string): number {
  if (!isStudyDay(plan, iso)) return 0
  return isWeekend(iso) ? plan.holidayMinutes : plan.weekdayMinutes
}

function sumPlanned(plan: Plan, dates: string[]): number {
  return dates.reduce((total, date) => total + plannedMinutes(plan, date), 0)
}

function sumActual(logs: Logs, dates: string[]): number {
  return dates.reduce((total, date) => total + readMinutes(logs, date), 0)
}

/**
 * Weeks run Monday–Sunday. Shortfall from a finished week is added to the next
 * week only. An open week keeps that debt in its own target, and the message
 * projects what the following week will need if the gap is left unpaid.
 */
export function buildWeeks(plan: Plan, logs: Logs, today: string): WeekSummary[] {
  if (plan.startDate >= plan.examDate) return []

  const lastStudyDay = addDays(plan.examDate, -1)
  const lastWeekStart = startOfWeek(lastStudyDay)
  const weeks: WeekSummary[] = []
  let carry = 0

  for (
    let weekStart = startOfWeek(plan.startDate);
    weekStart <= lastWeekStart;
    weekStart = addDays(weekStart, 7)
  ) {
    const dates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
    const weekEnd = dates[6]
    const studyDates = dates.filter((date) => isStudyDay(plan, date))
    const baseMinutes = sumPlanned(plan, studyDates)
    const actualMinutes = sumActual(logs, studyDates)
    const status: WeekStatus = studyDates.every((date) => date < today)
      ? 'past'
      : studyDates.every((date) => date > today)
        ? 'future'
        : 'current'

    const carriedMinutes = carry
    const requiredMinutes = baseMinutes + carriedMinutes
    const shortfallMinutes =
      status === 'future' ? 0 : Math.max(0, requiredMinutes - actualMinutes)

    weeks.push({
      weekStart,
      weekEnd,
      dates,
      studyDates,
      baseMinutes,
      carriedMinutes,
      requiredMinutes,
      actualMinutes,
      shortfallMinutes,
      status,
    })

    if (status === 'past') carry = shortfallMinutes
    else carry = 0
  }

  return weeks
}

function toneFor(ratio: number): MessageTone {
  if (ratio >= 1) return 'good'
  if (ratio >= 0.8) return 'close'
  if (ratio >= 0.5) return 'behind'
  return 'alert'
}

function titleFor(tone: MessageTone): string {
  switch (tone) {
    case 'good':
      return 'ここまでは順調です'
    case 'close':
      return 'あと少しで今週のペースです'
    case 'behind':
      return '今週のペースが遅れています'
    case 'alert':
      return '大きく遅れています'
    case 'neutral':
      return '今週の勉強を進めましょう'
  }
}

export function buildStatusMessage(
  plan: Plan,
  logs: Logs,
  weeks: WeekSummary[],
  today: string,
): StatusMessage {
  if (weeks.length === 0) {
    return {
      tone: 'neutral',
      title: '学習期間がありません',
      body: '学習開始日と試験日を確認してください。',
    }
  }

  if (today < plan.startDate) {
    const first = weeks[0]
    return {
      tone: 'neutral',
      title: '学習開始前です',
      body: `${plan.startDate.replaceAll('-', '/')}から始まります。最初の週は${formatDuration(first.requiredMinutes)}の計画です。`,
    }
  }

  if (today >= plan.examDate) {
    const actual = weeks.reduce((total, week) => total + week.actualMinutes, 0)
    const unpaid = weeks[weeks.length - 1]?.shortfallMinutes ?? 0
    if (unpaid === 0) {
      return {
        tone: 'good',
        title: '試験日を過ぎています',
        body: `計画した時間は達成していました。累計${formatDuration(actual)}勉強しました。`,
      }
    }
    return {
      tone: 'alert',
      title: '試験日を過ぎています',
      body: `未達成のまま終わった時間は${formatDuration(unpaid)}です。累計${formatDuration(actual)}勉強しました。`,
    }
  }

  const current = weeks.find((week) => week.status === 'current')
  if (!current) {
    return {
      tone: 'neutral',
      title: '今週の対象日はありません',
      body: 'カレンダーで前後の週を確認してください。',
    }
  }

  const next = weeks.find((week) => week.status === 'future')
  const gap = current.shortfallMinutes
  const projectedNext = next ? next.baseMinutes + gap : 0

  if (current.requiredMinutes === 0) {
    return {
      tone: 'neutral',
      title: '今週の計画時間はありません',
      body: '平日と休日の勉強時間を設定から変更できます。',
    }
  }

  if (gap === 0) {
    return {
      tone: 'good',
      title: '今週の目標を達成しました',
      body: next
        ? `来週は${formatDuration(next.baseMinutes)}の計画です。`
        : '試験日までに計画した時間を満たしています。',
    }
  }

  const elapsedDates = current.studyDates.filter((date) => date < today)
  const todayActual = readMinutes(logs, today)
  const nextSentence = next
    ? `未達成のままだと、来週は${formatDuration(projectedNext)}必要です。`
    : `試験日までに、あと${formatDuration(gap)}必要です。`

  if (elapsedDates.length === 0 && todayActual === 0 && current.carriedMinutes === 0) {
    return {
      tone: 'neutral',
      title: '今日の実績を入れましょう',
      body: `今週の目標は${formatDuration(current.requiredMinutes)}です。${nextSentence}`,
    }
  }

  if (elapsedDates.length === 0 && todayActual === 0 && current.carriedMinutes > 0) {
    return {
      tone: 'behind',
      title: '先週の未達成を繰り越しています',
      body: `未達成は${formatDuration(current.carriedMinutes)}です。今週は${formatDuration(current.requiredMinutes)}必要です。`,
    }
  }

  const elapsedRequired =
    current.carriedMinutes + sumPlanned(plan, elapsedDates)
  const elapsedActual = sumActual(logs, elapsedDates) + todayActual
  const tone =
    elapsedRequired > 0 ? toneFor(elapsedActual / elapsedRequired) : 'neutral'

  return {
    tone,
    title: titleFor(tone),
    body: `今週はあと${formatDuration(gap)}です。${nextSentence}`,
  }
}

export function achievementMark(week: WeekSummary | undefined): AchievementMark {
  if (!week || week.studyDates.length === 0) {
    return { primary: '—', secondary: '—', tone: 'neutral', detail: 'この週に計画日はありません' }
  }

  const detailParts = [
    `実績 ${formatDuration(week.actualMinutes)}`,
    `目標 ${formatDuration(week.requiredMinutes)}`,
  ]
  if (week.carriedMinutes > 0) {
    detailParts.push(`うち繰越 ${formatDuration(week.carriedMinutes)}`)
  }
  const detail = detailParts.join(' / ')

  if (week.status === 'future') {
    return {
      primary: formatDuration(week.requiredMinutes),
      secondary: week.carriedMinutes > 0 ? '繰越込' : '予定',
      tone: 'future',
      detail,
    }
  }

  if (week.requiredMinutes === 0) {
    return { primary: '—', secondary: '対象外', tone: 'neutral', detail }
  }

  const percent = Math.round((week.actualMinutes / week.requiredMinutes) * 100)
  const tone = toneFor(week.actualMinutes / week.requiredMinutes)
  let secondary = '途中'
  if (week.status === 'past') {
    secondary = week.shortfallMinutes === 0 ? '達成' : '不足'
  } else if (week.shortfallMinutes === 0) {
    secondary = '達成'
  }

  return {
    primary: `${percent}%`,
    secondary,
    tone,
    detail,
  }
}
