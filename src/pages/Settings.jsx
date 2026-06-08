import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../lib/auth-session'
import AdminLayout from '../components/AdminLayout'
import RoleManagementDrawer from '../components/RoleManagementDrawer'
import RoleManagementModal from '../components/RoleManagementModal'
import AddPeopleModal from '../components/AddPeopleModal'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

const NOTIFICATIONS = [
  {
    key: 'struggling',
    title: 'Student Struggling Alerts',
    sub: 'Notify when student fails 3+ times',
  },
  {
    key: 'sel',
    title: 'SEL Red Flag Alerts',
    sub: 'Notify on low mood 3+ days',
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

function Card({ title, children }) {
  return (
    <section
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-lg font-semibold border-b border-white/10 pb-4">
        {title}
      </h3>
      <div className="pt-5">{children}</div>
    </section>
  )
}

function Label({ children }) {
  return (
    <span className="block text-white text-sm font-semibold mb-2">
      {children}
    </span>
  )
}

function TextInput({ ...rest }) {
  return (
    <input
      {...rest}
      className="w-full px-4 py-3.5 rounded-full bg-transparent text-white text-sm outline-none border placeholder:text-white/40 focus:border-[#00CED1]"
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
        <p className="text-white text-sm font-semibold leading-tight">
          {title}
        </p>
        <p className="text-white/50 text-xs mt-1">{sub}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function AccountInformation() {
  return (
    <Card title="Account Information">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <TextInput type="text" placeholder="Full Name" />
        </div>
        <div>
          <Label>Email Address</Label>
          <TextInput
            type="email"
            placeholder="AllexFiller705842@gmail.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end mt-4">
        <div>
          <Label>Password</Label>
          <TextInput type="password" placeholder="••••••••••••••" />
        </div>
        <button
          type="button"
          className="rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-6 py-3 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </Card>
  )
}

function Notifications() {
  const [state, setState] = useState({
    struggling: true,
    sel: true,
    parent: true,
    digest: true,
  })
  return (
    <Card title="Notifications">
      <div className="flex flex-col divide-y divide-white/5">
        {NOTIFICATIONS.map((n) => (
          <NotificationRow
            key={n.key}
            title={n.title}
            sub={n.sub}
            checked={state[n.key]}
            onChange={(v) => setState({ ...state, [n.key]: v })}
          />
        ))}
      </div>
    </Card>
  )
}

function RoleManagement({ onManage }) {
  return (
    <Card title="Role Management">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-white text-sm font-semibold">Current Role</p>
          <p className="text-white/50 text-xs mt-1">Your permission level</p>
        </div>
        <span
          className="inline-flex items-center justify-center rounded-full border border-[#00CED1] text-[#00CED1] text-xs font-medium px-3 py-1"
          style={{ backgroundColor: 'rgba(0,206,209,0.06)' }}
        >
          Admin
        </span>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-white/5">
        <div>
          <p className="text-white text-sm font-semibold">
            Assign / Change Roles
          </p>
          <p className="text-white/50 text-xs mt-1">
            Manage roles for all administrators and wayfinders
          </p>
        </div>
        <button
          type="button"
          onClick={onManage}
          className="rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-xs font-semibold px-5 py-2 transition-colors"
        >
          Manage Roles
        </button>
      </div>
    </Card>
  )
}

function DangerZone({ onLogout }) {
  return (
    <Card title="Danger Zone">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-white text-sm font-semibold">Log Out</p>
          <p className="text-white/50 text-xs mt-1">
            Sign out of your admin account
          </p>
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [addPeopleOpen, setAddPeopleOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  return (
    <AdminLayout title="Settings" userSubtitle="Super Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          Settings
        </h2>
        <p className="text-white/50 text-sm">
          Manage account preferences and system configuration.
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-6">
        <AccountInformation />
        <Notifications />
        <RoleManagement onManage={() => setDrawerOpen(true)} />
        <DangerZone onLogout={() => setLogoutOpen(true)} />
      </div>

      {/* Drawers + modals */}
      <RoleManagementDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onActionClick={() => {
          setDrawerOpen(false)
          setRoleModalOpen(true)
        }}
      />
      <RoleManagementModal
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onAdd={() => {
          setRoleModalOpen(false)
          setAddPeopleOpen(true)
        }}
      />
      <AddPeopleModal
        open={addPeopleOpen}
        onClose={() => setAddPeopleOpen(false)}
      />
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
