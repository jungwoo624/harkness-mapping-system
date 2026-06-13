import type { ParticipationStats } from '../types'

interface StudentCardProps {
  stat: ParticipationStats
}

/** 학생 한 명의 참여 통계(발언 수·연결 수)를 보여주는 카드 */
export function StudentCard({ stat }: StudentCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-indigo-400 hover:shadow">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
          {stat.studentName.charAt(0)}
        </span>
        <span className="font-medium text-slate-800">{stat.studentName}</span>
      </div>
      <div className="flex gap-2 text-xs font-semibold">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
          발언 {stat.totalSpeeches}
        </span>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600">
          연결 {stat.connectionsCount}
        </span>
      </div>
    </div>
  )
}
