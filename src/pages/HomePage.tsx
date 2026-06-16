import { StudentCard } from '../components/StudentCard'
import mockSession from '../data/mockSession'
import { computeParticipation, countSpeeches, formatDate } from '../utils/format'

/** 임시 데이터로 토론 세션 참여 통계를 보여주는 시작 화면 */
export function HomePage() {
  const stats = computeParticipation(mockSession)

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan">
          Harkness App
        </p>
        <h1 className="mt-1 text-3xl font-bold text-white">
          {mockSession.title}
        </h1>
        <p className="mt-2 text-platinum/60">
          {formatDate(mockSession.date)} · {mockSession.durationMinutes}분 · 학생{' '}
          {mockSession.students.length}명 · 총 발언 {countSpeeches(mockSession)}건
        </p>
      </header>

      <section className="space-y-3">
        {stats.map((stat) => (
          <StudentCard key={stat.studentId} stat={stat} />
        ))}
      </section>

      <p className="mt-10 rounded-lg bg-cyan/10 px-4 py-3 text-center text-sm font-medium text-cyan">
        ✅ React + TypeScript + Tailwind CSS 정상 동작 중
      </p>
    </main>
  )
}
