const STORAGE_KEY = 'harkness:sessions';

/**
 * 브라우저 localStorage 기반의 단순 세션 저장소.
 * 백엔드 도입 전까지 발언 매핑 데이터를 보존한다.
 */

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('세션을 불러오지 못했습니다:', error);
    return {};
  }
}

function writeAll(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('세션을 저장하지 못했습니다:', error);
  }
}

export function listSessions() {
  return Object.values(readAll());
}

export function getSession(id) {
  return readAll()[id] ?? null;
}

export function saveSession(session) {
  const sessions = readAll();
  const next = { ...sessions, [session.id]: session };
  writeAll(next);
  return session;
}

export function createSession(title) {
  const session = {
    id: crypto.randomUUID(),
    title: title?.trim() || '제목 없는 토론',
    createdAt: new Date().toISOString(),
    students: [],
    links: [],
  };
  return saveSession(session);
}
