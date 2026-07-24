import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, Plus, UserPlus, Users, Mail, X } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import AddWayfinderModal from '../components/AddWayfinderModal'
import AssignChildModal from '../components/AssignChildModal'
import WayfinderStudentsModal from '../components/WayfinderStudentsModal'
import ListPagination from '../components/ListPagination'
import { adminQueryKeys, createWayfinder, fetchWayfinders, resendWayfinderInvite } from '../lib/admin-api'
import { getApiErrorMessage } from '../lib/auth-api'
import { formatPhoneDisplay } from '../lib/phone'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import { hiringRegionByCode } from '../lib/wayfinder-hiring-regions'

function formatWayfinderRegion(region) {
  const match = hiringRegionByCode(region)
  if (match) return match.label
  return region?.trim() || '—'
}

function AccountStatusBadge({ invitePending, isOnline }) {
  if (invitePending) {
    return (
      <span className="inline-flex items-center justify-center rounded-full border border-[#FFC542] text-[#FFC542] bg-[#FFC542]/5 px-3 py-1 text-xs font-medium">
        Pending setup
      </span>
    )
  }

  if (isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 justify-center rounded-full border border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        Online
      </span>
    )
  }

  return (
    <span className="inline-flex items-center justify-center rounded-full border border-white/25 text-white/50 bg-white/[0.04] px-3 py-1 text-xs font-medium">
      Offline
    </span>
  )
}

const ROW_GRID =
  'grid items-center gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-[1.4fr_0.55fr_0.9fr_0.9fr_0.7fr_0.75fr_auto]'

/**
 * @param {{ w: import('../lib/admin-api').WayfinderListItem; onViewStudents: () => void; onAssign: () => void; onResendInvite: () => void; isResending: boolean }} props
 */
