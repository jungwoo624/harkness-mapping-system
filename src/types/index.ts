// 하크니스 토론 매핑 앱 도메인 타입 정의

/**
 * 토론에 참여하는 학생 한 명.
 */
export interface Student {
  /** 학생 고유 id */
  id: string
  /** 학생 이름 (이름표에 표시) */
  name: string
  /** 원형 테이블 위 좌표 (px) */
  position: { x: number; y: number }
}

/**
 * 발언 기록 하나. "누가 누구에게 언제 발언했는가"를 나타낸다.
 */
export interface SpeechRecord {
  /** 발언 기록 고유 id */
  id: string
  /** 발언자 학생 id */
  speakerId: string
  /** 발언 대상 학생 id. 특정 대상이 없는 전체 발언이면 null */
  targetId: string | null
  /** 발언 시각 (Date.now() 밀리초 값) */
  timestamp: number
}

/**
 * 토론 세션 전체. 한 번의 하크니스 토론을 표현한다.
 */
export interface Session {
  /** 세션 고유 id */
  id: string
  /** 토론 주제 */
  title: string
  /** 토론 날짜 (ISO 8601 형식 문자열) */
  date: string
  /** 참여 학생 목록 */
  students: Student[]
  /** 세션 동안 누적된 발언 기록 */
  speechRecords: SpeechRecord[]
  /** 토론 진행 시간 (분) */
  durationMinutes: number
}

/**
 * 학생별 참여 통계. 토론 종료 후 리포트 화면에서 사용한다.
 */
export interface ParticipationStats {
  /** 대상 학생 id */
  studentId: string
  /** 대상 학생 이름 */
  studentName: string
  /** 총 발언 횟수 */
  totalSpeeches: number
  /** 다른 학생과 연결된(주고받은) 횟수 */
  connectionsCount: number
  /** 연결된 상대 학생 id 목록 */
  connectedStudentIds: string[]
}
