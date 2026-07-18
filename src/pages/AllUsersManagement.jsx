import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Pencil,
  UserRound,
  Trash2,
  SlidersHorizontal,
  Eye,
  FileText,
  ChevronDown,
} from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ListPagination from '../components/ListPagination'
import { getApiErrorMessage } from '../lib/auth-api'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import {
  ASSIGNABLE_ROLES,
  fetchSystemUsers,
  formatSystemRole,
  systemUserQueryKeys,
  updateSystemUserRole,
} from '../lib/system-users-api'

const TABS = ['ALL USERS', 'ADMIN', 'WAY FINDERS', 'PARENTS', 'STUDENTS', 'ROLES']

/* ============================================================
   Shared atoms
============================================================ */

function StatusPill({ status }) {
  const map = {
    Active: 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10',
    Inactive: 'border-[#FF7B7B] text-[#FF7B7B] bg-[#FF7B7B]/5',
    Online: 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10',
  }
  return (
    <span
      className={
        'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (map[status] || 'border-white/20 text-white/60 bg-white/5')
      }
    >
      {status}
    </span>
  )
}

function YellowPill({ children }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1"
      style={{ backgroundColor: '#FFC542', color: '#111023' }}
    >
      {children}
    </span>
  )
}

function PurplePill({ children }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-xs font-semibold px-3 py-1"
      style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
    >
      {children}
    </span>
  )
}

function RiskText({ level }) {
  const colors = {
    Low: '#FF9D4D',
    Medium: '#FFC542',
    High: '#FF6F6F',
  }
  return (
    <span
      className="text-sm font-semibold"
      style={{ color: colors[level] || '#FFFFFF' }}
    >
      {level}
    </span>
  )
}

function ActionButton({ icon: Icon, label }) {
  return (
    <button
      type="button"
      className="w-7 h-7 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
      aria-label={label}
    >
      <Icon size={14} strokeWidth={1.75} />
    </button>
  )
}

function ActionGroup({ items }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {items.map((it, i) => (
        <ActionButton key={i} icon={it.icon} label={it.label} />
      ))}
    </div>
  )
}

function HeaderRow({ title, sub, button }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-white/50 text-sm">{sub}</p>
      </div>
      {button}
    </div>
  )
}

function ActionPillButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start sm:self-auto bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-6 py-2.5 transition-colors"
      style={{ borderRadius: '10px' }}
    >
      {label}
    </button>
  )
}