function WayfinderRow({ w, onViewStudents, onAssign, onResendInvite, isResending }) {
  const languages =
    w.languagesSpoken?.length > 0 ? w.languagesSpoken.join(', ') : '—'

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

      <p className="text-white/80 text-sm font-medium lg:justify-self-start">
        {formatWayfinderRegion(w.region)}
      </p>

      <p className="text-white/60 text-sm truncate lg:justify-self-start" title={languages}>
        {languages}
      </p>

      <button
        type="button"
        onClick={onViewStudents}
        className="text-left text-[#00CED1] text-sm font-medium hover:underline lg:justify-self-start"
      >
        {w.childrenCount} Students
      </button>

      <div className="lg:justify-self-start">
        <AccountStatusBadge invitePending={w.invitePending} isOnline={w.isOnline} />
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

function ColumnHeaders() {
  return (
    <div
      className={`hidden lg:grid ${ROW_GRID} px-6 pb-2 text-white/35 text-[11px] font-medium uppercase tracking-wider`}
    >
      <span>Wayfinder</span>
      <span>Hiring region</span>
      <span>Languages</span>
      <span>Students</span>
      <span>Status</span>
      <span>Phone</span>
      <span className="text-right">Actions</span>
    </div>
  )
}

/**
 * @param {{
 *   title: string;
 *   description?: string;
 *   accent?: 'priority' | 'default';
 *   wayfinders: import('../lib/admin-api').WayfinderListItem[];
 *   meta: import('../lib/admin-api').PaginationMeta | null | undefined;
 *   isLoading: boolean;
 *   isFetching: boolean;
 *   isError: boolean;
 *   error: unknown;
 *   emptyMessage: string;
 *   onPageChange: (page: number) => void;
 *   searchSlot?: React.ReactNode;
 *   banner?: React.ReactNode;
 *   onViewStudents: (w: import('../lib/admin-api').WayfinderListItem) => void;
 *   onAssign: (w: import('../lib/admin-api').WayfinderListItem) => void;
 *   onResendInvite: (w: import('../lib/admin-api').WayfinderListItem) => void;
 *   resendingId: number | null;
 *   isResending: boolean;
 * }} props
 */
function WayfinderListSection({
  title,
  description,
  accent = 'default',
  wayfinders,
  meta,
  isLoading,
  isFetching,
  isError,
  error,
  emptyMessage,
  onPageChange,
  searchSlot,
  banner,
  onViewStudents,
  onAssign,
  onResendInvite,
  resendingId,
  isResending,
}) {
  const borderClass =
    accent === 'priority' ? 'border border-[#FFC542]/25' : 'border border-transparent'

  return (
    <div className={`mt-6 bg-[#313044] p-6 ${borderClass}`} style={{ borderRadius: '18px' }}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          {description ? <p className="text-white/40 text-xs mt-1">{description}</p> : null}
        </div>
        {searchSlot}
      </div>

      {banner}

      {isLoading && (
        <p className="text-white/50 text-sm py-8 text-center">Loading wayfinders…</p>
      )}
      {isError && (
        <p className="text-[#FF6F6F] text-sm py-8 text-center">{getApiErrorMessage(error)}</p>
      )}
      {!isLoading && !isError && wayfinders.length === 0 && (
        <p className="text-white/50 text-sm py-8 text-center">{emptyMessage}</p>
      )}

      {!isLoading && !isError && wayfinders.length > 0 && (
        <>
          <div className="mt-4">
            <ColumnHeaders />
          </div>
          <div className="flex flex-col" style={{ gap: '10px' }}>
            {wayfinders.map((w) => (
              <WayfinderRow
                key={w.id}
                w={w}
                onViewStudents={() => onViewStudents(w)}
                onAssign={() => onAssign(w)}
                onResendInvite={() => onResendInvite(w)}
                isResending={resendingId === w.id && isResending}
              />
            ))}
          </div>
        </>
      )}

      <ListPagination
        meta={meta}
        onPageChange={onPageChange}
        isLoading={isFetching}
        itemLabel="wayfinders"
      />
    </div>
  )
}

export default function WayfinderManagement() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const onlineOnly = searchParams.get('status') === 'active'
  const [addOpen, setAddOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignMode, setAssignMode] = useState('assign')
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [selectedWayfinder, setSelectedWayfinder] = useState(null)
  const [assignWayfinderId, setAssignWayfinderId] = useState(null)
  const [assignChildId, setAssignChildId] = useState(null)
  const [search, setSearch] = useState('')
  const [unassignedPage, setUnassignedPage] = useState(1)
  const [directoryPage, setDirectoryPage] = useState(1)
  const [onlinePage, setOnlinePage] = useState(1)
  const [createError, setCreateError] = useState('')
  const [resendingId, setResendingId] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [actionError, setActionError] = useState(null)

  const debouncedSearch = useDebouncedValue(search)
  const searchParam = debouncedSearch || undefined

  const unassignedParams = {
    page: unassignedPage,
    search: searchParam,
    assignment: 'unassigned',
  }

  const directoryParams = {
    page: directoryPage,
    search: searchParam,
    assignment: 'all',
  }

  const onlineParams = {
    page: onlinePage,
    search: searchParam,
    status: 'active',
  }

  const unassignedQuery = useQuery({
    queryKey: adminQueryKeys.wayfinders(unassignedParams),
    queryFn: () => fetchWayfinders(unassignedParams),
    enabled: !onlineOnly,
  })

  const directoryQuery = useQuery({
    queryKey: adminQueryKeys.wayfinders(directoryParams),
    queryFn: () => fetchWayfinders(directoryParams),
    enabled: !onlineOnly,
  })

  const onlineQuery = useQuery({
    queryKey: adminQueryKeys.wayfinders(onlineParams),
    queryFn: () => fetchWayfinders(onlineParams),
    enabled: onlineOnly,
  })

  const clearOnlineFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('status')
    setSearchParams(next)
    setOnlinePage(1)
  }

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

  const rowHandlers = {
    onViewStudents: (w) => {
      setSelectedWayfinder(w)
      setStudentsOpen(true)
    },
    onAssign: (w) => {
      setAssignMode('assign')
      setAssignWayfinderId(w.id)
      setAssignChildId(null)
      setAssignOpen(true)
    },
    onResendInvite: (w) => {
      setActionMessage(null)
      setActionError(null)
      setResendingId(w.id)
      resendInviteMutation.mutate(w.id)
    },
    resendingId,
    isResending: resendInviteMutation.isPending,
  }

  const searchInput = (
    <div className="relative">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        type="search"
        placeholder="Search by name, email, or region"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setUnassignedPage(1)
          setDirectoryPage(1)
          setOnlinePage(1)
        }}
        className="w-full sm:w-[280px] pl-9 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
      />
    </div>
  )

  const actionBanner =
    actionMessage || actionError ? (
      <div
        className={`mb-4 rounded-xl px-4 py-3 text-sm ${
          actionError
            ? 'bg-[#FF6F6F]/10 text-[#FF6F6F] border border-[#FF6F6F]/20'
            : 'bg-[#00CED1]/10 text-[#00CED1] border border-[#00CED1]/20'
        }`}
      >
        {actionError ?? actionMessage}
      </div>
    ) : null

  return (
    <AdminLayout title="Wayfinder Management" userSubtitle="Super Admin">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            Wayfinder Management
          </h2>
          <p className="text-white/50 text-sm">
            Priority queue for wayfinders without students, then the full directory — sorted by
            region, then last name.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setAssignMode('assign')
              setAssignWayfinderId(null)
              setAssignChildId(null)
              setAssignOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-semibold px-5 py-2.5 transition-colors w-full sm:w-auto"
          >
            <Users size={16} />
            Assign Child
          </button>
          <button
            type="button"
            onClick={() => {
              setAssignMode('reassign')
              setAssignWayfinderId(null)
              setAssignChildId(null)
              setAssignOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-semibold px-5 py-2.5 transition-colors w-full sm:w-auto"
          >
            <Users size={16} />
            Reassign
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-5 py-2.5 transition-colors w-full sm:w-auto"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Wayfinder
          </button>
        </div>
      </div>

      {onlineOnly ? (
        <WayfinderListSection
          title="Online Wayfinders"
          description="Wayfinders currently on the platform. Sorted by region, then last name."
          wayfinders={onlineQuery.data?.items ?? []}
          meta={onlineQuery.data?.meta}
          isLoading={onlineQuery.isLoading}
          isFetching={onlineQuery.isFetching}
          isError={onlineQuery.isError}
          error={onlineQuery.error}
          emptyMessage={
            searchParam
              ? 'No online wayfinders match your search.'
              : 'No wayfinders are online right now.'
          }
          onPageChange={setOnlinePage}
          searchSlot={searchInput}
          banner={
            <>
              <div className="mb-4 rounded-xl px-4 py-3 text-sm bg-[#00CED1]/10 text-[#00CED1] border border-[#00CED1]/20 flex items-center justify-between gap-3">
                <span>
                  Showing wayfinders currently online (seen in the last ~90 seconds).
                </span>
                <button
                  type="button"
                  onClick={clearOnlineFilter}
                  className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <X size={12} />
                  Clear filter
                </button>
              </div>
              {actionBanner}
            </>
          }
          {...rowHandlers}
        />
      ) : (
        <>
          <WayfinderListSection
            title="Needs Students"
            description="New wayfinders not yet assigned to any student — by region, then last name."
            accent="priority"
            wayfinders={unassignedQuery.data?.items ?? []}
            meta={unassignedQuery.data?.meta}
            isLoading={unassignedQuery.isLoading}
            isFetching={unassignedQuery.isFetching}
            isError={unassignedQuery.isError}
            error={unassignedQuery.error}
            emptyMessage={
              searchParam
                ? 'No unassigned wayfinders match your search.'
                : 'Every wayfinder currently has at least one student.'
            }
            onPageChange={setUnassignedPage}
            searchSlot={searchInput}
            banner={
              <>
                <p className="text-white/40 text-xs mb-4">
                  <span className="text-[#22C55E]">Online</span> means they are using the platform
                  right now. <span className="text-[#FFC542]">Pending setup</span> means they have
                  not set a password yet.
                </p>
                {actionBanner}
              </>
            }
            {...rowHandlers}
          />

          <WayfinderListSection
            title="All Wayfinders"
            description="Full directory including unassigned — by region, then last name."
            wayfinders={directoryQuery.data?.items ?? []}
            meta={directoryQuery.data?.meta}
            isLoading={directoryQuery.isLoading}
            isFetching={directoryQuery.isFetching}
            isError={directoryQuery.isError}
            error={directoryQuery.error}
            emptyMessage={
              searchParam ? 'No wayfinders match your search.' : 'No wayfinders found.'
            }
            onPageChange={setDirectoryPage}
            {...rowHandlers}
          />
        </>
      )}

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
        onClose={() => {
          setAssignOpen(false)
          setAssignChildId(null)
          setAssignMode('assign')
        }}
        mode={assignMode}
        defaultWayfinderId={assignMode === 'assign' ? assignWayfinderId : null}
        defaultChildId={assignChildId}
      />

      <WayfinderStudentsModal
        open={studentsOpen}
        wayfinder={selectedWayfinder}
        onClose={() => {
          setStudentsOpen(false)
          setSelectedWayfinder(null)
        }}
        onReassign={(student) => {
          setStudentsOpen(false)
          setSelectedWayfinder(null)
          setAssignMode('reassign')
          setAssignChildId(student.id)
          setAssignWayfinderId(null)
          setAssignOpen(true)
        }}
      />
    </AdminLayout>
  )
}
