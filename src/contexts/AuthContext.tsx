import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

interface AuthContextValue {
  /** 현재 로그인한 사용자 (없으면 null) */
  user: User | null
  /** 사용자 역할 ("member" | "admin"). 미로그인/미설정 시 null */
  role: string | null
  /** 멤버십 등급 ("free" 등). 미로그인 시 null */
  membershipTier: string | null
  /** 초기 인증 상태 확인 중 여부 */
  authLoading: boolean
  signUp: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Firestore에서 사용자 프로필(role, membershipTier)을 읽어온다. */
async function fetchProfile(
  uid: string,
): Promise<{ role: string | null; membershipTier: string | null }> {
  if (!db) return { role: null, membershipTier: null }
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const data = snap.data()
      return {
        role: (data.role as string) ?? null,
        membershipTier: (data.membershipTier as string) ?? null,
      }
    }
  } catch (err) {
    console.error('[auth] 프로필 로드 실패:', err)
  }
  return { role: null, membershipTier: null }
}

/** 로그인 상태를 전역으로 제공하는 Provider */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [membershipTier, setMembershipTier] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 로그인 상태 변화 감지 + 프로필 로드 (Firebase 미설정 시 비활성)
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const profile = await fetchProfile(u.uid)
        setRole(profile.role)
        setMembershipTier(profile.membershipTier)
      } else {
        setRole(null)
        setMembershipTier(null)
      }
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
    const credential = await createUserWithEmailAndPassword(ensureAuth(), email, password)
    // Firestore "users" 컬렉션에 사용자 문서 생성 (문서 ID = uid)
    // 문서 생성 실패가 가입 자체를 막지 않도록 분리 처리 (Firestore 미설정/장애 대비)
    if (db) {
      try {
        await setDoc(doc(db, 'users', credential.user.uid), {
          email,
          role: 'member', // 기본값. 관리자는 콘솔에서 수동으로 "admin"으로 변경
          membershipTier: 'free',
          createdAt: serverTimestamp(),
        })
      } catch (err) {
        console.error('[auth] 사용자 문서 생성 실패 (Firestore 설정을 확인하세요):', err)
      }
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(ensureAuth(), email, password)
  }

  const logout = async (): Promise<void> => {
    if (!auth) return
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ user, role, membershipTier, authLoading, signUp, login, logout }}
    >
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
