import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../components/AdminLayout'
import AlertDetailDrawer from '../components/AlertDetailDrawer'
import {
  adminQueryKeys,
  dismissAdminAlert,
  fetchAdminAlerts,
  resolveAdminAlert,
} from '../lib/admin-api'
import {
  filterActiveAdminAlerts,
  markAdminAlertRead,
  markAdminAlertResolved,
} from '../lib/admin-alert-read'
import { getApiErrorMessage } from '../lib/auth-api'
import { useAuthStore } from '../stores/auth.store'

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
 * }} props
 */
function AlertSection({
  title,
  description,
  alerts,
  emptyMessage,
  accent = false,
  onOpen,
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
              onView={() => onOpen(a)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default function AlertsCenter() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)
  const [selected, setSelected] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [localTick, setLocalTick] = useState(0)

  const alertsQuery = useQuery({
    queryKey: adminQueryKeys.alerts(),
    queryFn: fetchAdminAlerts,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  const activeAlerts = useMemo(() => {
    void localTick
    return filterActiveAdminAlerts(alertsQuery.data, userId)
  }, [alertsQuery.data, userId, localTick])

  const priorityAlerts = activeAlerts.priorityAlerts
  const otherAlerts = activeAlerts.otherAlerts

  function bumpLocalState() {
    setLocalTick((n) => n + 1)
    queryClient.setQueryData(adminQueryKeys.alerts(), (prev) =>
      prev
        ? {
            ...prev,
            generatedAt: new Date().toISOString(),
          }
        : prev,
    )
  }

  async function clearAlert(alert, mode) {
    if (!alert?.id) return
    setActionError(null)

    if (alert.lessonAlertId) {
      try {
        if (mode === 'resolve') {
          await resolveAdminAlert(alert.lessonAlertId)
        } else {
          await dismissAdminAlert(alert.lessonAlertId)
        }
      } catch (err) {
        setActionError(getApiErrorMessage(err))
        return
      }
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.alerts() })
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() })
    }

    markAdminAlertResolved(userId, alert.id)
    bumpLocalState()
    setSelected(null)
  }

  const clearMutation = useMutation({
    mutationFn: async ({ alert, mode }) => clearAlert(alert, mode),
  })

  function toDrawerAlert(a) {
    return {
      ...a,
      text: a.message,
      date: formatAlertDate(a.createdAt),
    }
  }

  function handleOpen(a) {
    setActionError(null)
    const newlyRead = markAdminAlertRead(userId, a.id)
    if (newlyRead) bumpLocalState()
    setSelected(toDrawerAlert(a))
  }

  return (
    <AdminLayout title="Alerts Center" userSubtitle="Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">Alerts Center</h2>
        <p className="text-white/50 text-sm">
          Priority cases first (red flags, SEL, unanswered parent messages 24h+), then remaining
          alerts by severity. Open to mark read; Mark Resolved / Dismiss removes it from your queue.
        </p>
      </div>

      {(alertsQuery.isError || actionError) && (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm bg-[#FF6F6F]/10 text-[#FF6F6F] border border-[#FF6F6F]/20">
          {actionError || getApiErrorMessage(alertsQuery.error)}
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
          />

          <AlertSection
            title="All Other Alerts"
            description="Non-red lesson-failure alerts only (orange / yellow severity), ordered High → Medium → Low."
            alerts={otherAlerts}
            emptyMessage="No additional alerts."
            onOpen={handleOpen}
          />
        </div>
      )}

      <AlertDetailDrawer
        open={!!selected}
        alert={selected}
        busy={clearMutation.isPending}
        onClose={() => setSelected(null)}
        onDismiss={() => {
          if (!selected) return
          clearMutation.mutate({ alert: selected, mode: 'dismiss' })
        }}
        onResolve={() => {
          if (!selected) return
          clearMutation.mutate({ alert: selected, mode: 'resolve' })
        }}
      />
    </AdminLayout>
  )
}
