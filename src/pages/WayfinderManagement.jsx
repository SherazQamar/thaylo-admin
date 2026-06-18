import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, UserPlus, Users, Mail } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import AddWayfinderModal from '../components/AddWayfinderModal'
import AssignChildModal from '../components/AssignChildModal'
import WayfinderStudentsModal from '../components/WayfinderStudentsModal'
import ListPagination from '../components/ListPagination'
import { adminQueryKeys, createWayfinder, fetchWayfinders, resendWayfinderInvite } from '../lib/admin-api'
import { getApiErrorMessage } from '../lib/auth-api'
import { formatPhoneDisplay } from '../lib/phone'
import { useDebouncedValue } from '../lib/useDebouncedValue'

function AccountStatusBadge({ invitePending }) {
  if (invitePending) {
    return (
      <span className="inline-flex items-center justify-center rounded-full border border-[#FFC542] text-[#FFC542] bg-[#FFC542]/5 px-3 py-1 text-xs font-medium">
        Pending setup
      </span>
    )
  }

  return (
    <span className="inline-flex items-center justify-center rounded-full border border-[#00CED1] text-[#00CED1] bg-[#00CED1]/5 px-3 py-1 text-xs font-medium">
      Verified
    </span>
  )
}

const ROW_GRID =
  'grid items-center gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-[1.5fr_0.7fr_0.9fr_0.8fr_auto]'

/**
 * @param {{ w: import('../lib/admin-api').WayfinderListItem; onViewStudents: () => void; onAssign: () => void; onResendInvite: () => void; isResending: boolean }} props
 */
function WayfinderRow({ w, onViewStudents, onAssign, onResendInvite, isResending }) {
  return (
    <div
      className={ROW_GRID}
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '17px 24px',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
        <div className="min-w-0">
          <p className="text-white text-base font-semibold leading-tight truncate">
            {w.name ?? 'Unnamed'}
          </p>
          <p className="text-white/40 text-xs mt-0.5 truncate">{w.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onViewStudents}
        className="text-left text-[#00CED1] text-sm font-medium hover:underline lg:justify-self-start"
      >
        {w.childrenCount} Students
      </button>

      <div className="lg:justify-self-start">
        <AccountStatusBadge invitePending={w.invitePending} />
      </div>

      <p className="text-white/60 text-sm lg:justify-self-start">{formatPhoneDisplay(w.phone)}</p>

      <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
        {w.invitePending ? (
          <button
            type="button"
            onClick={onResendInvite}
            disabled={isResending}
            title="Send a new password setup link to this wayfinder"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#00CED1] text-[#111023] text-xs font-semibold px-4 py-2 hover:bg-[#00B8BB] disabled:opacity-50"
          >
            <Mail size={14} />
            {isResending ? 'Sending…' : 'Resend setup link'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onAssign}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#00CED1]/10 text-[#00CED1] text-xs font-semibold px-3 py-1.5 hover:bg-[#00CED1]/20"
          >
            <UserPlus size={14} />
            Assign
          </button>
        )}
      </div>
    </div>
  )
}

