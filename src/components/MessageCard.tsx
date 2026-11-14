import type { StatusMessage } from '../lib/schedule'

export function MessageCard({ message }: { message: StatusMessage }) {
  return (
    <section className={`message tone-${message.tone}`} aria-live="polite">
      <p className="message-kicker">今週の達成状況</p>
      <h2>{message.title}</h2>
      <p className="message-body">{message.body}</p>
    </section>
  )
}
