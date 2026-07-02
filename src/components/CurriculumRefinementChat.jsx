import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, Loader2 } from 'lucide-react'

const SUGGESTIONS = [
  'Add the missing practice examples from the document to Lesson 1',
  'Fix Lesson 1 prerequisites to match the uploaded text exactly',
  'Copy the Word Ladder mastery marker verbatim into Lesson 1',
  'Shorten the Student Language line without changing its meaning',
  'Add assessments from the document gateway questions',
]

/**
 * @param {{
 *   messages: import('../lib/curriculum-mock-data').RefinementMessage[];
 *   onSend: (message: string) => Promise<void>;
 *   isSending: boolean;
 *   disabled?: boolean;
 * }} props
 */
export default function CurriculumRefinementChat({
  messages,
  onSend,
  isSending,
  disabled,
}) {
  const [input, setInput] = useState('')
  const messagesRef = useRef(null)

  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isSending])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isSending || disabled) return
    setInput('')
    await onSend(trimmed)
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full max-h-[min(70vh,640px)] xl:max-h-none rounded-2xl border border-white/5 bg-[#252338]/80 overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Sparkles size={18} className="text-[#00CED1]" />
        <div>
          <p className="text-white text-sm font-semibold">Improve with AI</p>
          <p className="text-white/40 text-xs">Optional — edit extracted content when needed</p>
        </div>
      </div>

      <div
        ref={messagesRef}
        className="scrollbar-thaylo flex-1 min-h-0 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 && (
          <p className="text-white/40 text-sm text-center py-6">
            Optional: ask AI to fix or improve specific lesson sections. Extracted document
            content is shown on the left.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              'rounded-2xl px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ' +
              (msg.role === 'user'
                ? 'ml-4 bg-[#00CED1]/15 text-white border border-[#00CED1]/20'
                : 'mr-4 bg-white/[0.05] text-white/85 border border-white/5')
            }
          >
            {msg.content}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Calyx is refining…
          </div>
        )}
      </div>

      <div className="shrink-0 p-3 border-t border-white/5 space-y-2 bg-[#252338]">
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isSending || disabled}
              onClick={() => setInput((prev) => (prev ? `${prev}\n${suggestion}` : suggestion))}
              className="text-[10px] text-white/50 hover:text-[#00CED1] bg-white/5 hover:bg-[#00CED1]/10 rounded-full px-2.5 py-1 transition-colors disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending || disabled}
            rows={3}
            placeholder="e.g. Make lesson 2 easier and add encouragement…"
            className="flex-1 resize-y rounded-xl bg-white/[0.05] border border-transparent focus:border-[#00CED1]/30 px-3 py-2.5 text-white text-sm outline-none placeholder:text-white/30 disabled:opacity-50 min-h-[72px]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isSending || disabled}
            className="shrink-0 w-10 h-10 rounded-xl bg-[#00CED1] text-[#111023] flex items-center justify-center hover:bg-[#00B8BB] disabled:opacity-40"
            aria-label="Send refinement"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-white/30 text-[10px]">Enter for a new line · Click Send to submit</p>
      </div>
    </div>
  )
}