function Card({ title, search = 'Search User', filter = false, children }) {
  return (
    <div
      className="mt-6 rounded-2xl p-6"
      style={{ backgroundColor: '#313044', borderRadius: '18px' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h3 className="text-white text-lg font-semibold">{title}</h3>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="search"
              placeholder={search}
              className="w-[300px] pl-9 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
            />
          </div>
          {filter && (
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/5 flex items-center justify-center text-white/60 hover:bg-white/[0.1]"
              aria-label="Filter"
            >
              <SlidersHorizontal size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th
      className={
        'font-semibold py-3 px-4 text-white/60 text-xs uppercase tracking-wider ' +
        (align === 'right' ? 'text-right' : 'text-left')
      }
    >
      {children}
    </th>
  )
}

function Td({ children, className = '', align = 'left' }) {
  return (
    <td
      className={
        'py-3.5 px-4 text-sm ' +
        (align === 'right' ? 'text-right ' : '') +
        className
      }
    >
      {children}
    </td>
  )
}

function Row({ children, striped }) {
  return (
    <tr
      style={{
        backgroundColor: striped ? 'rgba(255,255,255,0.04)' : 'transparent',
      }}
    >
      {children}
    </tr>
  )
}

/* ============================================================
   Tab views
============================================================ */

const ALL_USERS = [
  { name: 'Amanda', role: 'Student', status: 'Active', last: '2h Ago' },
  { name: 'Sara', role: 'Parent', status: 'Inactive', last: '1d Ago' },
  { name: 'John', role: 'Way Finder', status: 'Active', last: '3h Ago' },
  { name: 'Emma', role: 'Admin', status: 'Inactive', last: 'Now' },
  { name: 'Alex', role: 'Super Admin', status: 'Active', last: 'Now' },
]

function AllUsersView() {
  return (
    <>
      <HeaderRow
        title="All Users Management"
        sub="Overview of Thaylo Global AI School Parent Management."
        button={<ActionPillButton label="Create User" />}
      />
      <Card title="All Users">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last Active</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {ALL_USERS.map((u, i) => (
              <Row key={i} striped={i % 2 === 0}>
                <Td className="text-white font-medium">{u.name}</Td>
                <Td className="text-white/70">{u.role}</Td>
                <Td>
                  <StatusPill status={u.status} />
                </Td>
                <Td className="text-[#00CED1]">{u.last}</Td>
                <Td align="right">
                  <ActionGroup
                    items={[
                      { icon: Pencil, label: 'Edit' },
                      { icon: UserRound, label: 'View' },
                      { icon: Trash2, label: 'Delete' },
                    ]}
                  />
                </Td>
              </Row>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

const ADMINS = [
  { name: 'Alex Filler', region: 'Pakistan', status: 'Active', plan: 'Premium' },
  { name: 'Alex Filler', region: 'Pakistan', status: 'Active', plan: 'Premium' },
  { name: 'Alex Filler', region: 'Pakistan', status: 'Active', plan: 'Premium' },
]

function AdminView() {
  return (
    <>
      <HeaderRow
        title="Admin Management"
        sub="Overview of Thaylo Global AI School Parent Management."
        button={<ActionPillButton label="Create Organization" />}
      />
      <Card title="Admin">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Region</Th>
              <Th>Active Users</Th>
              <Th>Plan</Th>
            </tr>
          </thead>
          <tbody>
            {ADMINS.map((u, i) => (
              <Row key={i} striped={i % 2 === 0}>
                <Td className="text-white/80">{u.name}</Td>
                <Td className="text-white/70">{u.region}</Td>
                <Td>
                  <StatusPill status={u.status} />
                </Td>
                <Td>
                  <YellowPill>{u.plan}</YellowPill>
                </Td>
              </Row>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

const WAYFINDERS = [
  {
    name: 'Ali Khan',
    caseload: '12/15',
    active: '9 Active',
    alerts: '3 alerts',
    risk: 'Medium',
    status: 'Online',
    last: '2h Ago',
  },
  {
    name: 'Sara Lee',
    caseload: '15/15',
    active: '14 Active',
    alerts: '6 alerts',
    risk: 'High',
    status: 'Online',
    last: '2h Ago',
  },
]

function WayFindersView() {
  return (
    <>
      <HeaderRow
        title="Way finder Management"
        sub="Overview of Thaylo Global AI School Parent Management."
        button={<ActionPillButton label="Create Organization" />}
      />
      <Card title="Way finders">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Caseload</Th>
              <Th>Active Student</Th>
              <Th>Alerts</Th>
              <Th>Risk level</Th>
              <Th>Status</Th>
              <Th>Last Active</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {WAYFINDERS.map((u, i) => (
              <Row key={i} striped={i % 2 === 0}>
                <Td className="text-white/80">{u.name}</Td>
                <Td className="text-white/70">{u.caseload}</Td>
                <Td>
                  <YellowPill>{u.active}</YellowPill>
                </Td>
                <Td className="text-white/70">{u.alerts}</Td>
                <Td>
                  <RiskText level={u.risk} />
                </Td>
                <Td>
                  <StatusPill status={u.status} />
                </Td>
                <Td className="text-[#00CED1]">{u.last}</Td>
                <Td align="right">
                  <ActionGroup
                    items={[
                      { icon: Pencil, label: 'Edit' },
                      { icon: UserRound, label: 'View' },
                    ]}
                  />
                </Td>
              </Row>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

const PARENTS = [
  {
    name: 'Ali Khan',
    email: 'ali@email.com',
    children: '2 (Fatima, Ahmed)',
    sub: 'Premium',
    status: 'Active',
    last: '2h Ago',
  },
  {
    name: 'Ali Khan',
    email: 'ali@email.com',
    children: '2 (Fatima, Ahmed)',
    sub: 'Premium',
    status: 'Active',
    last: '2h Ago',
  },
]

function ParentsView() {
  return (
    <>
      <HeaderRow
        title="Parent Management"
        sub="Overview of Thaylo Global AI School Parent Management."
        button={<ActionPillButton label="Add family" />}
      />
      <Card title="Parents" search="Search with name or email" filter>
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr>
              <Th>Parent Name</Th>
              <Th>Email</Th>
              <Th>Children</Th>
              <Th>Subscription</Th>
              <Th>Status</Th>
              <Th>Last Active</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {PARENTS.map((u, i) => (
              <Row key={i} striped={i % 2 === 0}>
                <Td className="text-white/80">{u.name}</Td>
                <Td className="text-white/70">{u.email}</Td>
                <Td className="text-white/70">{u.children}</Td>
                <Td>
                  <PurplePill>{u.sub}</PurplePill>
                </Td>
                <Td>
                  <StatusPill status={u.status} />
                </Td>
                <Td className="text-[#00CED1]">{u.last}</Td>
                <Td align="right">
                  <ActionGroup
                    items={[
                      { icon: Pencil, label: 'Edit' },
                      { icon: FileText, label: 'Docs' },
                      { icon: UserRound, label: 'View' },
                    ]}
                  />
                </Td>
              </Row>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

const STUDENTS = [
  {
    student: 'Fatima Khan',
    grade: '4',
    parent: 'Ali khan',
    progress: 90,
    sel: 'Low',
    last: '2h Ago',
    wf: 'Sara',
  },
  {
    student: 'Fatima Khan',
    grade: '4',
    parent: 'Ali khan',
    progress: 40,
    sel: 'Medium',
    last: '2h Ago',
    wf: 'Sara',
  },
]

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[100px] h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#00CED1]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-white text-sm font-semibold">{value}</span>
    </div>
  )
}

function StudentsView() {
  return (
    <>
      <HeaderRow
        title="Student Management"
        sub="Overview of Thaylo Global AI School Parent Management."
        button={<ActionPillButton label="Export data" />}
      />
      <Card title="Parents" search="Search with name or email" filter>
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr>
              <Th>Student</Th>
              <Th>Grade</Th>
              <Th>Parent</Th>
              <Th>Progress</Th>
              <Th>SEL Status</Th>
              <Th>Last Lesson</Th>
              <Th>Way finder</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((u, i) => (
              <Row key={i} striped={i % 2 === 0}>
                <Td className="text-white/80">{u.student}</Td>
                <Td className="text-white/70">{u.grade}</Td>
                <Td className="text-white/70">{u.parent}</Td>
                <Td>
                  <ProgressBar value={u.progress} />
                </Td>
                <Td>
                  <RiskText level={u.sel} />
                </Td>
                <Td className="text-[#00CED1]">{u.last}</Td>
                <Td className="text-white/70">{u.wf}</Td>
                <Td align="right">
                  <ActionGroup
                    items={[
                      { icon: Pencil, label: 'Edit' },
                      { icon: Eye, label: 'View' },
                      { icon: Trash2, label: 'Delete' },
                    ]}
                  />
                </Td>
              </Row>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

function RolesView() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const debouncedSearch = useDebouncedValue(search)

  const listParams = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  }

  const usersQuery = useQuery({
    queryKey: systemUserQueryKeys.list(listParams),
    queryFn: () => fetchSystemUsers(listParams),
  })

  const updateMutation = useMutation({
    mutationFn: ({ userId, role }) => updateSystemUserRole(userId, role),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] })
      setUpdatingId(null)
      setActionError(null)
      setActionMessage(
        `Updated ${updated.name ?? updated.email} to ${formatSystemRole(updated.role)}.`,
      )
    },
    onError: (err) => {
      setUpdatingId(null)
      setActionMessage(null)
      setActionError(getApiErrorMessage(err))
    },
  })

  const users = usersQuery.data?.items ?? []
  const meta = usersQuery.data?.meta

  return (
    <>
      <HeaderRow
        title="Role Management"
        sub="Assign or change roles for administrators, wayfinders, and other accounts."
      />

      <div
        className="mt-6 rounded-2xl p-6"
        style={{ backgroundColor: '#313044', borderRadius: '18px' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-white text-lg font-semibold">Roles</h3>
            <p className="text-white/40 text-xs mt-1">
              Role changes apply immediately. Only Super Admins can manage roles.
            </p>
          </div>

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
              className="w-full sm:w-[300px] pl-9 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
            />
          </div>
        </div>

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

        {usersQuery.isLoading && (
          <p className="text-white/50 text-sm py-8 text-center">Loading users…</p>
        )}
        {usersQuery.isError && (
          <p className="text-[#FF6F6F] text-sm py-8 text-center">
            {getApiErrorMessage(usersQuery.error)}
          </p>
        )}
        {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
          <p className="text-white/50 text-sm py-8 text-center">No users found.</p>
        )}

        {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Current Role</Th>
                  <Th>Status</Th>
                  <Th align="right">Assign / Change Role</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <Row key={u.id} striped={i % 2 === 0}>
                    <Td className="text-white font-medium">{u.name ?? 'Unnamed'}</Td>
                    <Td className="text-white/70">{u.email}</Td>
                    <Td>
                      <span className="inline-flex items-center justify-center rounded-full border border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10 px-3 py-1 text-xs font-medium">
                        {formatSystemRole(u.role)}
                      </span>
                    </Td>
                    <Td>
                      <StatusPill status={u.isActive ? 'Active' : 'Inactive'} />
                    </Td>
                    <Td align="right">
                      <div className="relative inline-flex items-center">
                        <select
                          value={u.role}
                          disabled={updatingId === u.id && updateMutation.isPending}
                          onChange={(e) => {
                            const nextRole = e.target.value
                            if (nextRole === u.role) return
                            setActionError(null)
                            setActionMessage(null)
                            setUpdatingId(u.id)
                            updateMutation.mutate({ userId: u.id, role: nextRole })
                          }}
                          className="appearance-none rounded-full bg-white/[0.06] border border-white/10 text-white text-xs font-semibold pl-4 pr-9 py-2 outline-none focus:border-[#00CED1]/40 disabled:opacity-50"
                        >
                          {ASSIGNABLE_ROLES.map((role) => (
                            <option
                              key={role.value}
                              value={role.value}
                              className="bg-[#313044]"
                            >
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 text-white/50 pointer-events-none"
                        />
                      </div>
                    </Td>
                  </Row>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ListPagination
          meta={meta}
          onPageChange={setPage}
          isLoading={usersQuery.isFetching}
          itemLabel="users"
        />
      </div>
    </>
  )
}

/* ============================================================
   Page
============================================================ */

export default function AllUsersManagement() {
  const [activeTab, setActiveTab] = useState('ALL USERS')

  return (
    <SuperAdminLayout
      title="Super Admin Dashboard"
      userSubtitle="Wayfinder"
    >
      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-white/5 -mx-6 lg:-mx-10 px-6 lg:px-10 mb-6 overflow-x-auto">
        {TABS.map((t) => {
          const active = activeTab === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={
                'pb-3 text-[13px] font-semibold tracking-wider transition-colors border-b-2 -mb-px whitespace-nowrap ' +
                (active
                  ? 'text-[#00CED1] border-[#00CED1]'
                  : 'text-white/50 border-transparent hover:text-white')
              }
            >
              {t}
            </button>
          )
        })}
      </div>

      {activeTab === 'ALL USERS' && <AllUsersView />}
      {activeTab === 'ADMIN' && <AdminView />}
      {activeTab === 'WAY FINDERS' && <WayFindersView />}
      {activeTab === 'PARENTS' && <ParentsView />}
      {activeTab === 'STUDENTS' && <StudentsView />}
      {activeTab === 'ROLES' && <RolesView />}
    </SuperAdminLayout>
  )
}
