import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import SuperAdminLayout from '../components/SuperAdminLayout'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import AdminAvatarPicker from '../components/AdminAvatarPicker'
import PasswordInput from '../components/PasswordInput'
import { logoutAdmin } from '../lib/auth-session'
import {
  changeAdminPassword,
  fetchAdminProfile,
  getApiErrorMessage,
  updateAdminProfile,
} from '../lib/auth-api'
import { useAuthStore } from '../stores/auth.store'

function Card({ title, children }) {
  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
      <h3 className="text-white text-lg font-semibold border-b border-white/10 pb-4">{title}</h3>
      <div className="pt-5">{children}</div>
    </section>
  )
}

export default function SuperAdminAccount() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const profileQuery = useQuery({
    queryKey: ['super-admin', 'profile'],
    queryFn: fetchAdminProfile,
  })

  const profile = useMemo(
    () => profileQuery.data ?? user ?? null,
    [profileQuery.data, user],
  )

  useEffect(() => {
    setName(profile?.name ?? '')
  }, [profile])

  const profileMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (updated) => {
      if (user) {
        setUser({
          ...user,
          name: updated.name ?? name,
          avatarKey: updated.avatarKey ?? user.avatarKey,
          avatarUrl: updated.avatarUrl ?? user.avatarUrl,
        })
      }
      setMessage('Profile saved.')
      setError(null)
      void profileQuery.refetch()
    },
    onError: (err) => {
      setMessage(null)
      setError(getApiErrorMessage(err))
    },
  })

  const passwordMutation = useMutation({
    mutationFn: changeAdminPassword,
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Password updated.')
      setError(null)
    },
    onError: (err) => {
      setMessage(null)
      setError(getApiErrorMessage(err))
    },
  })

  return (
    <SuperAdminLayout title="Account">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">Account</h2>
        <p className="text-white/50 text-sm">
          Manage your Super Admin profile, avatar, and password.
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-6">
        <AdminAvatarPicker />

        <Card title="Profile">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!name.trim()) {
                setError('Full name is required.')
                return
              }
              profileMutation.mutate({ name: name.trim() })
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-white text-sm font-semibold mb-2">Full name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-full bg-transparent text-white text-sm outline-none border border-[#00CED1]"
                />
              </label>
              <label className="block">
                <span className="block text-white text-sm font-semibold mb-2">Email</span>
                <input
                  value={profile?.email ?? ''}
                  disabled
                  readOnly
                  className="w-full px-4 py-3.5 rounded-full bg-transparent text-white text-sm outline-none border border-[#00CED1] opacity-60"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-6 py-3 disabled:opacity-50"
            >
              {profileMutation.isPending ? 'Saving…' : 'Save Profile'}
            </button>
          </form>

          <form
            className="mt-6 space-y-4 border-t border-white/10 pt-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (!currentPassword || !newPassword || !confirmPassword) {
                setError('Fill all password fields.')
                return
              }
              if (newPassword !== confirmPassword) {
                setError('New password and confirmation do not match.')
                return
              }
              passwordMutation.mutate({ currentPassword, newPassword, confirmPassword })
            }}
          >
            <p className="text-white/60 text-xs">Change password</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current"
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-full bg-transparent text-white text-sm outline-none border border-[#00CED1]"
              />
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New"
                autoComplete="new-password"
                className="w-full px-4 py-3.5 rounded-full bg-transparent text-white text-sm outline-none border border-[#00CED1]"
              />
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm"
                autoComplete="new-password"
                toggleLabel="Toggle confirm password visibility"
                className="w-full px-4 py-3.5 rounded-full bg-transparent text-white text-sm outline-none border border-[#00CED1]"
              />
            </div>
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-semibold px-6 py-3 disabled:opacity-50"
            >
              {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
            </button>
          </form>

          {(message || error) && (
            <p className={`mt-3 text-xs ${error ? 'text-[#FF6F6F]' : 'text-[#00CED1]'}`}>
              {error ?? message}
            </p>
          )}
        </Card>

        <Card title="Session">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-semibold">Log out</p>
              <p className="text-white/50 text-xs mt-1">Sign out of Super Admin</p>
            </div>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="rounded-full bg-[#FF7B7B] hover:bg-[#ff6b6b] text-[#111023] text-xs font-semibold px-5 py-2"
            >
              Log Out
            </button>
          </div>
        </Card>
      </div>

      <LogoutConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false)
          logoutAdmin()
          navigate('/')
        }}
      />
    </SuperAdminLayout>
  )
}
