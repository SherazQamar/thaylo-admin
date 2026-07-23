import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, RefreshCw } from 'lucide-react'
import ListPagination from './ListPagination'
import { adminQueryKeys, fetchWayfinderStudents } from '../lib/admin-api'

/**
 * @param {{
 *   open: boolean;
 *   wayfinder: { id: number; name: string | null; email: string } | null;
 *   onClose: () => void;
 *   onReassign?: (student: { id: number; userName: string }) => void;
 * }} props
 */
export default function WayfinderStudentsModal({ open, wayfinder, onClose, onReassign }) {
  const [page, setPage] = useState(1)

  const studentsQuery = useQuery({
    queryKey: adminQueryKeys.wayfinderStudents(wayfinder?.id, { page }),
    queryFn: () => fetchWayfinderStudents(wayfinder.id, { page }),
    enabled: open && !!wayfinder?.id,
  })

  useEffect(() => {
    if (open) setPage(1)
  }, [open, wayfinder?.id])

  if (!open || !wayfinder) return null

  const students = studentsQuery.data?.items ?? []
  const meta = studentsQuery.data?.meta

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full max-w-[640px] rounded-2xl border border-white/5 p-7"
        style={{ backgroundColor: '#313044' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        <h3 className="text-white text-xl font-bold pr-8">
          {wayfinder.name ?? 'Wayfinder'} — Students
        </h3>
        <p className="text-white/50 text-sm mt-1">{wayfinder.email}</p>

        <div className="mt-5 space-y-2 max-h-[360px] overflow-y-auto">
          {studentsQuery.isLoading && (
            <p className="text-white/50 text-sm py-6 text-center">Loading students…</p>
          )}
          {studentsQuery.isError && (
            <p className="text-[#FF6F6F] text-sm py-6 text-center">
              Could not load students.
            </p>
          )}
          {!studentsQuery.isLoading && students.length === 0 && (
            <p className="text-white/50 text-sm py-6 text-center">No students assigned yet.</p>
          )}
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold">{student.userName}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {student.grade ?? 'No grade'} · Parent:{' '}
                  {student.parent.name ?? student.parent.email}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-white/40 text-xs">
                  {student.assignedAt
                    ? new Date(student.assignedAt).toLocaleDateString()
                    : '—'}
                </p>
                {onReassign ? (
                  <button
                    type="button"
                    onClick={() => onReassign(student)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#00CED1]/15 text-[#00CED1] text-xs font-semibold px-3 py-1.5 hover:bg-[#00CED1]/25"
                  >
                    <RefreshCw size={12} />
                    Reassign
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <ListPagination
          meta={meta}
          onPageChange={setPage}
          isLoading={studentsQuery.isFetching}
          itemLabel="students"
        />
      </div>
    </div>
  )
}
