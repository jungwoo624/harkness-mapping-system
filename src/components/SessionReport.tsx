import type { Session } from '../types'
import {
  calculateOverallStats,
  calculateParticipationStats,
} from '../utils/calculateStats'

interface SessionReportProps {
  session: Session
}

/** 세션 종료 후 참여 통계를 보여주는 리포트. */
export function SessionReport({ session }: SessionReportProps) {
  const overall = calculateOverallStats(session)
  const stats = calculateParticipationStats(session)

  const nameById = (id: string): string =>
    session.students.find((student) => student.id === id)?.name ?? id

  const summary = [
    { key: 'total', label: '총 발언', value: `${overall.totalSpeechCount}건` },
    { key: 'most', label: '최다 발언', value: overall.mostActiveStudent ?? '-' },
    { key: 'least', label: '최소 발언', value: overall.leastActiveStudent ?? '-' },
    {
      key: 'isolated',
      label: '고립 학생',
      value:
        overall.isolatedStudents.length > 0
          ? overall.isolatedStudents.join(', ')
          : '없음',
    },
  ]

  return (
    <section className="text-left" data-testid="session-report">
      <h2 className="mb-3 text-lg font-bold text-slate-900">참여 리포트</h2>

      {/* 요약 카드 */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.key}
            data-testid={`stat-${item.key}`}
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 학생별 상세 표 */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
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
                <td className="px-3 py-2 font-medium text-slate-800">
                  {stat.studentName}
                </td>
                <td
                  className="px-3 py-2 text-slate-700"
                  data-testid={`report-speeches-${stat.studentId}`}
                >
                  {stat.totalSpeeches}
                </td>
                <td className="px-3 py-2 text-slate-700">{stat.connectionsCount}</td>
                <td className="px-3 py-2 text-slate-500">
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
