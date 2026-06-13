import type { ParticipationStats, Session } from '../types'

/** 세션의 총 발언 수를 반환한다. */
export function countSpeeches(session: Session): number {
  return session.speechRecords.length
}

/** ISO 날짜 문자열을 'YYYY.MM.DD' 형태로 포맷한다. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

/** 세션의 발언 기록으로부터 학생별 참여 통계를 계산한다. */
export function computeParticipation(session: Session): ParticipationStats[] {
  return session.students.map((student) => {
    const connected = new Set<string>()

    for (const record of session.speechRecords) {
      if (record.targetId === null) continue
      if (record.speakerId === student.id) connected.add(record.targetId)
      else if (record.targetId === student.id) connected.add(record.speakerId)
    }

    const totalSpeeches = session.speechRecords.filter(
      (record) => record.speakerId === student.id,
    ).length

    return {
      studentId: student.id,
      studentName: student.name,
      totalSpeeches,
      connectionsCount: connected.size,
      connectedStudentIds: [...connected],
    }
  })
}
