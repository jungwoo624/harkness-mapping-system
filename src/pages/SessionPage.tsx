import { HarknessTable } from '../components/HarknessTable'
import mockSession from '../data/mockSession'

/** 토론 세션 화면. 원형 테이블 위에 학생 배치를 보여준다. */
export function SessionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Harkness Session
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          {mockSession.title}
        </h1>
        <p className="mt-2 text-slate-500">
          학생 {mockSession.students.length}명 · {mockSession.durationMinutes}분
        </p>
      </header>

      <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <HarknessTable students={mockSession.students} />
      </div>
    </main>
  )
}
