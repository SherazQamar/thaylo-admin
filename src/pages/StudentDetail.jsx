import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import AssignChildModal from '../components/AssignChildModal'
import { adminQueryKeys, fetchStudentById } from '../lib/admin-api'
import { getApiErrorMessage } from '../lib/auth-api'
import { formatPhoneDisplay } from '../lib/phone'
import { formatStudentName } from '../lib/student'

function DetailCard({ title, children }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
    >
      <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/40 text-sm sm:w-40 shrink-0">{label}</span>
      <span className="text-white text-sm break-words">{value ?? '—'}</span>
    </div>
  )
}

export default function StudentDetail() {
  const { id } = useParams()
  const studentId = Number(id)
  const [assignOpen, setAssignOpen] = useState(false)

  const studentQuery = useQuery({
    queryKey: adminQueryKeys.student(studentId),
    queryFn: () => fetchStudentById(studentId),
    enabled: Number.isFinite(studentId) && studentId > 0,
  })

  const student = studentQuery.data
  const displayName = student ? formatStudentName(student) : ''

  const breadcrumbs = [
    { href: '/admin-dashboard', label: 'Admin Dashboard' },
    { href: '/students', label: 'Student Management' },
    { href: `/students/${id}`, label: displayName || 'Student Details' },
  ]

  return (
    <AdminLayout title="Student Details" breadcrumbs={breadcrumbs}>
      <Link
        to="/students"
        className="inline-flex items-center gap-2 text-[#00CED1] text-sm font-medium hover:underline mb-4"
      >
        <ArrowLeft size={16} />
        Back to students
      </Link>

      {studentQuery.isLoading && (
        <p className="text-white/50 text-sm py-8">Loading student details…</p>
      )}
      {studentQuery.isError && (
        <p className="text-[#FF6F6F] text-sm py-8">
          {getApiErrorMessage(studentQuery.error)}
        </p>
      )}

      {student && (
        <>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
              <div>
                <h2 className="text-white text-3xl font-bold tracking-tight">
                  {displayName}
                </h2>
                <p className="text-white/50 text-sm mt-1">@{student.userName}</p>
                <p className="text-white/40 text-xs mt-1">
                  Registered {new Date(student.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {student.wayfinderId ? (
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="self-start inline-flex items-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-5 py-2.5 transition-colors"
              >
                <UserPlus size={16} />
                Change Wayfinder
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="self-start inline-flex items-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-5 py-2.5 transition-colors"
              >
                <UserPlus size={16} />
                Assign Wayfinder
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DetailCard title="Student Information">
              <DetailRow label="First name" value={student.firstName} />
              <DetailRow label="Second name" value={student.secondName} />
              <DetailRow label="Username" value={student.userName} />
              <DetailRow label="Grade" value={student.grade} />
              <DetailRow
                label="Documents"
                value={
                  student.documentUrls?.length
                    ? `${student.documentUrls.length} uploaded`
                    : 'None'
                }
              />
              <DetailRow
                label="Last updated"
                value={new Date(student.updatedAt).toLocaleString()}
              />
            </DetailCard>

            <DetailCard title="Wayfinder Assignment">
              {student.wayfinder ? (
                <>
                  <DetailRow label="Wayfinder" value={student.wayfinder.name} />
                  <DetailRow label="Email" value={student.wayfinder.email} />
                  <DetailRow label="Specialty" value={student.wayfinder.specialty} />
                  <DetailRow label="Grade level" value={student.wayfinder.gradeLevel} />
                  <DetailRow
                    label="Assigned on"
                    value={
                      student.assignedAt
                        ? new Date(student.assignedAt).toLocaleString()
                        : '—'
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setAssignOpen(true)}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#00CED1]/10 text-[#00CED1] text-sm font-semibold px-4 py-2 hover:bg-[#00CED1]/20"
                  >
                    <UserPlus size={15} />
                    Change Wayfinder
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-white/50 text-sm">
                    This student is not assigned to a wayfinder yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAssignOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00CED1]/10 text-[#00CED1] text-sm font-semibold px-4 py-2 hover:bg-[#00CED1]/20"
                  >
                    <UserPlus size={15} />
                    Assign Wayfinder
                  </button>
                </div>
              )}
            </DetailCard>

            <DetailCard title="Parent / Guardian">
              <DetailRow label="Name" value={student.parent.name} />
              <DetailRow label="Email" value={student.parent.email} />
              <DetailRow label="Phone" value={formatPhoneDisplay(student.parent.phone)} />
              <DetailRow label="Country" value={student.parent.country} />
              <DetailRow label="Primary guardian" value={student.parent.guardianType} />
              <DetailRow
                label="Secondary guardian"
                value={
                  student.parent.secondaryGuardianName
                    ? `${student.parent.secondaryGuardianType ?? 'Guardian'} · ${student.parent.secondaryGuardianName}`
                    : null
                }
              />
              <DetailRow
                label="Email verified"
                value={student.parent.isEmailVerified ? 'Yes' : 'No'}
              />
            </DetailCard>
          </div>
        </>
      )}

      <AssignChildModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        mode={student?.wayfinderId ? 'reassign' : 'assign'}
        defaultChildId={studentId}
        onSuccess={() => studentQuery.refetch()}
      />
    </AdminLayout>
  )
}
