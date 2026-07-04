import { Link } from 'react-router-dom'
import { getAdminToken } from '../lib/auth-cookies'
import { getHomePathForRole } from '../lib/portal-auth'
import { useAuthStore } from '../stores/auth.store'
import logo from '../assets/logo.png'

function NotFoundHero() {
  return (
    <div className="relative w-full overflow-visible">
      <div className="relative z-10 mx-auto w-full max-w-[420px]">
        <img
          src="/404.png"
          alt=""
          className="w-full h-auto object-contain"
          aria-hidden
        />
      </div>
      <div className="relative -mt-5 sm:-mt-6 w-[calc(100%+3rem)] sm:w-[calc(100%+5rem)] -ml-6 sm:-ml-10">
        <img
          src="/switch.png"
          alt=""
          className="w-full h-[34px] sm:h-[42px] object-fill"
          aria-hidden
        />
      </div>
    </div>
  )
}

export default function NotFound() {
  const user = useAuthStore((state) => state.user)
  const token = getAdminToken()
  const homeHref =
    token && user?.role ? getHomePathForRole(user.role) : '/'

  return (
    <div
      className="min-h-screen bg-[#111023] flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="px-6 sm:px-10 pt-8">
        <Link
          to={homeHref}
          className="flex items-center gap-2.5 flex-shrink-0 w-fit hover:opacity-90 transition-opacity"
          aria-label="Go to Thaylo home page"
        >
          <img src={logo} alt="Thaylo" width={48} height={48} className="w-12 h-12 object-contain" />
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
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pb-12">
        <div className="w-full max-w-[520px] text-center">
          <NotFoundHero />

          <h1 className="text-white text-[22px] sm:text-[24px] font-semibold mt-10 mb-4">
            Page Not Found
          </h1>
          <p className="text-white/60 text-sm sm:text-[15px] leading-[1.7] max-w-[400px] mx-auto mb-10">
            Sorry, the page you&apos;re looking for does not exist or has been moved
            <br />
            please go back to the Home page
          </p>

          <Link
            to={homeHref}
            className="inline-flex w-full max-w-[420px] items-center justify-center rounded-full py-4 bg-[#00CED1] text-white text-sm font-bold uppercase tracking-[0.14em] hover:opacity-90 transition-opacity"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  )
}
