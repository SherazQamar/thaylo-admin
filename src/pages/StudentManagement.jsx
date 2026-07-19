import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import ListPagination from '../components/ListPagination'
import { adminQueryKeys, fetchStudents } from '../lib/admin-api'
import { getApiErrorMessage } from '../lib/auth-api'
import { formatStudentName } from '../lib/student'
import { useDebouncedValue } from '../lib/useDebouncedValue'

function AssignmentBadge({ assigned }) {
  return (
    <span
      className={
        'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (assigned
          ? 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/5'
          : 'border-[#FFC542] text-[#FFC542] bg-[#FFC542]/5')
      }
    >
      {assigned ? 'Assigned' : 'Unassigned'}
    </span>
  )
}

const ROW_GRID =
  'grid items-center gap-4 grid-cols-1 lg:grid-cols-[1.5fr_0.6fr_1.2fr_1fr_0.8fr_auto]'

/**
 * @param {{ student: import('../lib/admin-api').StudentListItem; onOpen: () => void }} props
 */
function StudentRow({ student, onOpen }) {
  const displayName = formatStudentName(student)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full ${ROW_GRID} text-left hover:bg-white/[0.02] transition-colors`}
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
            {displayName}
          </p>
          <p className="text-white/40 text-xs mt-0.5 truncate">@{student.userName}</p>
        </div>
      </div>

      <p className="text-white/70 text-sm">{student.grade ?? '—'}</p>

      <div className="min-w-0">
        <p className="text-white/80 text-sm truncate">
          {student.parent.name ?? 'Unnamed'}
        </p>
        <p className="text-white/40 text-xs mt-0.5 truncate">{student.parent.email}</p>
      </div>

      <div className="min-w-0">
        {student.wayfinder ? (
          <>
            <p className="text-white/80 text-sm truncate">
              {student.wayfinder.name ?? 'Unnamed'}
            </p>
            <p className="text-white/40 text-xs mt-0.5 truncate">
              {student.wayfinder.specialty ?? student.wayfinder.email}
            </p>
          </>
        ) : (
          <p className="text-white/40 text-sm">No wayfinder</p>
        )}
      </div>

      <div>
        <AssignmentBadge assigned={!!student.wayfinderId} />
      </div>

      <ChevronRight size={18} className="text-[#00CED1] shrink-0 justify-self-end" />
    </button>
  )
}

function ColumnHeaders() {
  return (
    <div
      className={`hidden lg:grid ${ROW_GRID} px-6 pb-2 text-white/35 text-[11px] font-medium uppercase tracking-wider`}
    >
      <span>Student</span>
      <span>Grade</span>
      <span>Parent</span>
      <span>Wayfinder</span>
      <span>Status</span>
      <span className="sr-only">Open</span>
    </div>
  )
}

/**
 * @param {{
 *   title: string;
 *   description?: string;
 *   accent?: 'priority' | 'default';
 *   students: import('../lib/admin-api').StudentListItem[];
 *   meta: import('../lib/admin-api').PaginationMeta | null | undefined;
 *   isLoading: boolean;
 *   isFetching: boolean;
 *   isError: boolean;
 *   error: unknown;
 *   emptyMessage: string;
 *   page: number;
 *   onPageChange: (page: number) => void;
 *   onOpenStudent: (id: number) => void;
 *   searchSlot?: React.ReactNode;
 * }} props
 */
function StudentListSection({
  title,
  description,
  accent = 'default',
  students,
  meta,
  isLoading,
  isFetching,
  isError,
  error,
  emptyMessage,
  onPageChange,
  onOpenStudent,
  searchSlot,
}) {
  const borderClass =
    accent === 'priority'
      ? 'border border-[#FFC542]/25'
      : 'border border-transparent'

  return (
    <div className={`mt-6 bg-[#313044] p-6 ${borderClass}`} style={{ borderRadius: '18px' }}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          {description ? (
            <p className="text-white/40 text-xs mt-1">{description}</p>
          ) : null}
        </div>
        {searchSlot}
      </div>

      {isLoading && (
        <p className="text-white/50 text-sm py-8 text-center">Loading students…</p>
      )}
      {isError && (
        <p className="text-[#FF6F6F] text-sm py-8 text-center">
          {getApiErrorMessage(error)}
        </p>
      )}
      {!isLoading && !isError && students.length === 0 && (
        <p className="text-white/50 text-sm py-8 text-center">{emptyMessage}</p>
      )}

      {!isLoading && !isError && students.length > 0 && (
        <>
          <div className="mt-4">
            <ColumnHeaders />
          </div>
          <div className="flex flex-col" style={{ gap: '10px' }}>
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                onOpen={() => onOpenStudent(student.id)}
              />
            ))}
          </div>
        </>
      )}

      <ListPagination
        meta={meta}
        onPageChange={onPageChange}
        isLoading={isFetching}
        itemLabel="students"
      />
    </div>
  )
}

export default function StudentManagement() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [unassignedPage, setUnassignedPage] = useState(1)
  const [directoryPage, setDirectoryPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const searchParam = debouncedSearch || undefined

  const unassignedQuery = useQuery({
    queryKey: adminQueryKeys.students({
      page: unassignedPage,
      search: searchParam,
      assignment: 'unassigned',
    }),
    queryFn: () =>
      fetchStudents({
        page: unassignedPage,
        search: searchParam,
        assignment: 'unassigned',
      }),
  })

  const directoryQuery = useQuery({
    queryKey: adminQueryKeys.students({
      page: directoryPage,
      search: searchParam,
      assignment: 'all',
    }),
    queryFn: () =>
      fetchStudents({
        page: directoryPage,
        search: searchParam,
        assignment: 'all',
      }),
  })

  const unassignedStudents = unassignedQuery.data?.items ?? []
  const directoryStudents = directoryQuery.data?.items ?? []

  const searchInput = (
    <div className="relative">
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
      />
      <input
        type="search"
        placeholder="Search by student or parent"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setUnassignedPage(1)
          setDirectoryPage(1)
        }}
        className="w-full sm:w-[280px] pl-9 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
      />
    </div>
  )

  return (
    <AdminLayout title="Student Management" userSubtitle="Super Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          Student Management
        </h2>
        <p className="text-white/50 text-sm">
          Priority queue for students without a wayfinder, then the full directory — both sorted by
          last name.
        </p>
      </div>

      <StudentListSection
        title="Needs Wayfinder"
        description="New and unassigned students, A–Z by last name. Assign these first."
        accent="priority"
        students={unassignedStudents}
        meta={unassignedQuery.data?.meta}
        isLoading={unassignedQuery.isLoading}
        isFetching={unassignedQuery.isFetching}
        isError={unassignedQuery.isError}
        error={unassignedQuery.error}
        emptyMessage={
          searchParam
            ? 'No unassigned students match your search.'
            : 'All students currently have a wayfinder assigned.'
        }
        page={unassignedPage}
        onPageChange={setUnassignedPage}
        onOpenStudent={(id) => navigate(`/students/${id}`)}
        searchSlot={searchInput}
      />

      <StudentListSection
        title="All Students"
        description="Full directory including unassigned students, A–Z by last name."
        students={directoryStudents}
        meta={directoryQuery.data?.meta}
        isLoading={directoryQuery.isLoading}
        isFetching={directoryQuery.isFetching}
        isError={directoryQuery.isError}
        error={directoryQuery.error}
        emptyMessage={searchParam ? 'No students match your search.' : 'No students found.'}
        page={directoryPage}
        onPageChange={setDirectoryPage}
        onOpenStudent={(id) => navigate(`/students/${id}`)}
      />
    </AdminLayout>
  )
}
