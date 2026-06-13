import type { Session } from '../types'

/**
 * 세션 영속화 레이어.
 *
 * 현재는 브라우저 localStorage를 사용하지만, 함수 시그니처(saveSession /
 * getAllSessions / getSessionById)를 그대로 유지하면 추후 Firebase 등
 * 원격 저장소 구현으로 내부만 교체할 수 있다.
 */

const STORAGE_KEY = 'harkness_sessions'

/** localStorage에서 세션 배열을 안전하게 읽는다. 실패 시 빈 배열. */
function readAll(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Session[]) : []
  } catch (error) {
    console.error('세션 목록을 불러오지 못했습니다:', error)
    return []
  }
}

/** 세션 하나를 기존 배열 끝에 추가하여 저장한다. */
export function saveSession(session: Session): void {
  try {
    const next = [...readAll(), session]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (error) {
    console.error('세션을 저장하지 못했습니다:', error)
  }
}

/** 저장된 모든 세션 목록을 반환한다. */
export function getAllSessions(): Session[] {
  return readAll()
}

/** 특정 id의 세션을 찾아 반환한다. 없으면 null. */
export function getSessionById(id: string): Session | null {
  return readAll().find((session) => session.id === id) ?? null
}
