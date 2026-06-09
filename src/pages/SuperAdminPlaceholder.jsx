import SuperAdminLayout from '../components/SuperAdminLayout'

export default function SuperAdminPlaceholder({ title = 'Super Admin' }) {
  return (
    <SuperAdminLayout title={title}>
      <div className="rounded-2xl border border-white/10 bg-[#313044] p-10 text-center">
        <h2 className="text-white text-xl font-semibold">{title}</h2>
        <p className="text-white/50 text-sm mt-2">This section is coming soon.</p>
      </div>
    </SuperAdminLayout>
  )
}
