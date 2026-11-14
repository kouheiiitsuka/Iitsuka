export type Tab = 'today' | 'calendar' | 'reference' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: '今日' },
  { id: 'calendar', label: 'カレンダー' },
  { id: 'reference', label: '参考' },
  { id: 'settings', label: '設定' },
]

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="画面">
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={item.id === tab ? 'tab is-active' : 'tab'}
          aria-current={item.id === tab ? 'page' : undefined}
          onClick={() => onChange(item.id)}
        >
          <TabIcon id={item.id} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function TabIcon({ id }: { id: Tab }) {
  if (id === 'today') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
      </svg>
    )
  }
  if (id === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
      </svg>
    )
  }
  if (id === 'reference') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4h9a3 3 0 0 1 3 3v13H8a2 2 0 0 0-2 2z" />
        <path d="M6 4v16" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8h16M4 16h16" />
      <circle cx="9" cy="8" r="2.2" />
      <circle cx="15" cy="16" r="2.2" />
    </svg>
  )
}
