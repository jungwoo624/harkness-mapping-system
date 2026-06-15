import type { Session, ParticipationStats } from '../types';

/**
 * 세션의 발언 기록을 분석해 학생별 참여 통계를 계산한다.
 *
 * 각 학생에 대해:
 * - totalSpeeches: 본인이 발언자(speakerId)인 기록 수
 * - connectedStudentIds: 본인이 발언자 또는 대상으로 등장한 기록에서
 *   상대방 학생 id를 중복 없이 모은 목록 (대상이 null인 전체 발언은 제외)
 * - connectionsCount: connectedStudentIds 의 개수
 */
export function calculateParticipationStats(session: Session): ParticipationStats[] {
  const { students, speechRecords } = session;

  return students.map((student) => {
    let totalSpeeches = 0;
    const connectedIds = new Set<string>();

    for (const record of speechRecords) {
      const isSpeaker = record.speakerId === student.id;
      const isTarget = record.targetId === student.id;

      if (isSpeaker) {
        totalSpeeches += 1;
        // 발언자인 경우, 대상(있으면)을 상대방으로 추가
        if (record.targetId) connectedIds.add(record.targetId);
      }
      if (isTarget) {
        // 대상인 경우, 발언자를 상대방으로 추가
        connectedIds.add(record.speakerId);
      }
    }

    // 자기 자신은 상대방에서 제외 (자기 참조 방어)
    connectedIds.delete(student.id);

    const connectedStudentIds = [...connectedIds];

    return {
      studentId: student.id,
      studentName: student.name,
      totalSpeeches,
      connectionsCount: connectedStudentIds.length,
      connectedStudentIds,
    };
  });
}

/** 세션 전체 요약 통계 */
export interface OverallStats {
  /** 전체 발언 기록 수 */
  totalSpeechCount: number;
  /** 발언이 가장 많은 학생 이름 (학생이 없으면 null) */
  mostActiveStudent: string | null;
  /** 발언이 가장 적은 학생 이름 (0회 포함, 학생이 없으면 null) */
  leastActiveStudent: string | null;
  /** 다른 학생과 한 번도 연결되지 않은(connectionsCount 0) 학생 이름 목록 */
  isolatedStudents: string[];
}

/**
 * 세션 전체에 대한 요약 통계를 계산한다.
 * 학생별 통계를 먼저 구한 뒤, 그 결과로 최다/최소 발언자와
 * 고립된 학생(연결 0)을 도출한다. 동점일 경우 먼저 등장한 학생을 택한다.
 */
export function calculateOverallStats(session: Session): OverallStats {
  const stats = calculateParticipationStats(session);
  const totalSpeechCount = session.speechRecords.length;

  if (stats.length === 0) {
    return {
      totalSpeechCount,
      mostActiveStudent: null,
      leastActiveStudent: null,
      isolatedStudents: [],
    };
  }

  // 발언이 가장 많은 학생 (동점 시 앞 순서 유지)
  const mostActive = stats.reduce((best, cur) =>
    cur.totalSpeeches > best.totalSpeeches ? cur : best,
  );

  // 발언이 가장 적은 학생 (0회 포함, 동점 시 앞 순서 유지)
  const leastActive = stats.reduce((worst, cur) =>
    cur.totalSpeeches < worst.totalSpeeches ? cur : worst,
  );

  // 다른 학생과 한 번도 연결되지 않은 학생들
  const isolatedStudents = stats
    .filter((s) => s.connectionsCount === 0)
    .map((s) => s.studentName);

  return {
    totalSpeechCount,
    mostActiveStudent: mostActive.studentName,
    leastActiveStudent: leastActive.studentName,
    isolatedStudents,
  };
}
