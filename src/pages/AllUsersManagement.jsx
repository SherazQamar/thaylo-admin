import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Pencil, Trash2, Plus, X, ChevronDown, Mail } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ListPagination from '../components/ListPagination'
import ConfirmModal from '../components/ConfirmModal'
import { getApiErrorMessage } from '../lib/auth-api'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import { useAuthStore } from '../stores/auth.store'
import {
  formatPhoneInput,
  isValidPhoneDigits,
  normalizePhoneDigits,
  PHONE_INPUT_PLACEHOLDER,
  PHONE_VALIDATION_MESSAGE,
} from '../lib/phone'
import {
  WAYFINDER_HIRING_REGIONS,
} from '../lib/wayfinder-hiring-regions'
import {
  ASSIGNABLE_ROLES,
  CREATABLE_STAFF_ROLES,
  createStaffUser,
  deleteSystemUser,
  fetchSystemUsers,
  formatSystemRole,
  resendStaffInvite,
  systemUserQueryKeys,
  updateSystemUser,
  updateSystemUserRole,
} from '../lib/system-users-api'
import {
  fetchStudents,
  updateStudent,
  deleteStudent,
  restoreStudent,
  adminQueryKeys,
} from '../lib/admin-api'

const TABS = [
  { id: 'all', label: 'ALL USERS', role: undefined },
  { id: 'super_admin', label: 'SUPER ADMIN', role: 'SUPER_ADMIN' },
  { id: 'admin', label: 'ADMIN', role: 'ADMIN' },
  { id: 'wayfinder', label: 'WAY FINDERS', role: 'WAY_FINDER' },
  { id: 'parent', label: 'PARENTS', role: 'PARENT' },
  { id: 'student', label: 'STUDENTS', role: null },
  { id: 'roles', label: 'ROLES', role: undefined },
]

function StatusPill({ active }) {
  return (
    <span
      className={
        'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (active
          ? 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10'
          : 'border-[#FF7B7B] text-[#FF7B7B] bg-[#FF7B7B]/5')
      }
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-white text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/30 disabled:opacity-60"
    />
  )
}

