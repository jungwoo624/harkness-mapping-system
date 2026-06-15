/**
 * 하크니스 토론 매핑 앱의 핵심 도메인 타입 정의
 */

/** 토론 참가 학생 한 명 */
export interface Student {
  /** 학생 고유 식별자 */
  id: string;
  /** 학생 이름 (이름표에 표시) */
  name: string;
  /** 원형 테이블 위 좌석 좌표 (px 단위) */
  position: {
    x: number;
    y: number;
  };
}

/** 발언 기록 하나 (누가 누구에게 언제 발언했는지) */
export interface SpeechRecord {
  /** 발언 기록 고유 식별자 */
  id: string;
  /** 발언한 학생의 id */
  speakerId: string;
  /** 발언 대상 학생의 id (대상이 없는 전체 발언이면 null) */
  targetId: string | null;
  /** 발언 시각 (Date.now() 로 얻은 밀리초 타임스탬프) */
  timestamp: number;
}

/** 토론 세션 전체 (한 번의 하크니스 토론 단위) */
export interface Session {
  /** 세션 고유 식별자 */
  id: string;
  /** 토론 주제 */
  title: string;
  /** 토론 날짜 (ISO 8601 형식 문자열) */
  date: string;
  /** 참가 학생 목록 */
  students: Student[];
  /** 발언 기록 목록 */
  speechRecords: SpeechRecord[];
  /** 토론 진행 시간 (분 단위) */
  durationMinutes: number;
}

/** 학생별 참여 통계 (리포트 화면에서 사용) */
export interface ParticipationStats {
  /** 통계 대상 학생의 id */
  studentId: string;
  /** 통계 대상 학생의 이름 */
  studentName: string;
  /** 총 발언 횟수 */
  totalSpeeches: number;
  /** 다른 학생과 연결된(상호작용한) 횟수 */
  connectionsCount: number;
  /** 연결된 상대 학생들의 id 목록 */
  connectedStudentIds: string[];
}
