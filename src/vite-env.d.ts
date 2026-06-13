/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Anthropic API 키 (.env의 VITE_ANTHROPIC_API_KEY) */
  readonly VITE_ANTHROPIC_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
