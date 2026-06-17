import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  /** 로그인 필요 */
  requireAuth?: boolean
  /** 관리자(role === 'admin') 필요 */
  requireAdmin?: boolean
}

/** 인증/권한 조건에 따라 접근을 제어하는 래퍼 */
export function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, role, authLoading } = useAuth()

  // 인증 상태 확인 중
  if (authLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-slate-500">로딩 중...</p>
      </main>
    )
  }

  // 로그인 필요 (관리자 전용도 로그인 전제)
  if ((requireAuth || requireAdmin) && !user) {
    return <Navigate to="/login" replace />
  }

  // 관리자 권한 필요
  if (requireAdmin && role !== 'admin') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">접근 권한이 없습니다</h1>
        <p className="mt-3 text-slate-500">이 페이지는 관리자만 이용할 수 있습니다.</p>
      </main>
    )
  }

  return <>{children}</>
}
