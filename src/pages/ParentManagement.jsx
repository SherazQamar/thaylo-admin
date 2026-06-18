import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  ChevronDown,
  ChevronUp,
  UserPlus,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import AssignChildModal from '../components/AssignChildModal'
import ListPagination from '../components/ListPagination'
import { adminQueryKeys, fetchParents } from '../lib/admin-api'
import { getApiErrorMessage } from '../lib/auth-api'
import { formatPhoneDisplay } from '../lib/phone'
import { useDebouncedValue } from '../lib/useDebouncedValue'

function VerifiedBadge({ verified }) {
  return (
    <span
      className={
        'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (verified
          ? 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/5'
          : 'border-[#FF7B7B] text-[#FF7B7B] bg-[#FF7B7B]/5')
      }
    >
      {verified ? 'Verified' : 'Pending'}
    </span>
  )
}

function GuardianBox({ parent }) {
  const primary = parent.guardianType
    ? `${parent.guardianType}${parent.name ? ` · ${parent.name}` : ''}`
    : parent.name ?? '—'
  const secondary = parent.secondaryGuardianName
    ? `${parent.secondaryGuardianType ?? 'Guardian'} · ${parent.secondaryGuardianName}`
    : null

  return (
    <div
      className="rounded-2xl px-5 py-2.5 text-center"
      style={{ minWidth: '180px', backgroundColor: '#525162' }}
    >
      <p className="text-white text-sm font-semibold truncate">{primary}</p>
      <p className="text-white/60 text-xs mt-0.5 truncate">
        {secondary ?? formatPhoneDisplay(parent.phone)}
      </p>
    </div>
  )
}

/**
 * @param {{ child: import('../lib/admin-api').ParentChild; onAssign: () => void }} props
 */
function ChildRow({ child, onAssign }) {
  const isAssigned = !!child.wayfinderId

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
        <div className="min-w-0">
          <p className="text-white text-base font-semibold leading-tight">{child.userName}</p>
          <p className="text-white/40 text-sm mt-0.5">{child.grade ?? 'No grade'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ' +
            (isAssigned
              ? 'bg-[#00CED1]/10 text-[#00CED1]'
              : 'bg-[#FFC542]/10 text-[#FFC542]')
          }
        >
          {isAssigned ? 'Assigned' : 'Unassigned'}
        </span>
        {!isAssigned && (
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

/**
 * @param {{ p: import('../lib/admin-api').ParentListItem; expanded: boolean; onToggle: () => void; onAssignChild: (childId: number) => void }} props
 */
function ParentRow({ p, expanded, onToggle, onAssignChild }) {
  return (
    <div className={expanded ? 'pb-4' : ''}>
      <div
        className="grid items-center gap-4 px-5 py-4"
        style={{ gridTemplateColumns: '1.4fr 0.7fr 0.7fr 1.2fr auto' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
          <div className="min-w-0">
            <p className="text-white text-base font-semibold leading-tight truncate">
              {p.name ?? 'Unnamed'}
            </p>
            <p className="text-white/40 text-xs mt-0.5 truncate">{p.email}</p>
          </div>
        </div>

        <p className="text-[#00CED1] text-sm font-medium">
          {p.childrenCount} {p.childrenCount === 1 ? 'Child' : 'Children'}
        </p>

        <div>
          <VerifiedBadge verified={p.isEmailVerified} />
        </div>

        <GuardianBox parent={p} />

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onToggle}
            disabled={p.childrenCount === 0}
            className="w-8 h-8 rounded-full bg-[#00CED1]/15 border border-[#00CED1]/30 flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/25 disabled:opacity-30"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronUp size={15} strokeWidth={2} />
            ) : (
              <ChevronDown size={15} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {expanded && p.children.length > 0 && (
        <div
          className="mx-5 mt-1 flex flex-col"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '24px',
            gap: '16px',
          }}
        >
          {p.children.map((child) => (
            <ChildRow
              key={child.id}
              child={child}
              onAssign={() => onAssignChild(child.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ParentManagement() {
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignChildId, setAssignChildId] = useState(null)

  const debouncedSearch = useDebouncedValue(search)

  const parentsQuery = useQuery({
    queryKey: adminQueryKeys.parents({ page, search: debouncedSearch || undefined }),
    queryFn: () => fetchParents({ page, search: debouncedSearch || undefined }),
  })

  const parents = parentsQuery.data?.items ?? []
  const meta = parentsQuery.data?.meta

  return (
    <AdminLayout title="Parent Management" userSubtitle="Super Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          Parent Management
        </h2>
        <p className="text-white/50 text-sm">
          Overview of Thaylo Global AI School Parent Management.
        </p>
      </div>

      <div className="mt-6 bg-[#313044] p-6" style={{ borderRadius: '18px' }}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-white text-lg font-semibold">Parent Directory</h3>

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

        {parentsQuery.isLoading && (
          <p className="text-white/50 text-sm py-8 text-center">Loading parents…</p>
        )}
        {parentsQuery.isError && (
          <p className="text-[#FF6F6F] text-sm py-8 text-center">
            {getApiErrorMessage(parentsQuery.error)}
          </p>
        )}
        {!parentsQuery.isLoading && !parentsQuery.isError && parents.length === 0 && (
          <p className="text-white/50 text-sm py-8 text-center">No parents found.</p>
        )}

        <div className="flex flex-col divide-y divide-white/5">
          {parents.map((p) => (
            <ParentRow
              key={p.id}
              p={p}
              expanded={expandedId === p.id}
              onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
              onAssignChild={(childId) => {
                setAssignChildId(childId)
                setAssignOpen(true)
              }}
            />
          ))}
        </div>

        <ListPagination
          meta={meta}
          onPageChange={setPage}
          isLoading={parentsQuery.isFetching}
          itemLabel="parents"
        />
      </div>

      <AssignChildModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        defaultChildId={assignChildId}
      />
    </AdminLayout>
  )
}
