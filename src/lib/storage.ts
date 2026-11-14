import { isIsoDate } from './dates'
import type { Logs, Plan } from './schedule'

const STORAGE_KEY = 'goukaku-pace/v1'
const MAX_PLAN_MINUTES = 12 * 60

export interface AppData {
  plan: Plan | null
  logs: Logs
}

const EMPTY: AppData = { plan: null, logs: {} }

function isPlan(value: unknown): value is Plan {
  if (!value || typeof value !== 'object') return false
  const plan = value as Partial<Plan>
  return (
    typeof plan.name === 'string' &&
    plan.name.trim().length > 0 &&
    typeof plan.examDate === 'string' &&
    isIsoDate(plan.examDate) &&
    typeof plan.startDate === 'string' &&
    isIsoDate(plan.startDate) &&
    plan.startDate < plan.examDate &&
    typeof plan.weekdayMinutes === 'number' &&
    typeof plan.holidayMinutes === 'number' &&
    plan.weekdayMinutes >= 0 &&
    plan.holidayMinutes >= 0 &&
    plan.weekdayMinutes <= MAX_PLAN_MINUTES &&
    plan.holidayMinutes <= MAX_PLAN_MINUTES
  )
}

function isLogs(value: unknown): value is Logs {
  if (!value || typeof value !== 'object') return false
  return Object.values(value).every((minutes) => typeof minutes === 'number' && Number.isFinite(minutes))
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return EMPTY
    const record = parsed as Partial<AppData>
    return {
      plan: isPlan(record.plan) ? { ...record.plan, name: record.plan.name.trim() } : null,
      logs: isLogs(record.logs) ? record.logs : {},
    }
  } catch {
    return EMPTY
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
