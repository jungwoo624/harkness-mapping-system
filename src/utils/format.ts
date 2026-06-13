import type { Session } from '../types'

/** 세션의 총 발언 수를 반환한다. */
export function countSpeeches(session: Session): number {
  return session.links.length
}

/** ISO 날짜 문자열을 'YYYY.MM.DD' 형태로 포맷한다. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}
