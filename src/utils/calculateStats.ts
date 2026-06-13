import type { ParticipationStats, Session } from '../types'

/** 전체 세션 단위 요약 통계 */
export interface OverallStats {
  /** 전체 발언 기록 수 */
  totalSpeechCount: number
  /** 발언이 가장 많은 학생 이름 (학생이 없으면 null) */
  mostActiveStudent: string | null
  /** 발언이 가장 적은 학생 이름, 0회 포함 (학생이 없으면 null) */
  leastActiveStudent: string | null
  /** 발언/피발언이 한 번도 없어 연결이 0인 학생들의 이름 */
  isolatedStudents: string[]
}

/**
 * 학생별 참여 통계를 계산한다.
 * 각 학생의 총 발언 수, 연결된 상대 학생 id(중복 제거), 연결 수를 구한다.
 */
export function calculateParticipationStats(session: Session): ParticipationStats[] {
  return session.students.map((student) => {
    const connected = new Set<string>()
    let totalSpeeches = 0

    for (const record of session.speechRecords) {
      const isSpeaker = record.speakerId === student.id
      const isTarget = record.targetId === student.id

      // 발언자로 등장하면 발언 수 증가, 대상(있다면)을 연결 상대로 수집
      if (isSpeaker) {
        totalSpeeches += 1
        if (record.targetId !== null) connected.add(record.targetId)
      }

      // 대상으로 등장하면 발언자를 연결 상대로 수집
      if (isTarget) {
        connected.add(record.speakerId)
      }
    }

    // 자기 자신은 연결 상대에서 제외 (방어적 처리)
    connected.delete(student.id)
    const connectedStudentIds = [...connected]

    return {
      studentId: student.id,
      studentName: student.name,
      totalSpeeches,
      connectionsCount: connectedStudentIds.length,
      connectedStudentIds,
    }
  })
}

/**
 * 세션 전체에 대한 요약 통계를 계산한다.
 * 총 발언 수, 최다/최소 발언 학생, 고립된(연결 0) 학생 목록을 구한다.
 */
export function calculateOverallStats(session: Session): OverallStats {
  const stats = calculateParticipationStats(session)
  const totalSpeechCount = session.speechRecords.length

  // 학생이 없으면 비교 대상이 없으므로 기본값 반환
  if (stats.length === 0) {
    return {
      totalSpeechCount,
      mostActiveStudent: null,
      leastActiveStudent: null,
      isolatedStudents: [],
    }
  }

  // 최다/최소 발언 학생 탐색 (동률이면 먼저 등장한 학생)
  let most = stats[0]
  let least = stats[0]
  for (const current of stats) {
    if (current.totalSpeeches > most.totalSpeeches) most = current
    if (current.totalSpeeches < least.totalSpeeches) least = current
  }

  // 연결 수가 0인 학생 = 한 번도 발언하거나 발언 대상이 되지 않은 학생
  const isolatedStudents = stats
    .filter((stat) => stat.connectionsCount === 0)
    .map((stat) => stat.studentName)

  return {
    totalSpeechCount,
    mostActiveStudent: most.studentName,
    leastActiveStudent: least.studentName,
    isolatedStudents,
  }
}
