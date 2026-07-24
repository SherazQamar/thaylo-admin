import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getApiErrorMessage,
  setStaffInvitePassword,
  validateResetToken,
} from '../lib/auth-api'
import logo from '../assets/logo.png'
import PasswordInput from '../components/PasswordInput'

const MIN_PASSWORD_LENGTH = 8
const STAFF_ROLES = new Set(['ADMIN', 'SUPER_ADMIN'])

export default function SetStaffPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState(null)

  const tokenQuery = useQuery({
    queryKey: ['validate-staff-setup-token', token],
    queryFn: () => validateResetToken(token),
    enabled: token.length > 0,
    retry: false,
  })

  const role = tokenQuery.data?.role
  const tokenMissing = !token
  const tokenValidating = !tokenMissing && tokenQuery.isLoading
  const tokenInvalid = !tokenMissing && !tokenQuery.isLoading && tokenQuery.isError
  const tokenWrongRole =
    !tokenMissing &&
    !tokenQuery.isLoading &&
    tokenQuery.isSuccess &&
    !STAFF_ROLES.has(role)
  const tokenReady =
    !tokenMissing &&
    !tokenQuery.isLoading &&
    tokenQuery.isSuccess &&
    STAFF_ROLES.has(role)

  const setupMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
      }
      await setStaffInvitePassword({
        token,
        newPassword,
        confirmPassword,
      })
    },
    onSuccess: () => {
      navigate('/?setup=1', { replace: true })
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  })

  useEffect(() => {
    setFormError(null)
  }, [newPassword, confirmPassword])

  return (
    <div
      className="min-h-dvh flex flex-col lg:flex-row bg-[#111023]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="hidden lg:flex w-1/2 bg-[#313044] flex-col justify-between p-12">
        <img src={logo} alt="Thaylo" className="h-10 w-auto object-contain self-start" />
        <div>
          <h1 className="text-white text-4xl font-semibold leading-tight max-w-md">
            Welcome to
            <br />
            Thaylo Admin
          </h1>
          <p className="text-white/60 text-base mt-4 max-w-sm">
            Set your password to activate your Admin or Super Admin account.
          </p>
        </div>
        <p className="text-white/30 text-xs">Thaylo platform staff access</p>
      </div>

      <div
        className="flex-1 flex flex-col items-stretch justify-start lg:items-center lg:justify-center px-5 sm:px-6 py-6 lg:py-10 overflow-y-auto"
        style={{
          paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="lg:hidden mb-8 flex items-center gap-2.5">
          <img src={logo} alt="Thaylo" className="h-10 w-10 object-contain" />
          <div className="leading-none">
            <span
              className="block text-[18px] font-medium tracking-[0.08em]"
              style={{
                background: 'linear-gradient(90deg, #60D624, #00A19A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              THAYLO
            </span>
            <span className="block text-[7px] tracking-[0.2em] text-[#60D624]/70 uppercase mt-0.5">
              GLOBAL AI SCHOOL
            </span>
          </div>
        </div>

        <div
          className="w-full max-w-[440px] mx-auto rounded-2xl border border-white/10 p-6 sm:p-8"
          style={{ backgroundColor: '#313044' }}
        >
          {tokenMissing ? (
            <div className="text-center space-y-4">
              <h2 className="text-white text-xl font-semibold uppercase tracking-wide">
                Invalid Link
              </h2>
              <p className="text-white/50 text-sm">
                This setup link is missing a token. Check your invitation email or ask a Super Admin
                to resend it.
              </p>
            </div>
          ) : null}

          {tokenValidating ? (
            <p className="text-white/50 text-sm text-center py-8">Verifying invitation link…</p>
          ) : null}

          {(tokenInvalid || tokenWrongRole) && (
            <div className="text-center space-y-4">
              <h2 className="text-white text-xl font-semibold uppercase tracking-wide">
                Link Expired
              </h2>
              <p className="text-white/50 text-sm" role="alert">
                {tokenWrongRole
                  ? 'This setup link is for a different portal. Wayfinders should use the public set-password page.'
                  : getApiErrorMessage(tokenQuery.error)}
              </p>
              <p className="text-white/40 text-xs">
                Setup links expire after a limited time. Ask a Super Admin to resend the invitation.
              </p>
            </div>
          )}

          {tokenReady ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setFormError(null)
                setupMutation.mutate()
              }}
            >
              <div className="text-center mb-2">
                <h2 className="text-white text-xl font-semibold uppercase tracking-wide">
                  Set Your Password
                </h2>
                <p className="text-white/50 text-sm mt-2">
                  {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} account activation
                </p>
              </div>

              <label className="block">
                <span className="block text-white text-sm font-medium mb-1.5">New password</span>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
                />
              </label>
              <label className="block">
                <span className="block text-white text-sm font-medium mb-1.5">Confirm password</span>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  toggleLabel="Toggle confirm password visibility"
                  className="w-full px-4 py-3 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
                />
              </label>

              {formError ? <p className="text-xs text-[#FF6F6F]">{formError}</p> : null}

              <button
                type="submit"
                disabled={setupMutation.isPending}
                className="w-full py-3.5 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold disabled:opacity-50"
              >
                {setupMutation.isPending ? 'Saving…' : 'Activate Account'}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  )
}
