import { useState } from 'react'
import { HarknessTable } from '../components/HarknessTable'
import { ReportPage } from './ReportPage'
import type { Session, SpeechRecord, Student } from '../types'
import { createStudents, durationInMinutes } from '../utils/session'
import { getAllSessions, saveSession } from '../utils/sessionStorage'

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
  // 종료된 세션(리포트 렌더용)
  const [endedSession, setEndedSession] = useState<Session | null>(null)
  // 디버깅용 임시 표시: 저장된 세션 목록 JSON
  const [savedDump, setSavedDump] = useState<string | null>(null)

  const startSession = (): void => {
    setStudents(createStudents(studentCount))
    setSpeechRecords([])
    setStartedAt(Date.now())
    setPhase('active')
  }

  const endSession = (): void => {
    const endedAt = Date.now()
    const start = startedAt ?? endedAt
    const minutes = durationInMinutes(start, endedAt)

    // 종료 시점에 현재 세션을 저장소에 영속화
    const session: Session = {
      id: crypto.randomUUID(),
      title: title || '제목 없는 토론',
      date: new Date(start).toISOString(),
      students,
      speechRecords,
      durationMinutes: minutes,
    }
    saveSession(session)

    setEndedSession(session)
    setDurationMinutes(minutes)
    setPhase('ended')
  }

  const addSpeech = (record: SpeechRecord): void => {
    setSpeechRecords((prev) => [...prev, record])
  }

  /** 종료 화면에서 새 세션을 시작하기 위해 설정 화면으로 돌아간다. */
  const resetToSetup = (): void => {
    setPhase('setup')
    setTitle('')
    setStudents([])
    setSpeechRecords([])
    setStartedAt(null)
    setDurationMinutes(0)
    setEndedSession(null)
    setSavedDump(null)
  }

  // ── 설정 화면 ──────────────────────────────
  if (phase === 'setup') {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
            Harkness Session
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">새 토론 세션</h1>
        </header>

        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500"
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
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-teal-500"
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
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700"
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
      <main className="mx-auto max-w-2xl px-6 py-16 text-center" data-testid="end-screen">
        <h1 className="text-2xl font-bold text-slate-900">세션이 종료되었습니다.</h1>
        <p className="mt-3 text-slate-600">
          진행시간: {durationMinutes}분, 총 발언 {speechRecords.length}건
        </p>

        {endedSession && (
          <div className="mt-8">
            <ReportPage session={endedSession} />
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          {/* ⚠️ 임시(DEBUG): 저장된 세션 목록 확인용. 추후 제거 예정. */}
          <button
            type="button"
            onClick={() => setSavedDump(JSON.stringify(getAllSessions(), null, 2))}
            data-testid="view-saved"
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-gray-400"
          >
            저장된 세션 목록 보기
          </button>
          <button
            type="button"
            onClick={resetToSetup}
            data-testid="new-session"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            새 세션 시작
          </button>
        </div>

        {savedDump !== null && (
          <pre
            data-testid="session-dump"
            className="mt-6 max-h-80 overflow-auto rounded-xl bg-white p-4 text-left text-xs text-slate-700"
          >
            {savedDump}
          </pre>
        )}
      </main>
    )
  }

  // ── 진행 화면 ──────────────────────────────
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
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
          className="shrink-0 rounded-xl bg-danger px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-danger/80"
        >
          세션 종료
        </button>
      </header>

      <div className="flex justify-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <HarknessTable
          students={students}
          speechRecords={speechRecords}
          onAddSpeech={addSpeech}
        />
      </div>
    </main>
  )
}
