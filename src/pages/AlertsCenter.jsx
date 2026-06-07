import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import AlertDetailDrawer from '../components/AlertDetailDrawer'
import ChatDrawer from '../components/ChatDrawer'

const ALERTS = [
  {
    title: 'Student Struggling',
    text: 'Bob Smith has failed the Math Module 3 times.',
    date: '29/01/2026',
    priority: 'High',
    accent: '#FF6F6F',
  },
  {
    title: 'SEL Red Flag',
    text: 'Diana Prince reported low mood for 3 consecutive days.',
    date: '29/01/2026',
    priority: 'Medium',
    accent: '#FFC542',
  },
  {
    title: 'Parent Message',
    text: 'Martha Johnson requested a meeting regarding Alice.',
    date: '29/01/2026',
    priority: null,
    accent: '#00CED1',
    type: 'message',
  },
]

function PriorityBadge({ priority, accent }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border"
      style={{
        borderColor: accent,
        color: accent,
        backgroundColor: accent + '15',
        // Figma: Inter 500 / 12px / 100% line-height / 0% letter-spacing, center
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '12px',
        lineHeight: '100%',
        letterSpacing: '0%',
        textAlign: 'center',
        padding: '5px 12px',
      }}
    >
      {priority}
    </span>
  )
}

function ViewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-[#00B8BB] transition-colors cursor-pointer"
      style={{
        // Figma button: Hug 111.25px × 28px, radius 12px, padding 6/16/6/16, bg #00CED1
        backgroundColor: '#00CED1',
        borderRadius: '12px',
        padding: '6px 16px',
        width: '111.25px',
        height: '28px',
        // Figma text: Inter 500 / 11px / 16px line-height / center
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: '11px',
        lineHeight: '16px',
        color: '#111023',
      }}
    >
      View
    </button>
  )
}

function AlertCard({ a, onView, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className="relative overflow-hidden rounded-2xl flex items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
      style={{ backgroundColor: '#313044', minHeight: '88px' }}
    >
      {/* Left accent bar */}
      <span
        className="absolute left-0 top-0 bottom-0"
        style={{ width: '5px', backgroundColor: a.accent }}
      />

      <div className="flex-1 px-7 py-5">
        <p className="text-white text-base font-semibold leading-tight">
          {a.title}
        </p>
        <p className="text-white/60 text-sm mt-1">{a.text}</p>
        <p className="text-white/40 text-xs mt-2">{a.date}</p>
      </div>

      <div className="flex items-center gap-3 pr-6">
        {a.priority && (
          <PriorityBadge priority={a.priority} accent={a.accent} />
        )}
        <ViewButton
          onClick={(e) => {
            e.stopPropagation()
            onView?.()
          }}
        />
      </div>
    </div>
  )
}

export default function AlertsCenter() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)

  function handleCardClick(a) {
    if (a.type === 'message') {
      setChatOpen(true)
    } else {
      setSelected(a)
    }
  }

  return (
    <AdminLayout title="Alerts Center" userSubtitle="Super Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          Alerts Center
        </h2>
        <p className="text-white/50 text-sm">
          All active alerts requiring attention.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        {ALERTS.map((a) => (
          <AlertCard
            key={a.title}
            a={a}
            onClick={() => handleCardClick(a)}
            onView={() =>
              a.type === 'message'
                ? setChatOpen(true)
                : navigate('/alerts/insights')
            }
          />
        ))}
      </div>

      <AlertDetailDrawer
        open={!!selected}
        alert={selected}
        onClose={() => setSelected(null)}
        onMessageParent={() => {
          setSelected(null)
          setChatOpen(true)
        }}
      />
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </AdminLayout>
  )
}
