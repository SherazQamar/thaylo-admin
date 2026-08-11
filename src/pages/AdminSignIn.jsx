import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  fetchAdminProfile,
  isAdminPortalRole,
  loginAdmin,
} from '../lib/auth-api'
import { notify } from '../lib/notify'
import { getAdminToken } from '../lib/auth-cookies'
import {
  getHomePathForRole,
  isPathAllowedForRole,
} from '../lib/portal-auth'
import { logoutAdmin, setAdminSession } from '../lib/auth-session'
import { useAuthStore } from '../stores/auth.store'
import PasswordInput from '../components/PasswordInput'
import logo from '../assets/logo.png'
import parentImg from '../assets/Parent P1.png'

const inter = { fontFamily: 'Inter, sans-serif' }

function BrandMark({ size = 'md' }) {
  const logoSize = size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
  const titleSize = size === 'lg' ? 'text-[20px]' : 'text-[18px]'
  const subSize = size === 'lg' ? 'text-[8px]' : 'text-[7px]'

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logo}
        alt="Thaylo"
        width={48}
        height={48}
        className={`${logoSize} object-contain`}
      />
      <div className="leading-none">
        <span
          className={`block ${titleSize} font-medium tracking-[0.08em]`}
          style={{
            background: 'linear-gradient(90deg, #60D624, #00A19A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          THAYLO
        </span>
        <span
          className={`block ${subSize} tracking-[0.2em] text-[#60D624]/70 uppercase mt-0.5`}
        >
          GLOBAL AI SCHOOL
        </span>
      </div>
    </div>
  )
}

