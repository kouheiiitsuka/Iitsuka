const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseIso(iso: string): Date {
  const match = ISO_DATE.exec(iso)
  if (!match) throw new Error(`Invalid date: ${iso}`)
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${iso}`)
  }
  return date
}

export function isIsoDate(iso: string): boolean {
  try {
    parseIso(iso)
    return true
  } catch {
    return false
  }
}

export function formatIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso(now = new Date()): string {
  return formatIso(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
}

export function addDays(iso: string, days: number): string {
  const date = parseIso(iso)
  date.setDate(date.getDate() + days)
  return formatIso(date)
}

export function diffDays(from: string, to: string): number {
  const start = parseIso(from).getTime()
  const end = parseIso(to).getTime()
  return Math.round((end - start) / 86_400_000)
}

export function isWeekend(iso: string): boolean {
  const day = parseIso(iso).getDay()
  return day === 0 || day === 6
}

export function startOfWeek(iso: string): string {
  const date = parseIso(iso)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return formatIso(date)
}

export function monthMatrix(year: number, month: number): string[][] {
  const first = formatIso(new Date(year, month - 1, 1))
  const last = formatIso(new Date(year, month, 0))
  const weeks: string[][] = []
  let cursor = startOfWeek(first)
  while (cursor <= last) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(cursor, index)))
    cursor = addDays(cursor, 7)
  }
  return weeks
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export function formatJapaneseDate(iso: string): string {
  const date = parseIso(iso)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAY_LABELS[date.getDay()]}）`
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`
}

export function weekdayLabel(iso: string): string {
  return WEEKDAY_LABELS[parseIso(iso).getDay()] ?? ''
}
