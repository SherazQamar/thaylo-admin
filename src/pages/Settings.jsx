import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../lib/auth-session'
import AdminLayout from '../components/AdminLayout'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import AdminAvatarPicker from '../components/AdminAvatarPicker'
import PasswordInput from '../components/PasswordInput'
import {
  changeAdminPassword,
  fetchAdminProfile,
  getApiErrorMessage,
  updateAdminProfile,
} from '../lib/auth-api'
import { useAuthStore } from '../stores/auth.store'

const NOTIFICATIONS = [
  {
    key: 'struggling',
    title: 'Student Struggling Alerts',
    sub: 'Yellow (1 fail), orange (2), red (3+) lesson attempts',
  },
  {
    key: 'sel',
    title: 'SEL Red Flag Alerts',
    sub: 'Notify on 3+ consecutive low-mood days',
  },
  {
    key: 'parent',
    title: 'Parent Messages',
    sub: 'Receive parent message notifications',
  },
  {
    key: 'digest',
    title: 'Weekly Digest',
    sub: 'Weekly performance summary email',
  },
]

const DEFAULT_NOTIFICATIONS = {
  struggling: true,
  sel: true,
  parent: true,
  digest: true,
}

function notificationStorageKey(userId) {
  return `thaylo-admin-notification-prefs:${userId}`
}

function loadNotificationPrefs(userId) {
  if (!userId) return { ...DEFAULT_NOTIFICATIONS }
  try {
    const raw = localStorage.getItem(notificationStorageKey(userId))
    if (!raw) return { ...DEFAULT_NOTIFICATIONS }
    return { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_NOTIFICATIONS }
  }
}

function saveNotificationPrefs(userId, prefs) {
  if (!userId) return
  localStorage.setItem(notificationStorageKey(userId), JSON.stringify(prefs))
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
      <h3 className="text-white text-lg font-semibold border-b border-white/10 pb-4">
        {title}
      </h3>
      <div className="pt-5">{children}</div>
    </section>
  )
}

function Label({ children }) {
  return <span className="block text-white text-sm font-semibold mb-2">{children}</span>
}

function TextInput({ ...rest }) {
  return (
    <input
      {...rest}
      className="w-full px-4 py-3.5 rounded-full bg-transparent text-white text-sm outline-none border placeholder:text-white/40 focus:border-[#00CED1] disabled:opacity-60"
      style={{ borderColor: '#00CED1' }}
    />
  )
}

function PasswordField({ ...rest }) {
  return (
    <PasswordInput
      {...rest}
      className="w-full px-4 py-3.5 rounded-full bg-transparent text-white text-sm outline-none border placeholder:text-white/40 focus:border-[#00CED1] disabled:opacity-60"
      style={{ borderColor: '#00CED1' }}
    />
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 transition-colors"
      style={{
        width: '38px',
        height: '22px',
        borderRadius: '999px',
        backgroundColor: checked ? '#00CED1' : 'rgba(255,255,255,0.15)',
      }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white transition-all"
        style={{
          width: '16px',
          height: '16px',
          left: checked ? '19px' : '3px',
        }}
      />
    </button>
  )
}

function NotificationRow({ title, sub, checked, onChange }) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <span className="w-10 h-10 rounded-full bg-[#00CED1]/15 border border-[#00CED1]/30 flex items-center justify-center shrink-0">
        <Volume2 size={18} className="text-[#00CED1]" strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-tight">{title}</p>
        <p className="text-white/50 text-xs mt-1">{sub}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function AccountInformation({ profile, onSaved }) {
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

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
      onSaved?.()
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

  function handleSaveProfile(e) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!name.trim()) {
      setError('Full name is required.')
      return
    }
    profileMutation.mutate({ name: name.trim() })
  }

  function handleSavePassword(e) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Fill all password fields to change your password.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    passwordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword,
    })
  }

  const busy = profileMutation.isPending || passwordMutation.isPending

  return (
    <Card title="Account Information">
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <TextInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div>
            <Label>Email Address</Label>
            <TextInput type="email" value={profile?.email ?? ''} disabled readOnly />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-6 py-3 transition-colors disabled:opacity-50"
        >
          {profileMutation.isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      <form onSubmit={handleSavePassword} className="mt-6 space-y-4 border-t border-white/10 pt-5">
        <p className="text-white/60 text-xs">Change password</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Current Password</Label>
            <PasswordField
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <Label>New Password</Label>
            <PasswordField
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <PasswordField
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••••"
              autoComplete="new-password"
              toggleLabel="Toggle confirm password visibility"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-semibold px-6 py-3 transition-colors disabled:opacity-50"
        >
          {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
        </button>
      </form>

      {message ? <p className="mt-3 text-[#00CED1] text-xs">{message}</p> : null}
      {error ? <p className="mt-3 text-[#FF6F6F] text-xs">{error}</p> : null}
    </Card>
  )
}

function Notifications({ userId }) {
  const [state, setState] = useState(() => loadNotificationPrefs(userId))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setState(loadNotificationPrefs(userId))
  }, [userId])

  function updatePref(key, value) {
    setState((prev) => {
      const next = { ...prev, [key]: value }
      saveNotificationPrefs(userId, next)
      setSaved(true)
      return next
    })
  }

  return (
    <Card title="Notifications">
      <div className="flex flex-col divide-y divide-white/5">
        {NOTIFICATIONS.map((n) => (
          <NotificationRow
            key={n.key}
            title={n.title}
            sub={n.sub}
            checked={!!state[n.key]}
            onChange={(v) => updatePref(n.key, v)}
          />
        ))}
      </div>
      {saved ? (
        <p className="mt-3 text-[#00CED1] text-xs">
          Preferences saved on this device for your admin account.
        </p>
      ) : null}
    </Card>
  )
}

function DangerZone({ onLogout }) {
  return (
    <Card title="Danger Zone">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-white text-sm font-semibold">Log Out</p>
          <p className="text-white/50 text-xs mt-1">Sign out of your admin account</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full bg-[#FF7B7B] hover:bg-[#ff6b6b] text-[#111023] text-xs font-semibold px-5 py-2 transition-colors"
        >
          Log Out
        </button>
      </div>
    </Card>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const profileQuery = useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: fetchAdminProfile,
  })

  const profile = useMemo(
    () => profileQuery.data ?? user ?? null,
    [profileQuery.data, user],
  )

  return (
    <AdminLayout title="Settings" userSubtitle="Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-white/50 text-sm">
          Manage account preferences and system configuration.
        </p>
      </div>

      {profileQuery.isError ? (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm bg-[#FF6F6F]/10 text-[#FF6F6F] border border-[#FF6F6F]/20">
          {getApiErrorMessage(profileQuery.error)}
        </div>
      ) : null}

      <div className="flex flex-col gap-5 mt-6">
        <AdminAvatarPicker />
        <AccountInformation
          profile={profile}
          onSaved={() => profileQuery.refetch()}
        />
        <Notifications userId={profile?.id ?? user?.id} />
        <DangerZone onLogout={() => setLogoutOpen(true)} />
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
    </AdminLayout>
  )
}
