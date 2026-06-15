import type { Session } from '../types';

/**
 * 세션 영속화 계층.
 *
 * 지금은 브라우저 localStorage를 사용하지만, 추후 Firebase 등
 * 원격 저장소로 교체하기 쉽도록 이 파일의 함수 시그니처만 유지하면
 * 내부 구현만 바꾸면 되도록 분리해 두었다.
 */

/** localStorage에 세션 목록을 저장하는 키 */
const STORAGE_KEY = 'harkness_sessions';

/** 저장된 모든 세션을 읽어 파싱한다. 손상/부재 시 빈 배열을 반환한다. */
function readSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Session[]) : [];
  } catch {
    // JSON 손상 등으로 파싱 실패 시 빈 목록으로 폴백
    return [];
  }
}

/** 세션 목록 전체를 직렬화해 저장한다. */
function writeSessions(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/**
 * 세션 하나를 저장한다. 기존 세션 배열 끝에 추가한다.
 * 같은 id가 이미 있으면 해당 항목을 덮어쓴다.
 */
export function saveSession(session: Session): void {
  const sessions = readSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);

  const next =
    existingIndex >= 0
      ? sessions.map((s, i) => (i === existingIndex ? session : s))
      : [...sessions, session];

  writeSessions(next);
}

/** 저장된 모든 세션 목록을 반환한다. */
export function getAllSessions(): Session[] {
  return readSessions();
}

/** 특정 id의 세션을 찾아 반환한다. 없으면 null. */
export function getSessionById(id: string): Session | null {
  const session = readSessions().find((s) => s.id === id);
  return session ?? null;
}
