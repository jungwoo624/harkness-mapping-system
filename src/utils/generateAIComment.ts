import type { Session } from '../types'
import {
  calculateOverallStats,
  calculateParticipationStats,
} from './calculateStats'

/** 한 명이 전체 발언의 이 비율 이상이면 '독점'으로 본다. */
const MONOPOLY_THRESHOLD = 0.4

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 500
const SYSTEM_PROMPT =
  '당신은 청소년 하크니스 토론을 분석하는 교육 전문가입니다. ' +
  '따뜻하지만 건설적인 피드백을 한국어로 3~4문장으로 제공하세요.'

/** Claude API에 전달할 통계 페이로드를 구성한다. */
function buildStatsPayload(session: Session) {
  const overall = calculateOverallStats(session)
  const participation = calculateParticipationStats(session).map((stat) => ({
    name: stat.studentName,
    totalSpeeches: stat.totalSpeeches,
    connectionsCount: stat.connectionsCount,
  }))

  return {
    title: session.title,
    durationMinutes: session.durationMinutes,
    studentCount: session.students.length,
    ...overall,
    participation,
  }
}

/**
 * 토론 세션에 대한 AI 분석 코멘트(한국어)를 생성한다.
 *
 * 실제 Claude API(messages 엔드포인트)를 브라우저에서 직접 호출한다.
 * 키 누락·네트워크·CORS 등으로 실패하면 규칙 기반 코멘트로 fallback 한다.
 */
export async function generateAIComment(session: Session): Promise<string> {
  const stats = buildStatsPayload(session)

  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey === '여기에_내_API_키_입력') {
      throw new Error('VITE_ANTHROPIC_API_KEY가 설정되지 않았습니다.')
    }

    const response = await fetch(ANTHROPIC_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // 브라우저에서 직접 호출 시 필요
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content:
              '다음은 한 하크니스 토론 세션의 통계 데이터(JSON)입니다. ' +
              '이를 바탕으로 피드백을 작성해 주세요.\n\n' +
              JSON.stringify(stats, null, 2),
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API 오류: ${response.status} ${response.statusText}`)
    }

    const data: unknown = await response.json()
    const text = extractText(data)
    if (!text) {
      throw new Error('Claude API 응답에서 텍스트를 찾지 못했습니다.')
    }
    return text
  } catch (error) {
    console.error('AI 코멘트 생성 실패 — 규칙 기반 코멘트로 대체합니다:', error)
    return buildRuleBasedComment(session)
  }
}

/** Anthropic 응답(JSON)에서 첫 텍스트 블록을 안전하게 추출한다. */
function extractText(data: unknown): string | null {
  if (
    typeof data === 'object' &&
    data !== null &&
    'content' in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    const blocks = (data as { content: Array<{ type?: string; text?: string }> })
      .content
    const textBlock = blocks.find((block) => block.type === 'text' && block.text)
    if (textBlock?.text) return textBlock.text.trim()
  }
  return null
}

/**
 * 규칙 기반 fallback 코멘트.
 * API 호출이 불가능할 때 통계만으로 한국어 코멘트를 구성한다.
 */
export function buildRuleBasedComment(session: Session): string {
  const overall = calculateOverallStats(session)
  const stats = calculateParticipationStats(session)
  const studentCount = session.students.length
  const total = overall.totalSpeechCount

  const lines: string[] = []

  // 1) 전체 분위기 한 줄 평 (발언 횟수 + 연결 다양성)
  lines.push(buildMoodComment(total, studentCount, stats))

  // 2) 소외 학생 언급 + 제안
  if (overall.isolatedStudents.length > 0) {
    const names = overall.isolatedStudents.join(', ')
    lines.push(
      `${names} 학생은 이번 토론에서 발언하거나 지목받지 못했습니다. ` +
        '다음에는 이 학생들에게 먼저 질문을 건네거나 발언 기회를 열어 주세요.',
    )
  }

  // 3) 독점 학생 언급 (전체 발언의 40% 이상)
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
