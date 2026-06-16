import type { ParticipationStats } from '../types'

interface StudentCardProps {
  stat: ParticipationStats
}

/** 학생 한 명의 참여 통계(발언 수·연결 수)를 보여주는 카드 */
export function StudentCard({ stat }: StudentCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-cyan/10 bg-obsidian px-4 py-3 shadow-sm transition hover:border-cyan/60 hover:shadow">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan/15 font-bold text-cyan">
          {stat.studentName.charAt(0)}
        </span>
        <span className="font-medium text-white">{stat.studentName}</span>
      </div>
      <div className="flex gap-2 text-xs font-semibold">
        <span className="rounded-full bg-obsidian/5 px-2.5 py-1 text-platinum/80">
          발언 {stat.totalSpeeches}
        </span>
        <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-cyan">
          연결 {stat.connectionsCount}
        </span>
      </div>
    </div>
  )
}
