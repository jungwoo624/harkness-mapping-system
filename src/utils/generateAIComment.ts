import type { Session } from '../types'
import {
  calculateOverallStats,
  calculateParticipationStats,
} from './calculateStats'

/** 한 명이 전체 발언의 이 비율 이상이면 '독점'으로 본다. */
const MONOPOLY_THRESHOLD = 0.4
/** 실제 API 응답을 흉내 내기 위한 임시 지연(ms). */
const FAKE_LATENCY_MS = 500

/**
 * 토론 세션에 대한 AI 분석 코멘트(한국어)를 생성한다.
 *
 * ⚠️ 임시 구현: 현재는 실제 Claude API를 호출하지 않고 calculateStats의
 * 통계 결과를 바탕으로 규칙 기반(rule-based)으로 문자열을 만든다.
 * 다음 단계에서 이 함수 내부를 실제 Claude API 호출로 교체할 예정이며,
 * 시그니처(`(session) => Promise<string>`)는 그대로 유지한다.
 */
export async function generateAIComment(session: Session): Promise<string> {
  // 비동기 API 교체를 대비해 약간의 지연을 둔다(로딩 UI 확인 목적).
  await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))

  const overall = calculateOverallStats(session)
  const stats = calculateParticipationStats(session)
  const studentCount = session.students.length
  const total = overall.totalSpeechCount

  const lines: string[] = []

  // 1) 전체 토론 분위기 한 줄 평가 (발언 횟수 + 연결 다양성 기준)
  lines.push(buildMoodComment(total, studentCount, stats))

  // 2) 소외된 학생 언급 + 제안
  if (overall.isolatedStudents.length > 0) {
    const names = overall.isolatedStudents.join(', ')
    lines.push(
      `${names} 학생은 이번 토론에서 발언하거나 지목받지 못했습니다. ` +
        '다음에는 이 학생들에게 먼저 질문을 건네거나 발언 기회를 열어 주세요.',
    )
  }

  // 3) 발언을 독점한 학생 언급 (전체 발언의 40% 이상)
  if (total > 0) {
    const dominant = stats.find(
      (stat) => stat.totalSpeeches / total >= MONOPOLY_THRESHOLD,
    )
    if (dominant) {
      const percent = Math.round((dominant.totalSpeeches / total) * 100)
      lines.push(
        `${dominant.studentName} 학생이 전체 발언의 ${percent}%를 차지했습니다. ` +
          '발언이 한 사람에게 쏠리지 않도록 다른 학생들의 참여를 유도해 보세요.',
      )
    }
  }

  return lines.join('\n\n')
}

/** 발언량과 연결 다양성으로 전체 분위기 한 줄 평을 만든다. */
function buildMoodComment(
  total: number,
  studentCount: number,
  stats: ReturnType<typeof calculateParticipationStats>,
): string {
  if (total === 0) {
    return '아직 발언이 기록되지 않은 조용한 세션이었습니다.'
  }

  const perStudent = total / studentCount
  const avgConnections =
    stats.length > 0
      ? stats.reduce((sum, stat) => sum + stat.connectionsCount, 0) / stats.length
      : 0
  // 한 학생이 연결될 수 있는 최대 상대 수 대비 평균 연결 비율(0~1)
  const diversityRatio =
    studentCount > 1 ? avgConnections / (studentCount - 1) : 0

  const head = `총 ${total}건의 발언이 오간 토론이었습니다. `

  if (diversityRatio >= 0.6 && perStudent >= 2) {
    return head + '여러 학생이 활발하게, 그리고 고르게 의견을 주고받았습니다.'
  }
  if (diversityRatio >= 0.4) {
    return head + '다양한 학생들이 비교적 고르게 대화에 참여했습니다.'
  }
  if (perStudent >= 2) {
    return head + '발언은 활발했지만 대화가 일부 학생에게 집중된 편이었습니다.'
  }
  return head + '발언과 상호작용이 다소 적어 차분한 분위기의 토론이었습니다.'
}
