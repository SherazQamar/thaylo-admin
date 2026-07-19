import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import AlertDetailDrawer from '../components/AlertDetailDrawer'
import ChatDrawer from '../components/ChatDrawer'
import { adminQueryKeys, fetchAdminAlerts } from '../lib/admin-api'
import { getApiErrorMessage } from '../lib/auth-api'

function formatAlertDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function PriorityBadge({ priority, accent }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border"
      style={{
        borderColor: accent,
        color: accent,
        backgroundColor: accent + '15',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: '100%',
        letterSpacing: '0%',
        textAlign: 'center',
        padding: '5px 12px',
      }}
    >
      {priority}
    </span>
  )
}

function ViewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-[#00B8BB] transition-colors cursor-pointer"
      style={{
        backgroundColor: '#00CED1',
        borderRadius: '12px',
        padding: '6px 16px',
        width: '111.25px',
        height: '28px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '11px',
        lineHeight: '16px',
        color: '#111023',
      }}
    >
      View
    </button>
  )
}

/**
 * @param {{ a: import('../lib/admin-api').AdminAlertItem; onView: () => void; onClick: () => void }} props
 */
function AlertCard({ a, onView, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className="relative overflow-hidden rounded-2xl flex items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
      style={{ backgroundColor: '#313044', minHeight: '88px' }}
    >
      <span
        className="absolute left-0 top-0 bottom-0"
        style={{ width: '5px', backgroundColor: a.accent }}
      />

      <div className="flex-1 px-7 py-5 min-w-0">
        <p className="text-white text-base font-semibold leading-tight">{a.title}</p>
        <p className="text-white/60 text-sm mt-1">{a.message}</p>
        <p className="text-white/40 text-xs mt-2">{formatAlertDate(a.createdAt)}</p>
      </div>

      <div className="flex items-center gap-3 pr-6 shrink-0">
        {a.priority && <PriorityBadge priority={a.priority} accent={a.accent} />}
        <ViewButton
          onClick={(e) => {
            e.stopPropagation()
            onView?.()
          }}
        />
      </div>
    </div>
  )
}

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   alerts: import('../lib/admin-api').AdminAlertItem[];
 *   emptyMessage: string;
 *   accent?: boolean;
 *   onOpen: (a: import('../lib/admin-api').AdminAlertItem) => void;
 *   onView: (a: import('../lib/admin-api').AdminAlertItem) => void;
 * }} props
 */
function AlertSection({
  title,
  description,
  alerts,
  emptyMessage,
  accent = false,
  onOpen,
  onView,
}) {
  return (
    <section
      className={`rounded-2xl p-5 ${accent ? 'border border-[#FF6F6F]/25 bg-[#FF6F6F]/[0.04]' : ''}`}
    >
      <div className="mb-4">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <p className="text-white/40 text-xs mt-1">{description}</p>
      </div>

      {alerts.length === 0 ? (
        <p className="text-white/40 text-sm py-6 text-center">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {alerts.map((a) => (
            <AlertCard
              key={a.id}
              a={a}
              onClick={() => onOpen(a)}
              onView={() => onView(a)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default function AlertsCenter() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)

  const alertsQuery = useQuery({
    queryKey: adminQueryKeys.alerts(),
    queryFn: fetchAdminAlerts,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  const priorityAlerts = alertsQuery.data?.priorityAlerts ?? []
  const otherAlerts = alertsQuery.data?.otherAlerts ?? []

  function toDrawerAlert(a) {
    return {
      ...a,
      text: a.message,
      date: formatAlertDate(a.createdAt),
      type: a.kind === 'PARENT_MESSAGE' ? 'message' : a.kind,
    }
  }

  function handleOpen(a) {
    if (a.kind === 'PARENT_MESSAGE') {
      setChatOpen(true)
      return
    }
    setSelected(toDrawerAlert(a))
  }

  function handleView(a) {
    if (a.kind === 'PARENT_MESSAGE') {
      setChatOpen(true)
      return
    }
    if (a.kind === 'LESSON_FAILURE') {
      navigate('/alerts/insights')
      return
    }
    setSelected(toDrawerAlert(a))
  }

  return (
    <AdminLayout title="Alerts Center" userSubtitle="Super Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">Alerts Center</h2>
        <p className="text-white/50 text-sm">
          Priority cases first (red flags, SEL, unanswered parent messages 24h+), then remaining
          alerts by severity.
        </p>
      </div>

      {alertsQuery.isError && (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm bg-[#FF6F6F]/10 text-[#FF6F6F] border border-[#FF6F6F]/20">
          {getApiErrorMessage(alertsQuery.error)}
        </div>
      )}

      {alertsQuery.isLoading ? (
        <p className="text-white/50 text-sm py-10 text-center">Loading alerts…</p>
      ) : (
        <div className="flex flex-col gap-6 mt-6">
          <AlertSection
            title="Needs Immediate Attention"
            description="Red lesson flags, SEL red flags, and parent messages unanswered for 24 hours or more."
            alerts={priorityAlerts}
            emptyMessage="No priority alerts right now."
            accent
            onOpen={handleOpen}
            onView={handleView}
          />

          <AlertSection
            title="All Other Alerts"
            description="Remaining active alerts ordered by priority (High → Medium → Low)."
            alerts={otherAlerts}
            emptyMessage="No additional alerts."
            onOpen={handleOpen}
            onView={handleView}
          />
        </div>
      )}

      <AlertDetailDrawer
        open={!!selected}
        alert={selected}
        onClose={() => setSelected(null)}
        onMessageParent={() => {
          setSelected(null)
          setChatOpen(true)
        }}
      />
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </AdminLayout>
  )
}
