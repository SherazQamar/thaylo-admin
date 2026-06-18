import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * @param {{ total: number; currentPage: number; lastPage: number; perPage: number; prev: number | null; next: number | null }} meta
 */
function getVisiblePages(meta) {
  const { currentPage, lastPage } = meta
  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, i) => i + 1)
  }

  const pages = new Set([1, lastPage, currentPage, currentPage - 1, currentPage + 1])
  return [...pages].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b)
}

function PageButton({ children, active, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={
        'min-w-[32px] h-8 px-2 rounded-full text-xs font-semibold transition-colors ' +
        (active
          ? 'bg-[#00CED1] text-[#111023]'
          : 'text-white/70 hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none')
      }
    >
      {children}
    </button>
  )
}

/**
 * @param {{
 *   meta: { total: number; currentPage: number; lastPage: number; perPage: number; prev: number | null; next: number | null } | null;
 *   onPageChange: (page: number) => void;
 *   isLoading?: boolean;
 *   itemLabel?: string;
 * }} props
 */
export default function ListPagination({
  meta,
  onPageChange,
  isLoading,
  itemLabel = 'records',
}) {
  if (!meta || meta.total === 0) return null

  const start = (meta.currentPage - 1) * meta.perPage + 1
  const end = Math.min(meta.currentPage * meta.perPage, meta.total)
  const pages = getVisiblePages(meta)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-4 border-t border-white/5">
      <p className="text-white/40 text-xs">
        Showing {start}-{end} of {meta.total} {itemLabel}
      </p>

      {meta.lastPage > 1 && (
        <div className="flex items-center gap-1">
          <PageButton
            disabled={!meta.prev || isLoading}
            onClick={() => meta.prev && onPageChange(meta.prev)}
            ariaLabel="Previous page"
          >
            <ChevronLeft size={14} />
          </PageButton>

          {pages.map((page, index) => {
            const prevPage = pages[index - 1]
            const showEllipsis = prevPage && page - prevPage > 1

            return (
              <span key={page} className="flex items-center gap-1">
                {showEllipsis && <span className="text-white/30 text-xs px-1">…</span>}
                <PageButton
                  active={page === meta.currentPage}
                  disabled={isLoading}
                  onClick={() => onPageChange(page)}
                  ariaLabel={`Page ${page}`}
                >
                  {page}
                </PageButton>
              </span>
            )
          })}

          <PageButton
            disabled={!meta.next || isLoading}
            onClick={() => meta.next && onPageChange(meta.next)}
            ariaLabel="Next page"
          >
            <ChevronRight size={14} />
          </PageButton>
        </div>
      )}
    </div>
  )
}
