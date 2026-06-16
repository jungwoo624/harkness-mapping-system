import type { Session } from '../types'
import {
  calculateOverallStats,
  calculateParticipationStats,
} from '../utils/calculateStats'

interface SessionReportProps {
  session: Session
}

/** 세션 종료 후 참여 통계를 보여주는 리포트(막대 그래프 + 요약 + 상세 표). */
export function SessionReport({ session }: SessionReportProps) {
  const overall = calculateOverallStats(session)
  const stats = calculateParticipationStats(session)

  const nameById = (id: string): string =>
    session.students.find((student) => student.id === id)?.name ?? id

  // 막대 길이 비례 기준(최소 1로 0 나눗셈 방지)
  const maxSpeeches = Math.max(1, ...stats.map((stat) => stat.totalSpeeches))

  return (
    <section className="space-y-6 text-left" data-testid="session-report">
      <div>
        <h2 className="text-lg font-bold text-white">참여 리포트</h2>
        <p className="text-sm text-platinum/60">총 발언 {overall.totalSpeechCount}건</p>
      </div>

      {/* 전체 요약 카드 */}
      <div
        className="space-y-1.5 rounded-xl border border-cyan/10 bg-obsidian p-4"
        data-testid="summary-card"
      >
        <p className="text-sm text-platinum">
          가장 활발한 참여자:{' '}
          <span className="font-semibold text-white" data-testid="summary-most">
            {overall.mostActiveStudent ?? '-'}
          </span>
        </p>
        <p className="text-sm text-platinum">
          가장 조용했던 참여자:{' '}
          <span className="font-semibold text-white" data-testid="summary-least">
            {overall.leastActiveStudent ?? '-'}
          </span>
        </p>

        {overall.isolatedStudents.length > 0 ? (
          <p
            className="rounded-lg bg-gold/10 px-3 py-2 text-sm font-semibold text-gold"
            data-testid="summary-isolated"
          >
            ⚠️ 대화에서 소외된 학생: {overall.isolatedStudents.join(', ')}
          </p>
        ) : (
          <p
            className="rounded-lg bg-cyan/10 px-3 py-2 text-sm font-semibold text-cyan"
            data-testid="summary-all-participated"
          >
            ✅ 모든 학생이 대화에 참여했습니다
          </p>
        )}
      </div>

      {/* 학생별 참여 현황 - 막대 그래프 */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-platinum">학생별 참여 현황</h3>
        <div className="space-y-2">
          {stats.map((stat) => {
            const pct =
              stat.totalSpeeches === 0
                ? 0
                : Math.max(6, (stat.totalSpeeches / maxSpeeches) * 100)
            return (
              <div
                key={stat.studentId}
                className="flex items-center gap-3"
                data-testid={`bar-${stat.studentId}`}
              >
                <span className="w-16 shrink-0 truncate text-sm text-platinum">
                  {stat.studentName}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-obsidian/5">
                  <div
                    className="h-full rounded bg-cyan"
                    style={{ width: `${pct}%` }}
                    data-testid={`bar-fill-${stat.studentId}`}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-semibold text-platinum">
                  {stat.totalSpeeches}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 학생별 상세 표 */}
      <div className="overflow-hidden rounded-xl border border-cyan/10">
        <table className="w-full text-sm">
          <thead className="bg-obsidian/5 text-left text-xs text-platinum/60">
            <tr>
              <th className="px-3 py-2 font-medium">학생</th>
              <th className="px-3 py-2 font-medium">발언</th>
              <th className="px-3 py-2 font-medium">연결</th>
              <th className="px-3 py-2 font-medium">연결 상대</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.map((stat) => (
              <tr key={stat.studentId} data-testid={`report-row-${stat.studentId}`}>
                <td className="px-3 py-2 font-medium text-white">
                  {stat.studentName}
                </td>
                <td
                  className="px-3 py-2 text-platinum"
                  data-testid={`report-speeches-${stat.studentId}`}
                >
                  {stat.totalSpeeches}
                </td>
                <td className="px-3 py-2 text-platinum">{stat.connectionsCount}</td>
                <td className="px-3 py-2 text-platinum/60">
                  {stat.connectedStudentIds.map(nameById).join(', ') || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
