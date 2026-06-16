import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-white/50"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const showSeparator = index > 0

        return (
          <span key={`${item.href}-${index}`} className="flex items-center gap-1.5">
            {showSeparator && <span className="text-white/30">/</span>}
            {isLast ? (
              <span className="text-white/70" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