function ModalShell({ children, onClose, maxWidth = 'max-w-[380px] lg:max-w-[440px]' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 cursor-pointer"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} rounded-t-[24px] sm:rounded-[19px] p-6 lg:p-8 border border-[#525162]/50 max-h-[92dvh] overflow-y-auto`}
        style={{
          backgroundColor: '#313044',
          ...inter,
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full border border-white/30 flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1l8 8M9 1l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}

export default function AdminSignIn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modal, setModal] = useState('none') // 'none' | 'reset' | 'verification' | 'new-password'
  const [resetEmail, setResetEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const token = getAdminToken()
    if (!token) return

    let cancelled = false

    async function redirectIfSessionValid() {
      try {
        let role = user?.role
        if (!role) {
          const profile = await fetchAdminProfile()
          if (cancelled) return
          if (!isAdminPortalRole(profile.role)) {
            logoutAdmin()
            return
          }
          useAuthStore.getState().setUser(profile)
          role = profile.role
        }

        const returnUrl = searchParams.get('returnUrl')
        if (returnUrl && isPathAllowedForRole(returnUrl, role)) {
          navigate(returnUrl, { replace: true })
          return
        }

        navigate(getHomePathForRole(role), { replace: true })
      } catch {
        if (!cancelled) logoutAdmin()
      }
    }

    redirectIfSessionValid()

    return () => {
      cancelled = true
    }
  }, [navigate, searchParams, user?.role])

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { user, accessToken } = await loginAdmin(email.trim(), password)
      if (!isAdminPortalRole(user.role)) {
        logoutAdmin()
        throw new Error(
          'This account cannot sign in here. Use the Parent or Wayfinder portal.',
        )
      }
      setAdminSession(accessToken, user)
      return user
    },
    onSuccess: (loggedInUser) => {
      const returnUrl = searchParams.get('returnUrl')
      if (
        returnUrl &&
        isPathAllowedForRole(returnUrl, loggedInUser.role)
      ) {
        navigate(returnUrl)
        return
      }
      navigate(getHomePathForRole(loggedInUser.role))
    },
    onError: (err) => {
      notify.error(err)
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    loginMutation.mutate()
  }

  function handleSendReset(e) {
    e.preventDefault()
    setModal('verification')
  }

  function handleResetPassword() {
    setModal('new-password')
  }

  function handleSetNewPassword(e) {
    e.preventDefault()
    setModal('none')
  }

  const maskedEmail = resetEmail
    ? resetEmail.replace(/(.{3})(.*)(@.*)/, '$1xxxxx$3')
    : 'johnxxxx@gmail.com'

  const fieldClass =
    'w-full px-5 py-3.5 rounded-full bg-[#313044] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 transition-colors placeholder:text-white/30'

  return (
    <div
      className="min-h-dvh flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#111023]"
      style={inter}
    >
      {/* Left Half — desktop brand panel */}
      <div className="relative hidden lg:flex w-1/2 bg-[#313044] flex-col pt-16 px-16 pb-0 overflow-hidden">
        <div className="relative z-10">
          <BrandMark size="lg" />
          <h1 className="text-white text-[36px] font-semibold leading-[1.1] tracking-tight max-w-[400px] mt-6">
            Education Without Walls
          </h1>
          <p className="text-white/70 text-lg mt-3">
            A flexible learning experience that keeps students, families,
            <br />
            and Wayfinders connected—wherever they are.
          </p>
        </div>

        <div className="relative z-10 flex justify-start mt-auto mb-0">
          <img
            src={parentImg}
            alt=""
            width={320}
            height={360}
            className="w-[280px] max-h-[50vh] object-contain object-bottom"
          />
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#00CED1]/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Right Half */}
      {modal === 'new-password' ? (
        <div
          className="w-full lg:w-1/2 flex-1 flex flex-col px-5 sm:px-8 lg:px-20 py-6 lg:py-16 lg:items-center lg:justify-center overflow-y-auto"
          style={{
            paddingTop: 'max(1.5rem, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="lg:hidden mb-8">
            <BrandMark />
          </div>
          <div className="w-full max-w-[420px] lg:max-w-[560px] mx-auto">
            <div className="rounded-[20px] p-6 sm:p-8 border border-[#525162]/50 bg-[#313044]/40 lg:bg-transparent">
              <h2 className="text-white text-xl sm:text-2xl font-semibold mb-8 tracking-wide uppercase text-center">
                Enter New Password
              </h2>

              <form onSubmit={handleSetNewPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    New password
                  </label>
                  <PasswordInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    required
                    autoComplete="new-password"
                    className={fieldClass}
                    style={inter}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Confirm new password
                  </label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    required
                    autoComplete="new-password"
                    toggleLabel="Toggle confirm password visibility"
                    className={fieldClass}
                    style={inter}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold uppercase tracking-wide hover:bg-[#00B8BB] transition-colors cursor-pointer"
                >
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-full lg:w-1/2 flex-1 flex flex-col items-stretch justify-start lg:items-center lg:justify-center px-5 sm:px-8 lg:px-20 overflow-y-auto"
          style={{
            paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Mobile brand */}
          <div className="lg:hidden mb-8 sm:mb-10">
            <BrandMark />
            <p className="mt-5 text-white/50 text-sm leading-relaxed max-w-[320px]">
              Sign in to the Admin portal to manage parents, students, and Wayfinders.
            </p>
          </div>

          <div className="w-full max-w-[420px] lg:max-w-[560px] mx-auto my-auto lg:my-0">
            <div className="rounded-[20px] p-6 sm:p-8 border border-[#525162]/50 bg-[#313044]/35 lg:bg-transparent lg:border-[#525162]/50">
              <h2 className="text-white text-[22px] sm:text-2xl lg:text-3xl font-semibold mb-7 sm:mb-10 tracking-wide uppercase text-center leading-tight">
                Welcome to Thaylo
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Aliex@gmail.com"
                    required
                    autoComplete="email"
                    inputMode="email"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/70 mb-2"
                  >
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className={fieldClass}
                    style={inter}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail('')
                      setModal('reset')
                    }}
                    className="text-[13px] text-[#00CED1] underline font-normal cursor-pointer"
                    style={{ lineHeight: '20px' }}
                  >
                    Forget Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full py-4 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold uppercase tracking-wide hover:bg-[#00B8BB] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {modal === 'reset' && (
        <ModalShell onClose={() => setModal('none')}>
          <h3 className="text-white text-xl font-bold text-center mb-1 pr-6">
            Reset Password
          </h3>
          <p className="text-[#00CED1] text-sm text-center mb-6">
            Enter your email address to reset your password.
          </p>

          <form onSubmit={handleSendReset} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="JaneDoe@gmail.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-full bg-[#111023] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 transition-colors placeholder:text-white/30"
              />
            </div>

            <p className="text-white/50 text-xs leading-relaxed">
              Enter your email address and we&apos;ll send you instructions to
              reset your password. For security reasons, we do NOT store your
              password. So rest assured that we will never send your password
              via email.
            </p>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold uppercase tracking-wide hover:bg-[#00B8BB] transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>
        </ModalShell>
      )}

      {modal === 'verification' && (
        <ModalShell onClose={() => setModal('none')}>
          <h3 className="text-white text-xl font-bold text-center mb-1 pr-6">
            Email verification
          </h3>
          <p className="text-white/50 text-sm text-center mb-6">
            We send a reset password link to your email
          </p>

          <div className="flex justify-center mb-6">
            <div className="relative w-[180px] sm:w-[200px] h-[120px] sm:h-[140px]">
              <div className="absolute inset-0 bg-[#1a3a4a] rounded-full opacity-60" />
              <svg viewBox="0 0 200 140" className="relative z-10 w-full h-full">
                <rect
                  x="50"
                  y="50"
                  width="100"
                  height="70"
                  rx="6"
                  fill="#00CED1"
                  stroke="#111023"
                  strokeWidth="2"
                />
                <path
                  d="M50 50 L100 90 L150 50"
                  fill="#0097A7"
                  stroke="#111023"
                  strokeWidth="2"
                />
                <rect
                  x="60"
                  y="35"
                  width="80"
                  height="50"
                  rx="4"
                  fill="#F5F5F5"
                  stroke="#111023"
                  strokeWidth="1.5"
                />
                <path d="M70 50h60M70 60h40" stroke="#CCC" strokeWidth="2" />
                <path
                  d="M145 55 L175 45 L160 70 L155 58Z"
                  fill="white"
                  stroke="#111023"
                  strokeWidth="1"
                />
                <path
                  d="M40 80 Q60 40 100 50 Q130 58 145 55"
                  fill="none"
                  stroke="#00CED1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>
          </div>

          <p className="text-white/60 text-sm text-center mb-1">
            We sent an email to{' '}
            <span className="font-semibold text-white">{maskedEmail}</span>
          </p>
          <p className="text-white/40 text-xs text-center mb-6 leading-relaxed">
            If this email address was used to create an account, instructions
            to reset your password will be sent to you. Please check your
            email.
          </p>

          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full py-4 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold uppercase tracking-wide hover:bg-[#00B8BB] transition-colors cursor-pointer"
          >
            Reset Password
          </button>
        </ModalShell>
      )}
    </div>
  )
}
