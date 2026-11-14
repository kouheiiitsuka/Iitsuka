import { describe, expect, it } from 'vitest'
import { monthMatrix, startOfWeek } from './dates'
import { matchCatalog } from './catalog'
import { buildReference } from './reference'
import {
  achievementMark,
  buildStatusMessage,
  buildWeeks,
  plannedMinutes,
  type Plan,
} from './schedule'

const plan: Plan = {
  name: '宅建',
  startDate: '2026-11-09',
  examDate: '2026-11-30',
  weekdayMinutes: 60,
  holidayMinutes: 120,
}

describe('planned minutes', () => {
  it('uses weekday hours on Friday and holiday hours on Saturday', () => {
    expect(plannedMinutes(plan, '2026-11-13')).toBe(60)
    expect(plannedMinutes(plan, '2026-11-14')).toBe(120)
  })

  it('does not plan the exam day or days before the start', () => {
    expect(plannedMinutes(plan, '2026-11-08')).toBe(0)
    expect(plannedMinutes(plan, '2026-11-30')).toBe(0)
  })
})

describe('weekly carry', () => {
  it('adds a finished shortfall only to the next week', () => {
    const weeks = buildWeeks(plan, {}, '2026-11-16')
    const [first, second, third] = weeks

    expect(first.status).toBe('past')
    expect(first.requiredMinutes).toBe(540)
    expect(first.shortfallMinutes).toBe(540)

    expect(second.status).toBe('current')
    expect(second.carriedMinutes).toBe(540)
    expect(second.requiredMinutes).toBe(1080)

    expect(third.status).toBe('future')
    expect(third.carriedMinutes).toBe(0)
    expect(third.requiredMinutes).toBe(540)
  })

  it('does not shrink the next week when this week runs over the target', () => {
    const weeks = buildWeeks(plan, { '2026-11-09': 1000 }, '2026-11-16')
    expect(weeks[0].shortfallMinutes).toBe(0)
    expect(weeks[1].requiredMinutes).toBe(540)
    expect(weeks[1].carriedMinutes).toBe(0)
  })

  it('drops the projection once the open week is caught up', () => {
    const weeks = buildWeeks(plan, { '2026-11-09': 540 }, '2026-11-11')
    const message = buildStatusMessage(plan, { '2026-11-09': 540 }, weeks, '2026-11-11')
    expect(weeks[0].shortfallMinutes).toBe(0)
    expect(message.title).toBe('今週の目標を達成しました')
    expect(message.body).toBe('来週は9時間の計画です。')
  })

  it('ignores logs outside the study period', () => {
    const weeks = buildWeeks(
      plan,
      { '2026-11-08': 600, '2026-11-30': 600, '2026-11-09': 60 },
      '2026-11-16',
    )
    expect(weeks[0].actualMinutes).toBe(60)
    expect(weeks[0].shortfallMinutes).toBe(480)
  })
})

describe('status messages', () => {
  it('tells the user how many hours next week will need while this week is behind', () => {
    const today = '2026-11-14'
    const weeks = buildWeeks(plan, {}, today)
    const message = buildStatusMessage(plan, {}, weeks, today)

    expect(message.tone).toBe('alert')
    expect(message.title).toBe('大きく遅れています')
    expect(message.body).toBe('今週はあと9時間です。未達成のままだと、来週は18時間必要です。')
    expect(achievementMark(weeks[0])).toMatchObject({ primary: '0%', secondary: '途中', tone: 'alert' })
    expect(achievementMark(weeks[1])).toMatchObject({ primary: '9時間', secondary: '予定', tone: 'future' })
  })

  it('moves the unpaid hours into this week after the short week has ended', () => {
    const today = '2026-11-16'
    const weeks = buildWeeks(plan, {}, today)
    const message = buildStatusMessage(plan, {}, weeks, today)

    expect(message.title).toBe('先週の未達成を繰り越しています')
    expect(message.body).toBe('未達成は9時間です。今週は18時間必要です。')
    expect(achievementMark(weeks[0]).secondary).toBe('不足')
    expect(achievementMark(weeks[1])).toMatchObject({ primary: '0%', secondary: '途中' })
  })

  it('stays neutral on the first morning before any time is logged', () => {
    const today = '2026-11-09'
    const weeks = buildWeeks(plan, {}, today)
    const message = buildStatusMessage(plan, {}, weeks, today)
    expect(message.title).toBe('今日の実績を入れましょう')
    expect(message.body).toContain('来週は18時間必要です。')
  })

  it('calls the pace good when elapsed days are already covered', () => {
    const logs = {
      '2026-11-09': 60,
      '2026-11-10': 60,
      '2026-11-11': 60,
      '2026-11-12': 60,
      '2026-11-13': 60,
    }
    const today = '2026-11-14'
    const weeks = buildWeeks(plan, logs, today)
    const message = buildStatusMessage(plan, logs, weeks, today)
    expect(message.tone).toBe('good')
    expect(message.title).toBe('ここまでは順調です')
    expect(message.body).toBe('今週はあと4時間です。未達成のままだと、来週は13時間必要です。')
  })

  it('does not mention next week on the final study week', () => {
    const finalPlan: Plan = { ...plan, startDate: '2026-11-16', examDate: '2026-11-18' }
    const weeks = buildWeeks(finalPlan, {}, '2026-11-16')
    const message = buildStatusMessage(finalPlan, {}, weeks, '2026-11-16')
    expect(weeks).toHaveLength(1)
    expect(weeks[0].baseMinutes).toBe(120)
    expect(message.body).toBe('今週の目標は2時間です。試験日までに、あと2時間必要です。')
  })

  it('reports the hours still unpaid after the exam date', () => {
    const weeks = buildWeeks(plan, {}, '2026-11-30')
    const message = buildStatusMessage(plan, {}, weeks, '2026-11-30')
    expect(message.title).toBe('試験日を過ぎています')
    expect(message.body).toContain('未達成のまま終わった時間は27時間です。')
  })
})

describe('calendar weeks', () => {
  it('starts November 2026 on the Monday of the week that contains the 1st', () => {
    expect(startOfWeek('2026-11-14')).toBe('2026-11-09')
    const weeks = monthMatrix(2026, 11)
    expect(weeks[0][0]).toBe('2026-10-26')
    expect(weeks[0][6]).toBe('2026-11-01')
    expect(weeks.at(-1)?.[0]).toBe('2026-11-30')
  })
})

describe('catalog and reference', () => {
  it('matches aliases and leaves an ambiguous name unmatched', () => {
    expect(matchCatalog('宅建')?.name).toBe('宅地建物取引士')
    expect(matchCatalog('宅地建物取引士')?.typicalHours).toBe(300)
    expect(matchCatalog('基本情報技術者試験')?.id).toBe('fe')
    expect(matchCatalog('ＦＰ２級')?.id).toBe('fp2')
    expect(matchCatalog('英検準1級')?.id).toBe('eiken-pre1')
    expect(matchCatalog('簿記')).toBeNull()
  })

  it('compares the planned total with the catalog average', () => {
    const longPlan: Plan = { ...plan, name: '宅建', examDate: '2026-12-20' }
    const weeks = buildWeeks(longPlan, {}, '2026-11-14')
    const reference = buildReference(longPlan, {}, weeks, '2026-11-14')
    expect(reference.daysUntilExam).toBe(36)
    expect(reference.catalog?.typicalHours).toBe(300)
    expect(reference.studyDayCount).toBe(41)
    expect(reference.gapNote).toContain('少ない計画です')
    expect(reference.averageActual).toBeNull()
  })
})
