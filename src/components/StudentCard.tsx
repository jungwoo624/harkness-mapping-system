import type { Student } from '../types'

interface StudentCardProps {
  student: Student
}

/** 학생 한 명의 이름과 발언 횟수를 보여주는 카드 */
export function StudentCard({ student }: StudentCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-indigo-400 hover:shadow">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
          {student.name.charAt(0)}
        </span>
        <span className="font-medium text-slate-800">{student.name}</span>
      </div>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        발언 {student.contributions}
      </span>
    </div>
  )
}
