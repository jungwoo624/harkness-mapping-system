import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'signup'

/** Firebase 인증 오류 코드를 한국어 메시지로 변환 */
function authErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 가입된 이메일입니다.'
    case 'auth/invalid-email':
      return '올바르지 않은 이메일 형식입니다.'
    case 'auth/weak-password':
      return '비밀번호는 6자 이상이어야 합니다.'
    case 'auth/user-not-found':
      return '등록되지 않은 이메일입니다.'
    case 'auth/wrong-password':
      return '비밀번호가 올바르지 않습니다.'
    case 'auth/invalid-credential':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    case 'auth/too-many-requests':
      return '시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.'
    default:
      return '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }
}

/** 로그인 / 회원가입 화면 */
export function LoginPage() {
  const { signUp, login } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const switchMode = (next: Mode): void => {
    setMode(next)
    setError(null)
    setConfirm('')
  }

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    if (mode === 'signup' && password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : ''
      setError(authErrorMessage(code))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500'

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-bold text-slate-900">
        {mode === 'login' ? '로그인' : '회원가입'}
      </h1>

      {/* 탭 전환 */}
      <div className="mt-6 flex rounded-lg border border-gray-200 p-1">
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              mode === m ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {m === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            required
            className={inputClass}
          />
        </label>

        {mode === 'signup' && (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            비밀번호 확인
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              required
              className={inputClass}
            />
          </label>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {submitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </form>
    </main>
  )
}
