import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthContextValue {
  /** 현재 로그인한 사용자 (없으면 null) */
  user: User | null
  /** 초기 인증 상태 확인 중 여부 */
  authLoading: boolean
  signUp: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** 로그인 상태를 전역으로 제공하는 Provider */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 로그인 상태 변화 감지 (Firebase 미설정 시 비활성)
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  const ensureAuth = (): NonNullable<typeof auth> => {
    if (!auth) {
      throw new Error('Firebase가 설정되지 않았습니다. .env.local 값을 확인해 주세요.')
    }
    return auth
  }

  const signUp = async (email: string, password: string): Promise<void> => {
    await createUserWithEmailAndPassword(ensureAuth(), email, password)
  }

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(ensureAuth(), email, password)
  }

  const logout = async (): Promise<void> => {
    if (!auth) return
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** AuthContext 사용 훅 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.')
  }
  return ctx
}
