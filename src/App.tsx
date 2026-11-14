import { useEffect, useMemo, useState } from 'react'
import { CalendarScreen } from './components/CalendarScreen'
import { PlanForm } from './components/PlanForm'
import { ReferenceScreen } from './components/ReferenceScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { TabBar, type Tab } from './components/TabBar'
import { TodayScreen } from './components/TodayScreen'
import { todayIso } from './lib/dates'
import { buildStatusMessage, buildWeeks, isStudyDay, type Plan } from './lib/schedule'
import { loadAppData, saveAppData, type AppData } from './lib/storage'

export function App() {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [tab, setTab] = useState<Tab>('today')
  const today = todayIso()
  const plan = data.plan
  const logs = data.logs

  useEffect(() => {
    saveAppData(data)
  }, [data])

  const weeks = useMemo(() => (plan ? buildWeeks(plan, logs, today) : []), [plan, logs, today])
  const message = useMemo(
    () => (plan ? buildStatusMessage(plan, logs, weeks, today) : null),
    [plan, logs, weeks, today],
  )

  function updatePlan(next: Plan) {
    setData((current) => ({
      plan: next,
      logs: Object.fromEntries(
        Object.entries(current.logs).filter(([date]) => isStudyDay(next, date)),
      ),
    }))
  }

  function changeLog(date: string, minutes: number) {
    setData((current) => {
      if (!current.plan || !isStudyDay(current.plan, date)) return current
      const nextLogs = { ...current.logs }
      if (minutes <= 0) delete nextLogs[date]
      else nextLogs[date] = minutes
      return { ...current, logs: nextLogs }
    })
  }

  return (
    <div className="stage">
      <div className="phone">
        {plan && message ? (
          <>
            <div className="phone-scroll">
              {tab === 'today' && (
                <TodayScreen
                  plan={plan}
                  logs={logs}
                  weeks={weeks}
                  message={message}
                  today={today}
                  onChangeLog={changeLog}
                  onOpenReference={() => setTab('reference')}
                />
              )}
              {tab === 'calendar' && (
                <CalendarScreen
                  plan={plan}
                  logs={logs}
                  weeks={weeks}
                  message={message}
                  today={today}
                  onChangeLog={changeLog}
                />
              )}
              {tab === 'reference' && (
                <ReferenceScreen plan={plan} logs={logs} weeks={weeks} today={today} />
              )}
              {tab === 'settings' && (
                <SettingsScreen
                  plan={plan}
                  onSubmit={updatePlan}
                  onDelete={() => {
                    setData({ plan: null, logs: {} })
                    setTab('today')
                  }}
                />
              )}
            </div>
            <TabBar tab={tab} onChange={setTab} />
          </>
        ) : (
          <div className="phone-scroll">
            <PlanForm mode="create" onSubmit={updatePlan} />
          </div>
        )}
      </div>
    </div>
  )
}
