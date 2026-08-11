import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ListPagination from '../components/ListPagination'
import { notify } from '../lib/notify'
import { useNotifyError } from '../hooks/useNotifyError'
import { useAuthStore } from '../stores/auth.store'
import {
  createSupportTicket,
  fetchSupportTickets,
  platformQueryKeys,
  updateSupportTicket,
} from '../lib/platform-api'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
]

function priorityColor(p) {
  if (p === 'HIGH') return '#FF6F6F'
  if (p === 'MEDIUM') return '#FFC542'
  return '#00CED1'
}

export default function SupportCenter() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [formOk, setFormOk] = useState(null)

  const params = { page, limit: 10, status: status || undefined }
  const ticketsQuery = useQuery({
    queryKey: platformQueryKeys.tickets(params),
    queryFn: () => fetchSupportTickets(params),
  })
  useNotifyError(ticketsQuery.error, ticketsQuery.isError)

  const createMutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: async () => {
      setSubject('')
      setMessage('')
      setPriority('MEDIUM')
      setFormOk('Ticket created.')
      await queryClient.invalidateQueries({ queryKey: ['super-admin', 'support-tickets'] })
    },
    onError: (err) => {
      setFormOk(null)
      notify.error(err)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateSupportTicket(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['super-admin', 'support-tickets'] })
    },
    onError: (err) => notify.error(err),
  })

  const tickets = ticketsQuery.data?.items ?? []

  return (
    <SuperAdminLayout title="Support">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">Support</h2>
        <p className="text-white/50 text-sm">
          Track internal support tickets and follow up on platform issues.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 mt-6">
        <section className="rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-white text-lg font-semibold">Tickets</h3>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-full bg-white/[0.06] text-white text-sm px-4 py-2 outline-none border border-white/10"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value} className="bg-[#313044]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {ticketsQuery.isLoading ? (
            <p className="text-white/50 text-sm py-8 text-center">Loading tickets…</p>
          ) : null}
          {ticketsQuery.isError ? (
            <p className="text-white/50 text-sm py-8 text-center">
              Unable to load tickets right now.
            </p>
          ) : null}
          {!ticketsQuery.isLoading && tickets.length === 0 ? (
            <p className="text-white/50 text-sm py-8 text-center">No tickets yet.</p>
          ) : null}

          <div className="space-y-3">
            {tickets.map((t) => (
              <article
                key={t.id}
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold">{t.subject}</p>
                    <p className="text-white/55 text-xs mt-1 line-clamp-2">{t.message}</p>
                    <p className="text-white/35 text-[11px] mt-2">
                      {new Date(t.createdAt).toLocaleString()}
                      {t.requesterEmail ? ` · ${t.requesterEmail}` : ''}
                    </p>
                  </div>
                  <span
                    className="text-[11px] font-semibold shrink-0"
                    style={{ color: priorityColor(t.priority) }}
                  >
                    {t.priority}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={updateMutation.isPending || t.status === s}
                      onClick={() => updateMutation.mutate({ id: t.id, payload: { status: s } })}
                      className={
                        'rounded-full px-3 py-1 text-[11px] font-semibold ' +
                        (t.status === s
                          ? 'bg-[#00CED1] text-[#111023]'
                          : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.1]')
                      }
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <ListPagination
            meta={ticketsQuery.data?.meta}
            onPageChange={setPage}
            isLoading={ticketsQuery.isFetching}
            itemLabel="tickets"
          />
        </section>

        <section className="rounded-2xl p-6 h-fit" style={{ backgroundColor: '#313044' }}>
          <h3 className="text-white text-lg font-semibold">New ticket</h3>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!subject.trim() || !message.trim()) {
                notify.error('Subject and message are required.')
                return
              }
              createMutation.mutate({
                subject: subject.trim(),
                message: message.trim(),
                priority,
                requesterName: user?.name ?? undefined,
                requesterEmail: user?.email ?? undefined,
              })
            }}
          >
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-4 py-3 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue"
              rows={5}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 resize-y"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-full bg-white/[0.06] text-white text-sm px-4 py-3 outline-none border border-white/10"
            >
              <option value="LOW" className="bg-[#313044]">
                Low
              </option>
              <option value="MEDIUM" className="bg-[#313044]">
                Medium
              </option>
              <option value="HIGH" className="bg-[#313044]">
                High
              </option>
            </select>
            {formOk ? (
              <p className="text-xs text-[#00CED1]">{formOk}</p>
            ) : null}
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold py-3 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : 'Create Ticket'}
            </button>
          </form>
        </section>
      </div>
    </SuperAdminLayout>
  )
}
