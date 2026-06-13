import { useState } from 'react'
import { HarknessTable } from '../components/HarknessTable'
import type { SpeechRecord, Student } from '../types'
import { createStudents, durationInMinutes } from '../utils/session'

type Phase = 'setup' | 'active' | 'ended'

const MIN_STUDENTS = 3
const MAX_STUDENTS = 12
const DEFAULT_STUDENTS = 6

const STUDENT_OPTIONS = Array.from(
  { length: MAX_STUDENTS - MIN_STUDENTS + 1 },
  (_, i) => MIN_STUDENTS + i,
)

/** 토론 세션 화면. 설정 → 진행 → 종료 단계를 관리한다. */
export function SessionPage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [title, setTitle] = useState('')
  const [studentCount, setStudentCount] = useState(DEFAULT_STUDENTS)

  const [students, setStudents] = useState<Student[]>([])
  const [speechRecords, setSpeechRecords] = useState<SpeechRecord[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [durationMinutes, setDurationMinutes] = useState(0)

  const startSession = (): void => {
    setStudents(createStudents(studentCount))
    setSpeechRecords([])
    setStartedAt(Date.now())
    setPhase('active')
  }

  const endSession = (): void => {
    const endedAt = Date.now()
    setDurationMinutes(durationInMinutes(startedAt ?? endedAt, endedAt))
    setPhase('ended')
  }

  const addSpeech = (record: SpeechRecord): void => {
    setSpeechRecords((prev) => [...prev, record])
  }

  // ── 설정 화면 ──────────────────────────────
  if (phase === 'setup') {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Harkness Session
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">새 토론 세션</h1>
        </header>

        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              토론 주제
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="토론 주제를 입력하세요"
              data-testid="topic-input"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              참여 학생 수
            </span>
            <select
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              data-testid="count-select"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-500"
            >
              {STUDENT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={startSession}
            data-testid="start-session"
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            세션 시작
          </button>
        </div>
      </main>
    )
  }

  // ── 종료 화면 ──────────────────────────────
  if (phase === 'ended') {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center" data-testid="end-screen">
        <h1 className="text-2xl font-bold text-slate-900">세션이 종료되었습니다.</h1>
        <p className="mt-4 text-slate-600">
          진행시간: {durationMinutes}분, 총 발언 {speechRecords.length}건
        </p>
        <p className="mt-2 text-sm text-slate-400">
          (리포트 화면은 다음 단계에서 제공됩니다)
        </p>
      </main>
    )
  }

  // ── 진행 화면 ──────────────────────────────
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            진행 중
          </p>
          <h1 className="mt-0.5 text-2xl font-bold text-slate-900" data-testid="session-title">
            {title || '제목 없는 토론'}
          </h1>
          <p className="text-sm text-slate-500">학생 {students.length}명</p>
        </div>
        <button
          type="button"
          onClick={endSession}
          data-testid="end-session"
          className="shrink-0 rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white transition hover:bg-rose-700"
        >
          세션 종료
        </button>
      </header>

      <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <HarknessTable
          students={students}
          speechRecords={speechRecords}
          onAddSpeech={addSpeech}
        />
      </div>
    </main>
  )
}
