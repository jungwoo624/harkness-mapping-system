import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const MENU = [
  { to: '/about', label: '소개' },
  { to: '/pricing', label: '이용안내' },
  { to: '/learn', label: '학습' },
  { to: '/archive', label: '아카이브' },
]

/** 모든 페이지 상단 공통 네비게이션 바 */
export function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async (): Promise<void> => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* 로고 */}
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-teal-600"
        >
          제노 리케이온
        </Link>

        {/* 메뉴 */}
        <div className="hidden items-center gap-6 sm:flex">
          {MENU.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-600 hover:text-teal-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* 로그인 상태에 따른 우측 영역 */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[160px] truncate text-sm text-slate-600 sm:inline">
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-gray-400"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            로그인
          </Link>
        )}
      </nav>
    </header>
  )
}
