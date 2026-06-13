/** 토론에 참여하는 학생 */
export interface Student {
  id: string
  name: string
  /** 발언 횟수 */
  contributions: number
}

/** 학생 A → 학생 B 발언 연결 */
export interface SpeechLink {
  from: string
  to: string
  at: number
}

/** 하나의 토론 세션 */
export interface Session {
  id: string
  title: string
  createdAt: string
  students: Student[]
  links: SpeechLink[]
}
