import { useState } from 'react'
import { X } from 'lucide-react'

export default function AddPeopleModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  if (!open) return null

  function handleInvite() {
    onInvite?.({ email, role })
    onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-[520px] rounded-2xl p-7"
        style={{ backgroundColor: '#313044' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white text-xl font-bold">Add People</h3>
            <p className="text-white/50 text-sm mt-1">
              Please enter the required details to Invite.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mt-6">
          <label className="block text-white text-sm font-semibold mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="AllexFiller705842@gmail.com"
            className="w-full px-4 py-3.5 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
          />
        </div>

        <div className="mt-4">
          <label className="block text-white text-sm font-semibold mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3.5 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
          >
            <option value="" className="bg-[#313044] text-white/40">
              Select Role
            </option>
            <option value="wayfinder" className="bg-[#313044]">
              Wayfinder
            </option>
            <option value="admin" className="bg-[#313044]">
              Admin
            </option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-7">
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 rounded-full bg-white/[0.06] text-white text-sm font-semibold hover:bg-white/[0.1] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInvite}
            className="py-3.5 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold hover:bg-[#00B8BB] transition-colors"
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  )
}
