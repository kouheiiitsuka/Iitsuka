import { formatDuration } from '../lib/format'

interface HourStepperProps {
  label: string
  minutes: number
  max: number
  onChange: (minutes: number) => void
}

export function HourStepper({ label, minutes, max, onChange }: HourStepperProps) {
  function update(next: number) {
    onChange(Math.min(max, Math.max(0, next)))
  }

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-button"
        onClick={() => update(minutes - 30)}
        disabled={minutes <= 0}
        aria-label={`${label}を30分減らす`}
      >
        −
      </button>
      <div className="stepper-value" aria-live="polite">
        <span className="stepper-label">{label}</span>
        <strong>{formatDuration(minutes)}</strong>
      </div>
      <button
        type="button"
        className="stepper-button"
        onClick={() => update(minutes + 30)}
        disabled={minutes >= max}
        aria-label={`${label}を30分増やす`}
      >
        ＋
      </button>
    </div>
  )
}
