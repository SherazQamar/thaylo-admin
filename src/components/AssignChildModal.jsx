import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, ChevronDown } from 'lucide-react'
import {
  adminQueryKeys,
  assignChildToWayfinder,
  fetchParents,
  fetchWayfinders,
} from '../lib/admin-api'
import { getApiErrorMessage } from '../lib/auth-api'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-white text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function SelectField({ value, onChange, placeholder, options, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none px-4 py-3 pr-10 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 disabled:opacity-50"
      >
        <option value="" className="bg-[#313044]">
          {placeholder}
        </option>
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

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   defaultWayfinderId?: number | null;
 *   defaultChildId?: number | null;
 *   onSuccess?: () => void;
 * }} props
 */
export default function AssignChildModal({
  open,
  onClose,
  defaultWayfinderId = null,
  defaultChildId = null,
  onSuccess,
}) {
  const queryClient = useQueryClient()
  const [wayfinderId, setWayfinderId] = useState('')
  const [childId, setChildId] = useState('')
  const [error, setError] = useState('')

  const wayfindersQuery = useQuery({
    queryKey: adminQueryKeys.wayfinders({ page: 1 }),
    queryFn: () => fetchWayfinders({ page: 1 }),
    enabled: open,
  })

  const parentsQuery = useQuery({
    queryKey: adminQueryKeys.parents({ page: 1 }),
    queryFn: () => fetchParents({ page: 1 }),
    enabled: open,
  })

  const unassignedChildren = useMemo(() => {
    const parents = parentsQuery.data?.items ?? []
    return parents.flatMap((parent) =>
      (parent.children ?? [])
        .filter((child) => !child.wayfinderId)
        .map((child) => ({
          value: String(child.id),
          label: `${child.userName}${child.grade ? ` · ${child.grade}` : ''} (${parent.name ?? parent.email})`,
        })),
    )
  }, [parentsQuery.data])

  const wayfinderOptions = useMemo(
    () =>
      (wayfindersQuery.data?.items ?? []).map((w) => ({
        value: String(w.id),
        label: `${w.name ?? 'Unnamed'} · ${w.childrenCount} students`,
      })),
    [wayfindersQuery.data],
  )

  useEffect(() => {
    if (!open) return
    setWayfinderId(defaultWayfinderId ? String(defaultWayfinderId) : '')
    setChildId(defaultChildId ? String(defaultChildId) : '')
    setError('')
  }, [open, defaultWayfinderId, defaultChildId])

  const assignMutation = useMutation({
    mutationFn: assignChildToWayfinder,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'wayfinders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'parents'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'students'] }),
      ])
      onSuccess?.()
      onClose()
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (!open) return null

  const isLoading = wayfindersQuery.isLoading || parentsQuery.isLoading
  const canSubmit = wayfinderId && childId && !assignMutation.isPending

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    assignMutation.mutate({
      wayfinderId: Number(wayfinderId),
      childId: Number(childId),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full max-w-[480px] rounded-2xl border border-white/5 p-7"
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

        <h3 className="text-white text-xl font-bold">Assign Child to Wayfinder</h3>
        <p className="text-white/50 text-sm mt-1">
          Link an unassigned student to a wayfinder caseload.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Wayfinder">
            <SelectField
              value={wayfinderId}
              onChange={(e) => setWayfinderId(e.target.value)}
              placeholder={isLoading ? 'Loading wayfinders…' : 'Select wayfinder'}
              options={wayfinderOptions}
              disabled={isLoading || !!defaultWayfinderId}
            />
          </Field>

          <Field label="Student">
            <SelectField
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              placeholder={
                isLoading
                  ? 'Loading students…'
                  : unassignedChildren.length === 0
                    ? 'No unassigned students'
                    : 'Select student'
              }
              options={unassignedChildren}
              disabled={isLoading || !!defaultChildId || unassignedChildren.length === 0}
            />
          </Field>

          {error && <p className="text-xs text-[#FF6F6F]">{error}</p>}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-full bg-white/[0.05] text-white text-sm font-semibold hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="py-3 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold hover:bg-[#00B8BB] transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {assignMutation.isPending ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
