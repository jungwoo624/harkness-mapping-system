import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// firebaseConfig 값은 .env.local 에서 주입한다 (VITE_ 접두사 필요).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** .env.local 에 필수 값이 채워졌는지 여부 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

// 설정이 없으면 초기화하지 않는다 (빈 키로 init 시 앱 전체가 깨지는 것 방지).
let app: FirebaseApp | undefined
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  authInstance = getAuth(app)
  dbInstance = getFirestore(app)
} else {
  console.warn('[firebase] .env.local 의 VITE_FIREBASE_* 값이 비어 있어 인증이 비활성화됩니다.')
}

/** 인증 객체 (미설정 시 null) */
export const auth = authInstance

/** Firestore 객체 (미설정 시 null) */
export const db = dbInstance

export default app
