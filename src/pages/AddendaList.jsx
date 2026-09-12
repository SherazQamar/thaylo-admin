import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Layers, Info } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ListPagination from '../components/ListPagination'
import AddendaUploadWizard from '../components/AddendaUploadWizard'
import { useNotifyError } from '../hooks/useNotifyError'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import {
  ADDENDA_INFO_MESSAGE,
  ADDENDA_STATUS_LABELS,
  addendaQueryKeys,
  deleteAddendum,
  fetchAddenda,
} from '../lib/addenda-api'

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
]

function StatusBadge({ status }) {
  const styles = {
    DRAFT: 'border-white/20 text-white/60 bg-white/5',
    IN_REVIEW: 'border-[#FFC542]/40 text-[#FFC542] bg-[#FFC542]/10',
    PUBLISHED: 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10',
    ARCHIVED: 'border-[#FF7B7B]/40 text-[#FF7B7B] bg-[#FF7B7B]/10',
  }

  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (styles[status] ?? styles.DRAFT)
      }
    >
      {ADDENDA_STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function AddendaList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [wizardOpen, setWizardOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)

  const listParams = useMemo(
    () => ({
      page,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, statusFilter, debouncedSearch],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: addendaQueryKeys.list(listParams),
    queryFn: () => fetchAddenda(listParams),
  })
  useNotifyError(error, isError)

  const deleteMutation = useMutation({
    mutationFn: deleteAddendum,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum-addenda'] })
    },
  })

  const items = data?.items ?? []
  const meta = data?.meta ?? null

  async function handleDelete(item) {
    const message =
      item.status === 'PUBLISHED'
        ? `Archive "${item.title}"? Students will fall back to built-in addenda until you publish another version.`
        : `Delete "${item.title}"? This cannot be undone.`
    if (!window.confirm(message)) return
    await deleteMutation.mutateAsync(item.id)
  }

  return (
    <SuperAdminLayout title="Addenda">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#00CED1]/10 flex items-center justify-center">
              <Layers size={22} className="text-[#00CED1]" />
            </div>
            <div>
              <h2 className="text-white text-3xl font-bold tracking-tight">Addenda</h2>
              <p className="text-white/50 text-sm mt-1">
                Upload retry documents, review extracted lessons and attempts, then publish for
                students.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold px-5 py-2.5 hover:bg-[#00B8BB]"
          >
            <Plus size={16} />
            Upload addenda
          </button>
        </div>

        <div className="rounded-2xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-[#00CED1] text-sm flex items-start gap-2">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>{ADDENDA_INFO_MESSAGE}</span>
        </div>

        <div className="rounded-2xl p-5 lg:p-6" style={{ backgroundColor: '#313044' }}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by title, subject, or slug…"
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {STATUS_FILTERS.map((filter) => {
              const active = statusFilter === filter.value
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => {
                    setStatusFilter(filter.value)
                    setPage(1)
                  }}
                  className={
                    'rounded-full px-4 py-2 text-xs font-semibold transition-colors ' +
                    (active
                      ? 'bg-[#00CED1] text-[#111023]'
                      : 'bg-white/5 text-white/60 hover:text-white')
                  }
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {isError && (
            <p className="text-white/50 text-sm mb-4">Unable to load addenda right now.</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-white/5">
                  {['Title', 'Subject', 'Grade', 'Lessons', 'Max attempt', 'Status', 'Actions'].map(
                    (col) => (
                      <th
                        key={col}
                        className={
                          'py-3 px-4 text-xs uppercase tracking-wider font-semibold text-white/60 ' +
                          (col === 'Actions' ? 'text-right' : 'text-left')
                        }
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/40 text-sm">
                      Loading addenda…
                    </td>
                  </tr>
                )}

                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/40 text-sm">
                      No addenda yet. Upload Addenda Lessons 1–10.docx to extract retries.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="py-4 px-4">
                        <p className="text-white font-semibold">{item.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">
                          v{item.version} · {item.slug}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-white/70 text-sm">{item.subject}</td>
                      <td className="py-4 px-4 text-white/70 text-sm">{item.gradeLevel}</td>
                      <td className="py-4 px-4 text-white/70 text-sm">
                        {item.lessonRange ||
                          (item.lessonFrom != null && item.lessonTo != null
                            ? `${item.lessonFrom}–${item.lessonTo}`
                            : item.lessonCount)}
                      </td>
                      <td className="py-4 px-4 text-white/70 text-sm">
                        {item.maxAttemptNumber}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/super-admin/addenda/${item.id}`)}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#00CED1]"
                            aria-label="Review extracted addenda"
                          >
                            <Pencil size={14} />
                          </button>
                          {item.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={deleteMutation.isPending}
                              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#FF7B7B]"
                              aria-label="Delete or archive"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isLoading={isLoading}
            itemLabel="addenda"
          />
        </div>
      </div>

      <AddendaUploadWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={(item) => {
          queryClient.setQueryData(addendaQueryKeys.detail(item.id), item)
          navigate(`/super-admin/addenda/${item.id}`)
        }}
      />
    </SuperAdminLayout>
  )
}
