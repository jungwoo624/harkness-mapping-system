/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 서버 주소 (기본값 http://localhost:3001) */
  readonly VITE_API_BASE_URL?: string
  /**
   * @deprecated 키 노출 위험으로 더 이상 클라이언트에서 직접 사용하지 않음.
   * AI 호출은 백엔드(/api/analysis) 경유로 변경됨.
   */
  readonly VITE_ANTHROPIC_API_KEY?: string
  // Firebase (.env.local)
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
