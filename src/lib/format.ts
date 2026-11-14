export function formatDuration(minutes: number): string {
  const negative = minutes < 0
  const abs = Math.abs(Math.round(minutes))
  const hours = Math.floor(abs / 60)
  const rest = abs % 60
  const body =
    hours === 0 ? `${rest}分` : rest === 0 ? `${hours}時間` : `${hours}時間${rest}分`
  return negative ? `-${body}` : body
}

export function formatHoursCompact(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10
  return `${hours}h`
}
