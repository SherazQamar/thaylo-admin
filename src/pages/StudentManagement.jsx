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

/**
 * @param {{ student: import('../lib/admin-api').StudentListItem; onOpen: () => void }} props
 */
function StudentRow({ student, onOpen }) {
  const displayName = formatStudentName(student)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full grid items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      style={{
        gridTemplateColumns: '1.5fr 0.6fr 1.2fr 1fr 0.8fr auto',
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

      <ChevronRight size={18} className="text-[#00CED1] shrink-0" />
    </button>
  )
}

export default function StudentManagement() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const studentsQuery = useQuery({
    queryKey: adminQueryKeys.students({ page, search: debouncedSearch || undefined }),
    queryFn: () => fetchStudents({ page, search: debouncedSearch || undefined }),
  })

  const students = studentsQuery.data?.items ?? []
  const meta = studentsQuery.data?.meta

  return (
    <AdminLayout title="Student Management" userSubtitle="Super Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          Student Management
        </h2>
        <p className="text-white/50 text-sm">
          View all students, open profiles, and assign wayfinders.
        </p>
      </div>

      <div className="mt-6 bg-[#313044] p-6" style={{ borderRadius: '18px' }}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-white text-lg font-semibold">Student Directory</h3>

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
                setPage(1)
              }}
              className="w-full sm:w-[280px] pl-9 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
            />
          </div>
        </div>

        {studentsQuery.isLoading && (
          <p className="text-white/50 text-sm py-8 text-center">Loading students…</p>
        )}
        {studentsQuery.isError && (
          <p className="text-[#FF6F6F] text-sm py-8 text-center">
            {getApiErrorMessage(studentsQuery.error)}
          </p>
        )}
        {!studentsQuery.isLoading && !studentsQuery.isError && students.length === 0 && (
          <p className="text-white/50 text-sm py-8 text-center">No students found.</p>
        )}

        <div className="flex flex-col" style={{ gap: '10px' }}>
          {students.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              onOpen={() => navigate(`/students/${student.id}`)}
            />
          ))}
        </div>

        <ListPagination
          meta={meta}
          onPageChange={setPage}
          isLoading={studentsQuery.isFetching}
          itemLabel="students"
        />
      </div>
    </AdminLayout>
  )
}
