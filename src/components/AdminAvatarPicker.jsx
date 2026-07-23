import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAdminAvatarPresets, setAdminAvatar } from '../lib/avatar-api'
import { getApiErrorMessage } from '../lib/auth-api'
import { useAuthStore } from '../stores/auth.store'

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

export default function AdminAvatarPicker() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const presetsQuery = useQuery({
    queryKey: ['admin-avatar-presets'],
    queryFn: fetchAdminAvatarPresets,
    enabled: open,
  })

  const saveMutation = useMutation({
    mutationFn: setAdminAvatar,
    onSuccess: (updated) => {
      if (!user) return
      setUser({
        ...user,
        avatarKey: updated.avatarKey ?? null,
        avatarUrl: updated.avatarUrl ?? null,
      })
      void queryClient.invalidateQueries({ queryKey: ['admin-avatar-presets'] })
      setOpen(false)
    },
  })

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const presets = presetsQuery.data ?? []
  const currentUrl = user?.avatarUrl ?? null

  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
      <h3 className="text-white text-lg font-semibold border-b border-white/10 pb-4">
        Profile Avatar
      </h3>
      <div className="pt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative group w-16 h-16 rounded-full overflow-hidden shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00CED1]"
          aria-label="Change profile avatar"
        >
          <span className="block w-full h-full transition-[filter] duration-200 group-hover:blur-[2px]">
            {currentUrl ? (
              <img
                src={currentUrl}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="block w-16 h-16 rounded-full bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
            )}
          </span>
          <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-black/0 text-white opacity-0 transition-all duration-200 group-hover:bg-black/45 group-hover:opacity-100">
            <CameraIcon />
            <span className="text-[10px] font-semibold">Change</span>
          </span>
        </button>
        <p className="text-white/55 text-sm">
          Hover and click your avatar to choose from the official set for your role.
        </p>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close avatar picker"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-xl"
            style={{ backgroundColor: '#313044' }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h4 className="text-white text-lg font-semibold">Choose avatar</h4>
                <p className="text-white/50 text-sm mt-1">
                  Official Thaylo avatars only — no external uploads.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {presetsQuery.isLoading ? (
              <p className="text-white/45 text-sm">Loading avatars…</p>
            ) : null}

            {presetsQuery.isError ? (
              <p className="text-[#FF7B7B] text-sm" role="alert">
                {getApiErrorMessage(presetsQuery.error)}
              </p>
            ) : null}

            {presets.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto">
                {presets.map((preset) => {
                  const selected = currentUrl === preset.imageUrl
                  const saving =
                    saveMutation.isPending && saveMutation.variables === preset.key
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      disabled={saveMutation.isPending}
                      onClick={() => saveMutation.mutate(preset.key)}
                      className={
                        'relative aspect-square rounded-full overflow-hidden transition-transform hover:scale-105 disabled:opacity-60 ' +
                        (selected
                          ? 'ring-2 ring-[#00CED1] ring-offset-2 ring-offset-[#313044]'
                          : 'ring-1 ring-white/10 hover:ring-[#00CED1]/50')
                      }
                      aria-pressed={selected}
                      title={preset.key}
                    >
                      <img
                        src={preset.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {saving ? (
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-semibold">
                          …
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {saveMutation.isError ? (
              <p className="text-[#FF7B7B] text-sm mt-3" role="alert">
                {getApiErrorMessage(saveMutation.error)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