export default function WayfinderManagement() {
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [selectedWayfinder, setSelectedWayfinder] = useState(null)
  const [assignWayfinderId, setAssignWayfinderId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createError, setCreateError] = useState('')
  const [resendingId, setResendingId] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [actionError, setActionError] = useState(null)

  const debouncedSearch = useDebouncedValue(search)

  const wayfindersQuery = useQuery({
    queryKey: adminQueryKeys.wayfinders({ page, search: debouncedSearch || undefined }),
    queryFn: () => fetchWayfinders({ page, search: debouncedSearch || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: createWayfinder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'wayfinders'] })
      setCreateError('')
      setAddOpen(false)
      setActionError(null)
      setActionMessage('Wayfinder created and invitation email sent.')
    },
    onError: (err) => setCreateError(getApiErrorMessage(err)),
  })

  const resendInviteMutation = useMutation({
    mutationFn: resendWayfinderInvite,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'wayfinders'] })
      setActionError(null)
      setActionMessage('A new setup link was emailed to the wayfinder.')
      setResendingId(null)
    },
    onError: (err) => {
      setActionMessage(null)
      setActionError(getApiErrorMessage(err))
      setResendingId(null)
    },
  })

  const wayfinders = wayfindersQuery.data?.items ?? []
  const meta = wayfindersQuery.data?.meta
  const hasPendingSetup = wayfinders.some((w) => w.invitePending)

  return (
    <AdminLayout title="Wayfinder Management" userSubtitle="Super Admin">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Wayfinder Management
          </h2>
          <p className="text-white/50 text-sm">
            Manage wayfinders, assign students, and resend setup links when invites expire.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setAssignWayfinderId(null)
              setAssignOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            <Users size={16} />
            Assign Child
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Wayfinder
          </button>
        </div>
      </div>

      <div className="mt-6 bg-[#313044] p-6" style={{ borderRadius: '18px' }}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-2">
          <h3 className="text-white text-lg font-semibold">Wayfinder Directory</h3>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="search"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-[260px] pl-9 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
            />
          </div>
        </div>

        <p className="text-white/40 text-xs mb-4">
          <span className="text-[#FFC542]">Pending setup</span> means the wayfinder has not set a
          password yet. Use <span className="text-[#00CED1]">Resend setup link</span> to email a
          fresh invite (e.g. after an expired link).
        </p>

        {hasPendingSetup && (
          <div className="mb-4 rounded-xl px-4 py-3 text-xs bg-[#FFC542]/10 text-[#FFC542] border border-[#FFC542]/20">
            One or more wayfinders still need to complete password setup. Click{' '}
            <strong>Resend setup link</strong> on their row to send a new invite email.
          </div>
        )}

        {(actionMessage || actionError) && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm ${
              actionError
                ? 'bg-[#FF6F6F]/10 text-[#FF6F6F] border border-[#FF6F6F]/20'
                : 'bg-[#00CED1]/10 text-[#00CED1] border border-[#00CED1]/20'
            }`}
          >
            {actionError ?? actionMessage}
          </div>
        )}

        {wayfinders.length > 0 && (
          <div
            className={`hidden lg:grid ${ROW_GRID} px-6 pb-2 text-white/35 text-[11px] font-medium uppercase tracking-wider`}
          >
            <span>Wayfinder</span>
            <span>Students</span>
            <span>Status</span>
            <span>Phone</span>
            <span className="text-right">Actions</span>
          </div>
        )}

        {wayfindersQuery.isLoading && (
          <p className="text-white/50 text-sm py-8 text-center">Loading wayfinders…</p>
        )}
        {wayfindersQuery.isError && (
          <p className="text-[#FF6F6F] text-sm py-8 text-center">
            {getApiErrorMessage(wayfindersQuery.error)}
          </p>
        )}
        {!wayfindersQuery.isLoading && !wayfindersQuery.isError && wayfinders.length === 0 && (
          <p className="text-white/50 text-sm py-8 text-center">No wayfinders found.</p>
        )}

        <div className="flex flex-col" style={{ gap: '10px' }}>
          {wayfinders.map((w) => (
            <WayfinderRow
              key={w.id}
              w={w}
              onViewStudents={() => {
                setSelectedWayfinder(w)
                setStudentsOpen(true)
              }}
              onAssign={() => {
                setAssignWayfinderId(w.id)
                setAssignOpen(true)
              }}
              onResendInvite={() => {
                setActionMessage(null)
                setActionError(null)
                setResendingId(w.id)
                resendInviteMutation.mutate(w.id)
              }}
              isResending={resendingId === w.id && resendInviteMutation.isPending}
            />
          ))}
        </div>

        <ListPagination
          meta={meta}
          onPageChange={setPage}
          isLoading={wayfindersQuery.isFetching}
          itemLabel="wayfinders"
        />
      </div>

      <AddWayfinderModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false)
          setCreateError('')
        }}
        onSubmit={(payload) => createMutation.mutateAsync(payload)}
        isSubmitting={createMutation.isPending}
        error={createError}
      />

      <AssignChildModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        defaultWayfinderId={assignWayfinderId}
      />

      <WayfinderStudentsModal
        open={studentsOpen}
        wayfinder={selectedWayfinder}
        onClose={() => {
          setStudentsOpen(false)
          setSelectedWayfinder(null)
        }}
      />
    </AdminLayout>
  )
}