function SelectInput({ value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none px-4 py-3 pr-10 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 disabled:opacity-50"
      >
        {placeholder ? (
          <option value="" className="bg-[#313044]">
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#313044]">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
      />
    </div>
  )
}

function CreateStaffModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    region: '',
    specialty: '',
    gradeLevel: '',
    languagesSpoken: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'ADMIN',
      region: '',
      specialty: '',
      gradeLevel: '',
      languagesSpoken: '',
    })
    setError('')
  }, [open])

  const createMutation = useMutation({
    mutationFn: createStaffUser,
    onSuccess: (user) => {
      onCreated?.(user)
      onClose()
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (!open) return null

  const isWayfinder = form.role === 'WAY_FINDER'

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Full name and email are required.')
      return
    }
    if (form.phone && !isValidPhoneDigits(normalizePhoneDigits(form.phone))) {
      setError(PHONE_VALIDATION_MESSAGE)
      return
    }
    if (isWayfinder && !form.region) {
      setError('Hiring region is required for Wayfinders.')
      return
    }

    createMutation.mutate({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      ...(form.phone
        ? { phone: normalizePhoneDigits(form.phone) }
        : {}),
      role: form.role,
      ...(isWayfinder
        ? {
            region: form.region,
            specialty: form.specialty || undefined,
            gradeLevel: form.gradeLevel || undefined,
            languagesSpoken: form.languagesSpoken
              ? form.languagesSpoken.split(',').map((s) => s.trim()).filter(Boolean)
              : undefined,
          }
        : {}),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-[520px] rounded-2xl border border-white/5 p-7"
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
        <h3 className="text-white text-xl font-bold">Create Staff User</h3>
        <p className="text-white/50 text-sm mt-1">
          Invite Admin, Super Admin, or Wayfinder. Parents and children register via public portals.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Role">
            <SelectInput
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              options={CREATABLE_STAFF_ROLES}
            />
          </Field>
          <Field label="Full Name">
            <TextInput
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Full Name"
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="name@thaylo.com"
            />
          </Field>
          <Field label="Phone">
            <TextInput
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: formatPhoneInput(e.target.value) }))
              }
              placeholder={PHONE_INPUT_PLACEHOLDER}
            />
          </Field>
          {isWayfinder ? (
            <>
              <Field label="Hiring Region">
                <SelectInput
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                  placeholder="Select hiring region"
                  options={WAYFINDER_HIRING_REGIONS.map((r) => ({
                    value: r.code,
                    label: r.label,
                  }))}
                />
              </Field>
              <Field label="Specialty (optional)">
                <TextInput
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                  placeholder="Math Coach"
                />
              </Field>
              <Field label="Languages (optional)">
                <TextInput
                  value={form.languagesSpoken}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, languagesSpoken: e.target.value }))
                  }
                  placeholder="English, Spanish"
                />
              </Field>
            </>
          ) : null}
          {error ? <p className="text-xs text-[#FF6F6F]">{error}</p> : null}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-full bg-white/[0.05] text-white text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="py-3 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : 'Create & Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditUserModal({ open, user, currentUserId, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [deactivate, setDeactivate] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !user) return
    setName(user.name ?? '')
    setPhone(user.phone ? formatPhoneInput(user.phone) : '')
    setDeactivate(!user.isActive)
    setError('')
  }, [open, user])

  const isOtherSuperAdmin = user?.role === 'SUPER_ADMIN' && user?.id !== currentUserId
  const cannotToggleActive = isOtherSuperAdmin || user?.id === currentUserId

  const saveMutation = useMutation({
    mutationFn: () =>
      updateSystemUser(user.id, {
        name: name.trim(),
        phone: phone ? normalizePhoneDigits(phone) : null,
        ...(cannotToggleActive ? {} : { isActive: !deactivate }),
      }),
    onSuccess: (updated) => {
      onSaved?.(updated)
      onClose()
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (!open || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-[440px] rounded-2xl border border-white/5 p-7"
        style={{ backgroundColor: '#313044' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <h3 className="text-white text-xl font-bold">Edit User</h3>
        <p className="text-white/45 text-sm mt-1">{user.email}</p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) {
              setError('Name is required.')
              return
            }
            if (phone && !isValidPhoneDigits(normalizePhoneDigits(phone))) {
              setError(PHONE_VALIDATION_MESSAGE)
              return
            }
            saveMutation.mutate()
          }}
        >
          <Field label="Full Name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Phone">
            <TextInput
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              placeholder={PHONE_INPUT_PLACEHOLDER}
            />
          </Field>
          <label
            className={
              'flex items-center gap-3 text-white text-sm ' +
              (cannotToggleActive ? 'opacity-50' : '')
            }
          >
            <input
              type="checkbox"
              checked={deactivate}
              disabled={cannotToggleActive}
              onChange={(e) => setDeactivate(e.target.checked)}
              className="accent-[#00CED1]"
            />
            Deactivate
            {isOtherSuperAdmin ? (
              <span className="text-white/40 text-xs">(cannot deactivate Super Admins)</span>
            ) : null}
          </label>
          {error ? <p className="text-xs text-[#FF6F6F]">{error}</p> : null}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-full bg-white/[0.05] text-white text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="py-3 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UsersTable({
  users,
  meta,
  isLoading,
  isError,
  error,
  page,
  onPageChange,
  currentUserId,
  onEdit,
  onDelete,
  onResend,
  resendingId,
  showRoleSelect,
  onRoleChange,
  updatingId,
  showInactive,
}) {
  return (
    <div className="mt-6 rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
      {isLoading ? (
        <p className="text-white/50 text-sm py-8 text-center">Loading…</p>
      ) : null}
      {isError ? (
        <p className="text-[#FF6F6F] text-sm py-8 text-center">{getApiErrorMessage(error)}</p>
      ) : null}
      {!isLoading && !isError && users.length === 0 ? (
        <p className="text-white/50 text-sm py-8 text-center">
          {showInactive ? 'No inactive users found.' : 'No users found.'}
        </p>
      ) : null}
      {!isLoading && !isError && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/45 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="py-3 pr-3 font-medium">Name</th>
                <th className="py-3 pr-3 font-medium">Email</th>
                <th className="py-3 pr-3 font-medium">Role</th>
                <th className="py-3 pr-3 font-medium">Status</th>
                <th className="py-3 pr-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = Number(u.id) === Number(currentUserId)
                const isSuperAdmin = u.role === 'SUPER_ADMIN'
                const isOtherSuperAdmin = isSuperAdmin && !isSelf
                const canDelete = !isSelf && !isSuperAdmin && u.isActive
                const canResend =
                  u.invitePending &&
                  u.isActive &&
                  (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.role === 'WAY_FINDER')
                return (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-3.5 pr-3 text-white text-sm font-semibold">
                      {u.name ?? '—'}
                      {u.invitePending ? (
                        <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-[#FFC542]">
                          Pending setup
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3.5 pr-3 text-white/70 text-sm">{u.email}</td>
                    <td className="py-3.5 pr-3 text-sm">
                      {showRoleSelect ? (
                        <select
                          value={u.role}
                          disabled={updatingId === u.id || isOtherSuperAdmin}
                          onChange={(e) => onRoleChange?.(u.id, e.target.value)}
                          className="bg-white/[0.06] text-white text-sm rounded-full px-3 py-1.5 outline-none border border-white/10 disabled:opacity-50"
                        >
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r.value} value={r.value} className="bg-[#313044]">
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-white/80">{formatSystemRole(u.role)}</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-3">
                      <StatusPill active={u.isActive} />
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {canResend ? (
                          <button
                            type="button"
                            onClick={() => onResend?.(u)}
                            disabled={resendingId === u.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#FFC542] hover:bg-[#FFC542]/10 disabled:opacity-40"
                            aria-label="Resend invite"
                            title="Resend setup email"
                          >
                            <Mail size={14} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => onEdit?.(u)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
                          aria-label="Edit"
                          title={isOtherSuperAdmin ? 'Limited edit for Super Admins' : 'Edit'}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!canDelete) return
                            onDelete?.(u)
                          }}
                          disabled={!canDelete}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#FF7B7B] hover:bg-[#FF7B7B]/10 disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Deactivate"
                          title={
                            isSuperAdmin
                              ? 'Cannot deactivate Super Admins (including yourself)'
                              : isSelf
                                ? 'Cannot deactivate yourself'
                                : !u.isActive
                                  ? 'Already inactive'
                                  : 'Deactivate'
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <ListPagination
        meta={meta}
        onPageChange={onPageChange}
        isLoading={isLoading}
        itemLabel="users"
      />
    </div>
  )
}

function EditStudentModal({ open, student, onClose, onSaved }) {
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !student) return
    setFirstName(student.firstName ?? '')
    setSecondName(student.secondName ?? '')
    setUserName(student.userName ?? '')
    setError('')
  }, [open, student])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateStudent(student.id, {
        firstName: firstName.trim(),
        secondName: secondName.trim(),
        userName: userName.trim(),
      }),
    onSuccess: (updated) => {
      onSaved?.(updated)
      onClose()
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (!open || !student) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        className="relative w-full max-w-[440px] rounded-2xl border border-white/5 p-7"
        style={{ backgroundColor: '#313044' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <h3 className="text-white text-xl font-bold">Edit Student</h3>
        <p className="text-white/45 text-sm mt-1">
          Parent: {student.parent?.name ?? student.parent?.email ?? '—'}
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!userName.trim()) {
              setError('Username is required.')
              return
            }
            saveMutation.mutate()
          }}
        >
          <Field label="First name">
            <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Last name">
            <TextInput value={secondName} onChange={(e) => setSecondName(e.target.value)} />
          </Field>
          <Field label="Username">
            <TextInput value={userName} onChange={(e) => setUserName(e.target.value)} />
          </Field>
          {error ? <p className="text-xs text-[#FF6F6F]">{error}</p> : null}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-full bg-white/[0.05] text-white text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="py-3 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StudentsDirectory({ search, page, onPageChange, onMessage, onError, showInactive }) {
  const queryClient = useQueryClient()
  const [editStudent, setEditStudent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const params = {
    page,
    limit: 10,
    search: search || undefined,
    assignment: 'all',
    status: showInactive ? 'inactive' : 'active',
  }
  const query = useQuery({
    queryKey: adminQueryKeys.students(params),
    queryFn: () => fetchStudents(params),
  })
  const students = query.data?.items ?? []

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
      setDeleteTarget(null)
      onMessage?.('Student deactivated.')
      onError?.(null)
    },
    onError: (err) => {
      onError?.(getApiErrorMessage(err))
      setDeleteTarget(null)
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id) => restoreStudent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
      onMessage?.('Student restored.')
      onError?.(null)
    },
    onError: (err) => onError?.(getApiErrorMessage(err)),
  })

  return (
    <div className="mt-6 rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
      <p className="text-white/45 text-xs mb-4">
        Students are created by parents on the public portal. Delete soft-archives the student;
        use Show inactive to restore them.
      </p>
      {query.isLoading ? (
        <p className="text-white/50 text-sm py-8 text-center">Loading students…</p>
      ) : null}
      {query.isError ? (
        <p className="text-[#FF6F6F] text-sm py-8 text-center">
          {getApiErrorMessage(query.error)}
        </p>
      ) : null}
      {!query.isLoading && students.length === 0 ? (
        <p className="text-white/50 text-sm py-8 text-center">
          {showInactive ? 'No inactive students found.' : 'No students found.'}
        </p>
      ) : null}
      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/45 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="py-3 pr-3 font-medium">Student</th>
                <th className="py-3 pr-3 font-medium">Grade</th>
                <th className="py-3 pr-3 font-medium">Parent</th>
                <th className="py-3 pr-3 font-medium">Wayfinder</th>
                <th className="py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const displayName =
                  [s.firstName, s.secondName].filter(Boolean).join(' ') || s.userName
                return (
                  <tr key={s.id} className="border-b border-white/5">
                    <td className="py-3.5 pr-3 text-white text-sm font-semibold">
                      <span>{displayName}</span>
                      <span className="block text-white/40 text-xs font-normal">@{s.userName}</span>
                    </td>
                    <td className="py-3.5 pr-3 text-white/70 text-sm">{s.grade ?? '—'}</td>
                    <td className="py-3.5 pr-3 text-white/70 text-sm">
                      {s.parent?.name ?? s.parent?.email ?? '—'}
                    </td>
                    <td className="py-3.5 pr-3 text-white/70 text-sm">
                      {s.wayfinder?.name ?? 'Unassigned'}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {showInactive ? (
                          <button
                            type="button"
                            onClick={() => restoreMutation.mutate(s.id)}
                            disabled={restoreMutation.isPending}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#00CED1] hover:bg-[#00CED1]/10 disabled:opacity-50"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditStudent(s)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
                              aria-label="Edit"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(s)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[#FF7B7B] hover:bg-[#FF7B7B]/10"
                              aria-label="Deactivate"
                              title="Deactivate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <ListPagination
        meta={query.data?.meta}
        onPageChange={onPageChange}
        isLoading={query.isFetching}
        itemLabel="students"
      />

      <EditStudentModal
        open={!!editStudent}
        student={editStudent}
        onClose={() => setEditStudent(null)}
        onSaved={async () => {
          await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
          onMessage?.('Student updated.')
          onError?.(null)
        }}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Deactivate student?"
        message={
          deleteTarget
            ? `Soft-delete ${deleteTarget.userName}? They will move to inactive students.`
            : ''
        }
        confirmLabel="Deactivate"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  )
}

export default function AllUsersManagement() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showInactive, setShowInactive] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [resendingId, setResendingId] = useState(null)
  const debouncedSearch = useDebouncedValue(search)

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0]
  const isStudents = tab === 'student'
  const isRoles = tab === 'roles'
  const statusFilter = showInactive ? 'inactive' : 'active'

  const listParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      role: activeTab.role || undefined,
      status: statusFilter,
    }),
    [page, debouncedSearch, activeTab.role, statusFilter],
  )

  const usersQuery = useQuery({
    queryKey: systemUserQueryKeys.list(listParams),
    queryFn: () => fetchSystemUsers(listParams),
    enabled: !isStudents,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      if (Number(id) === Number(currentUserId)) {
        throw new Error('You cannot deactivate your own account.')
      }
      return deleteSystemUser(id)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] })
      setDeleteUser(null)
      setMessage('User deactivated.')
      setError(null)
    },
    onError: (err) => {
      setError(getApiErrorMessage(err))
      setDeleteUser(null)
    },
  })

  const resendMutation = useMutation({
    mutationFn: (id) => resendStaffInvite(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] })
      setResendingId(null)
      const user = usersQuery.data?.items?.find((u) => u.id === id)
      setMessage(`Invite resent to ${user?.email ?? 'user'}.`)
      setError(null)
    },
    onError: (err) => {
      setResendingId(null)
      setError(getApiErrorMessage(err))
    },
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateSystemUserRole(userId, role),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] })
      setUpdatingId(null)
      setMessage(`Updated ${updated.name ?? updated.email} to ${formatSystemRole(updated.role)}.`)
      setError(null)
    },
    onError: (err) => {
      setUpdatingId(null)
      setError(getApiErrorMessage(err))
    },
  })

  return (
    <SuperAdminLayout title="User Management">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-white text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-white/50 text-sm">
            Create Admin / Super Admin / Wayfinder. Parents and children use public portals.
          </p>
        </div>
        {!isStudents ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-5 py-2.5"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Staff
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id)
              setPage(1)
              setMessage(null)
              setError(null)
            }}
            className={
              'rounded-full px-4 py-2 text-xs font-semibold tracking-wide ' +
              (tab === t.id
                ? 'bg-[#00CED1] text-[#111023]'
                : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.1]')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative max-w-md flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name or email"
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-white/70 text-sm shrink-0 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={showInactive}
            onClick={() => {
              setShowInactive((v) => !v)
              setPage(1)
            }}
            className="relative shrink-0 transition-colors"
            style={{
              width: 38,
              height: 22,
              borderRadius: 999,
              backgroundColor: showInactive ? '#00CED1' : 'rgba(255,255,255,0.15)',
            }}
          >
            <span
              className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white transition-all"
              style={{ width: 16, height: 16, left: showInactive ? 19 : 3 }}
            />
          </button>
          Show inactive
        </label>
      </div>

      {(message || error) && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            error
              ? 'bg-[#FF6F6F]/10 text-[#FF6F6F] border border-[#FF6F6F]/20'
              : 'bg-[#00CED1]/10 text-[#00CED1] border border-[#00CED1]/20'
          }`}
        >
          {error ?? message}
        </div>
      )}

      {isStudents ? (
        <StudentsDirectory
          search={debouncedSearch}
          page={page}
          onPageChange={setPage}
          onMessage={setMessage}
          onError={setError}
          showInactive={showInactive}
        />
      ) : (
        <UsersTable
          users={usersQuery.data?.items ?? []}
          meta={usersQuery.data?.meta}
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          error={usersQuery.error}
          page={page}
          onPageChange={setPage}
          currentUserId={currentUserId}
          showInactive={showInactive}
          onEdit={setEditUser}
          onDelete={(u) => {
            if (u.role === 'SUPER_ADMIN' || Number(u.id) === Number(currentUserId)) return
            setDeleteUser(u)
          }}
          onResend={(u) => {
            setResendingId(u.id)
            resendMutation.mutate(u.id)
          }}
          resendingId={resendingId}
          showRoleSelect={isRoles}
          updatingId={updatingId}
          onRoleChange={(userId, role) => {
            setUpdatingId(userId)
            roleMutation.mutate({ userId, role })
          }}
        />
      )}

      <CreateStaffModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          await queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] })
          setMessage('Staff invited. They will receive a set-password email.')
          setError(null)
        }}
      />

      <EditUserModal
        open={!!editUser}
        user={editUser}
        currentUserId={currentUserId}
        onClose={() => setEditUser(null)}
        onSaved={async (updated) => {
          await queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] })
          setMessage(
            updated?.isActive === false ? 'User deactivated.' : 'User updated.',
          )
          setError(null)
        }}
      />

      <ConfirmModal
        open={!!deleteUser}
        title="Deactivate user?"
        message={
          deleteUser
            ? `Soft-delete ${deleteUser.name ?? deleteUser.email}? They will move to inactive users and cannot sign in.`
            : ''
        }
        confirmLabel="Deactivate"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => {
          if (!deleteUser) return
          if (deleteUser.role === 'SUPER_ADMIN') {
            setError('Super Admins cannot be deactivated.')
            setDeleteUser(null)
            return
          }
          if (Number(deleteUser.id) === Number(currentUserId)) {
            setError('You cannot deactivate your own account.')
            setDeleteUser(null)
            return
          }
          deleteMutation.mutate(deleteUser.id)
        }}
      />
    </SuperAdminLayout>
  )
}
