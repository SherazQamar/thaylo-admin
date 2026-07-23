import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  fetchAdminProfile,
  getApiErrorMessage,
  isAdminPortalRole,
  loginAdmin,
} from '../lib/auth-api'
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

export default function AdminSignIn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
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
      setError(getApiErrorMessage(err))
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
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

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-[#111023]">
      {/* Left Half - hidden on mobile */}
      <div className="relative hidden lg:flex w-1/2 bg-[#313044] flex-col pt-16 px-16 pb-0 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Thaylo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <div className="leading-none">
              <span
                className="block text-[20px] font-medium tracking-[0.08em]"
                style={{
                  background: 'linear-gradient(90deg, #60D624, #00A19A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                THAYLO
              </span>
              <span className="block text-[8px] tracking-[0.2em] text-[#60D624]/70 uppercase mt-0.5">
                GLOBAL AI SCHOOL
              </span>
            </div>
          </div>
          <h1
            className="text-white text-[36px] font-semibold leading-[1.1] tracking-tight max-w-[400px] mt-6"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Education Without Walls
          </h1>
          <p
            className="text-white/70 text-lg mt-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            A flexible learning experience that keeps students, families,
            <br />
            and Wayfinders connected—wherever they are.
          </p>
        </div>

        <div className="relative z-10 flex justify-start mt-auto mb-0">
          <img
            src={parentImg}
            alt="Parent character"
            width={320}
            height={360}
            className="w-[280px] max-h-[50vh] object-contain object-bottom"
          />
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#00CED1]/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Right Half */}
      {modal === 'new-password' ? (
        /* Enter New Password - Full right panel */
        <div className="w-full lg:w-1/2 flex-1 flex flex-col px-6 pt-6 pb-8 sm:p-12 lg:px-20 lg:py-16 lg:items-center lg:justify-center">
          <div className="w-full max-w-[420px] lg:max-w-[560px] mx-auto">
            <div className="rounded-[16px] p-6 border border-[#525162]/50 lg:bg-transparent lg:rounded-[19px] lg:border lg:border-[#525162]/50 lg:px-10 lg:py-10">
              <h2
                className="text-white text-xl sm:text-2xl font-semibold mb-8 tracking-wide uppercase text-center"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Enter New Password
              </h2>

              <form onSubmit={handleSetNewPassword} className="space-y-5">
                <div>
                  <label
                    className="block text-sm font-medium text-white/70 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    New password
                  </label>
                  <PasswordInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 sm:py-3.5 rounded-full bg-[#313044] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 transition-colors placeholder:text-white/30"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-white/70 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Confirm new password
                  </label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    required
                    autoComplete="new-password"
                    toggleLabel="Toggle confirm password visibility"
                    className="w-full px-4 py-3 sm:py-3.5 rounded-full bg-[#313044] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 transition-colors placeholder:text-white/30"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-[16px] bg-[#00CED1] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#00B8BB] transition-colors cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Sign In - Full right panel */
        <div className="w-full lg:w-1/2 flex-1 flex flex-col items-center justify-center px-6 pt-6 pb-8 sm:p-12 lg:px-20 lg:py-16">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 flex items-center gap-2.5 self-start">
            <img
              src={logo}
              alt="Thaylo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
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

          <div className="w-full max-w-[420px] lg:max-w-[560px] mx-auto">
            {/* Form Card */}
            <div className="rounded-[16px] p-6 border border-[#525162]/50 lg:bg-transparent lg:rounded-[19px] lg:border lg:border-[#525162]/50 lg:px-10 lg:py-10">
              <h2
                className="text-white text-xl sm:text-2xl lg:text-3xl font-semibold mb-8 sm:mb-10 tracking-wide uppercase text-center"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Welcome to Thaylo
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/70 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
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
                    className="w-full px-4 py-3 sm:py-3.5 rounded-full bg-[#313044] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 transition-colors placeholder:text-white/30"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white/70 mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
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
                    className="w-full px-4 py-3 sm:py-3.5 rounded-full bg-[#313044] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 transition-colors placeholder:text-white/30"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Forget Password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail('')
                      setModal('reset')
                    }}
                    className="text-[13px] text-[#00CED1] underline font-normal cursor-pointer"
                    style={{ fontFamily: 'Inter, sans-serif', lineHeight: '20px' }}
                  >
                    Forget Password?
                  </button>
                </div>

                {error && (
                  <p
                    className="text-sm text-red-400 text-center"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full py-3.5 sm:py-4 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold uppercase tracking-wide hover:bg-[#00B8BB] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {modal === 'reset' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModal('none')}
          />
          <div
            className="relative w-full max-w-[380px] lg:max-w-[440px] rounded-[19px] p-6 lg:p-8 border border-[#525162]/50"
            style={{ backgroundColor: '#313044', fontFamily: 'Inter, sans-serif' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setModal('none')}
              className="absolute top-4 right-4 w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
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

            <h3 className="text-white text-xl font-bold text-center mb-1">
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
                  className="w-full px-4 py-3 rounded-full bg-[#111023] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 transition-colors placeholder:text-white/30"
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
                className="w-full py-4 rounded-[16px] bg-[#00CED1] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#00B8BB] transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {modal === 'verification' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModal('none')}
          />
          <div
            className="relative w-full max-w-[380px] lg:max-w-[440px] rounded-[19px] p-6 lg:p-8 border border-[#525162]/50"
            style={{ backgroundColor: '#313044', fontFamily: 'Inter, sans-serif' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setModal('none')}
              className="absolute top-4 right-4 w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
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

            <h3 className="text-white text-xl font-bold text-center mb-1">
              Email verification
            </h3>
            <p className="text-white/50 text-sm text-center mb-6">
              We send a reset password link to your email
            </p>

            {/* Email Illustration */}
            <div className="flex justify-center mb-6">
              <div className="relative w-[200px] h-[140px]">
                {/* Background blob */}
                <div className="absolute inset-0 bg-[#1a3a4a] rounded-full opacity-60" />
                {/* Envelope */}
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
              onClick={handleResetPassword}
              className="w-full py-4 rounded-[16px] bg-[#00CED1] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#00B8BB] transition-colors cursor-pointer"
            >
              Reset Password
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
