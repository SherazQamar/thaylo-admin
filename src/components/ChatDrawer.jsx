import { useState } from 'react'
import { X, Plus, Send } from 'lucide-react'
import parentImg from '../assets/Parent P1.png'

const INITIAL_MESSAGES = [
  {
    sender: 'Martha',
    role: 'parent',
    text:
      "Hi, I wanted to discuss Alice's progress in the Math module. She seems to be struggling a bit.",
  },
  {
    sender: 'Wayfinder',
    role: 'wayfinder',
    text:
      "Hi Martha! Thanks for reaching out. I've reviewed Alice's recent sessions and noticed the same. Let's set up a call?",
  },
  {
    sender: 'Martha',
    role: 'parent',
    text: 'That would be great! When are you available this week?',
  },
]

function ParentAvatar() {
  return (
    <div
      className="w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-end justify-center"
      style={{
        background:
          'linear-gradient(135deg,#fde68a 0%,#f9a8d4 70%,#c4b5fd 100%)',
      }}
    >
      <img
        src={parentImg}
        alt=""
        className="w-full h-full object-cover object-top scale-[1.4]"
        style={{ objectPosition: 'center 18%' }}
      />
    </div>
  )
}

function WayfinderAvatar({ size = 40 }) {
  // Stylized bot avatar built in SVG so it looks illustrative, not iconic
  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 30%,#ffffff,#e5e7eb 70%,#cbd5e1 100%)',
      }}
    >
      <svg
        viewBox="0 0 40 40"
        width={size * 0.78}
        height={size * 0.78}
        aria-hidden="true"
      >
        {/* antenna */}
        <circle cx="20" cy="6" r="2" fill="#00CED1" />
        <line
          x1="20"
          y1="8"
          x2="20"
          y2="12"
          stroke="#00CED1"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* head */}
        <rect
          x="9"
          y="12"
          width="22"
          height="18"
          rx="6"
          fill="#3B82F6"
          stroke="#1E40AF"
          strokeWidth="1"
        />
        {/* visor */}
        <rect x="12" y="16" width="16" height="8" rx="3" fill="#111023" />
        {/* eyes */}
        <circle cx="17" cy="20" r="1.6" fill="#00CED1" />
        <circle cx="23" cy="20" r="1.6" fill="#00CED1" />
        {/* cheeks */}
        <circle cx="11.5" cy="25" r="1" fill="#FFC542" />
        <circle cx="28.5" cy="25" r="1" fill="#FFC542" />
        {/* mouth */}
        <line
          x1="17"
          y1="27"
          x2="23"
          y2="27"
          stroke="#111023"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function MessageRow({ m }) {
  const isWf = m.role === 'wayfinder'
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 pl-12">
        {/* sender label aligns past the avatar */}
      </div>
      <div className="flex items-start gap-3">
        {isWf ? <WayfinderAvatar /> : <ParentAvatar />}
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs font-medium mb-1.5">
            {m.sender}
          </p>
          <div
            className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
            style={{
              backgroundColor: isWf ? '#00CED1' : '#525162',
              color: isWf ? '#111023' : '#FFFFFF',
              maxWidth: '95%',
            }}
          >
            {m.text}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatDrawer({ open, onClose }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')

  function handleSend(e) {
    e?.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { sender: 'Wayfinder', role: 'wayfinder', text },
    ])
    setDraft('')
  }

  return (
    <>
      <div
        className={
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ' +
          (open ? 'opacity-100' : 'opacity-0 pointer-events-none')
        }
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={
          'fixed top-0 right-0 z-50 h-full w-full max-w-[400px] flex flex-col transition-transform duration-300 ease-out ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
        style={{ backgroundColor: '#313044', fontFamily: 'Inter, sans-serif' }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-white text-lg font-bold">Chat</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wayfinder Fatima card */}
        <div className="px-5 pt-5">
          <div
            className="rounded-2xl px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: '#1c1b2e' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <WayfinderAvatar />
              <p className="text-white text-sm font-semibold truncate">
                Wayfinder Fatima
              </p>
            </div>
            <span className="text-[#00CED1] text-xs font-medium shrink-0">
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {messages.map((m, i) => (
            <MessageRow key={i} m={m} />
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="px-5 pb-5 pt-1 flex items-center gap-3"
        >
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-[#00CED1]/15 border border-[#00CED1]/40 flex items-center justify-center text-[#00CED1] shrink-0 hover:bg-[#00CED1]/25"
            aria-label="Attach"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message"
              className="w-full pl-4 pr-11 py-2.5 rounded-full bg-white text-[#111023] text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-[#111023]/40"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
              aria-label="Send"
            >
              <Send size={16} className="-rotate-12" strokeWidth={1.75} />
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
