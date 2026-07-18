import SuperAdminLayout from '../components/SuperAdminLayout'

/**
 * Finance home for Super Admin. Revenue lives here (not on the dashboard)
 * so Billing & Plans is the single place for money metrics as billing ships.
 */
export default function BillingPlans() {
  return (
    <SuperAdminLayout title="Billing & Plans" userSubtitle="Super Admin">
      <div className="space-y-2 mb-6">
        <h2 className="text-white text-3xl font-bold tracking-tight">Billing & Plans</h2>
        <p className="text-white/50 text-sm">
          Platform finance overview. Subscription plans and invoicing will expand here.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#313044' }}>
          <p className="text-white/60 text-xs mb-2">Revenue</p>
          <p className="text-white text-3xl font-bold leading-none">$0</p>
          <p className="text-white/40 text-xs mt-3">
            No billing integration yet — this box is the finance home for revenue once plans
            go live.
          </p>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: '#313044' }}>
          <p className="text-white/60 text-xs mb-2">Active Subscriptions</p>
          <p className="text-white text-3xl font-bold leading-none">—</p>
          <p className="text-white/40 text-xs mt-3">Coming with plan management.</p>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: '#313044' }}>
          <p className="text-white/60 text-xs mb-2">Outstanding Invoices</p>
          <p className="text-white text-3xl font-bold leading-none">—</p>
          <p className="text-white/40 text-xs mt-3">Coming with invoicing.</p>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
