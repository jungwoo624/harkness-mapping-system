import { calculateParticipationStats, calculateOverallStats } from './calculateStats';
import type { Session } from '../types';

/**
 * 토론 세션에 대한 AI 분석 코멘트를 생성한다.
 *
 * ⚠ 현재는 실제 Claude API를 호출하지 않고, calculateStats 결과를
 * 바탕으로 규칙 기반(rule-based)으로 한국어 코멘트를 만든다.
 * 이후 단계에서 이 함수 내부를 실제 API 호출로 교체할 예정이며,
 * 호출부(ReportPage)가 `Promise<string>` 시그니처에만 의존하도록
 * 비동기 함수로 유지한다.
 */
export async function generateAIComment(session: Session): Promise<string> {
  // TODO(다음 단계): 아래 규칙 기반 로직을 실제 Claude API 호출로 교체.
  //   예) const res = await fetch('/api/comment', { ... body: stats })
  //       return res.text();
  const stats = calculateParticipationStats(session);
  const overall = calculateOverallStats(session);
  const studentCount = session.students.length;
  const totalSpeeches = overall.totalSpeechCount;

  const lines: string[] = [];

  // 1) 전체 토론 분위기 한 줄 평가 (발언 횟수 + 연결 다양성 기준)
  lines.push(evaluateMood(studentCount, totalSpeeches, stats));

  // 2) 발언 독점 학생 언급 (전체 발언의 40% 이상)
  const dominator = findDominator(stats, totalSpeeches);
  if (dominator) {
    const share = Math.round((dominator.totalSpeeches / totalSpeeches) * 100);
    lines.push(
      `${dominator.studentName} 학생이 전체 발언의 ${share}%를 차지하며 토론을 주도했습니다. ` +
        `다른 학생들에게도 발언 기회를 고르게 나눠주면 더 균형 잡힌 토론이 될 것입니다.`,
    );
  }

  // 3) 소외된 학생 언급과 제안
  if (overall.isolatedStudents.length > 0) {
    const names = overall.isolatedStudents.join(', ');
    lines.push(
      `${names} 학생은 이번 토론에서 발언하거나 지목받지 못했습니다. ` +
        `다음 토론에서는 이들에게 먼저 질문을 던져 대화에 참여하도록 유도해 보세요.`,
    );
  }

  return lines.join('\n\n');
}

/** 발언 수와 연결 다양성을 기준으로 전체 분위기 한 줄 평가를 만든다. */
function evaluateMood(
  studentCount: number,
  totalSpeeches: number,
  stats: ReturnType<typeof calculateParticipationStats>,
): string {
  if (totalSpeeches === 0) {
    return '아직 발언 기록이 없어 토론 분위기를 평가하기 어렵습니다.';
  }

  // 1인당 평균 발언 수
  const avgSpeeches = totalSpeeches / Math.max(1, studentCount);
  // 실제로 참여(발언 또는 연결)한 학생 비율
  const engagedCount = stats.filter(
    (s) => s.totalSpeeches > 0 || s.connectionsCount > 0,
  ).length;
  const engagementRatio = engagedCount / Math.max(1, studentCount);

  if (engagementRatio >= 0.8 && avgSpeeches >= 2) {
    return '전반적으로 활발하고 고르게 참여한 토론이었습니다. 다양한 학생들이 서로 의견을 주고받았습니다.';
  }
  if (engagementRatio >= 0.5) {
    return '비교적 무난하게 진행된 토론입니다. 다만 일부 학생의 참여가 더 필요해 보입니다.';
  }
  return '소수의 학생 위주로 진행된 다소 정적인 토론이었습니다. 참여 학생의 범위를 넓힐 필요가 있습니다.';
}

/** 전체 발언의 40% 이상을 차지한 학생을 찾는다. 없으면 null. */
function findDominator(
  stats: ReturnType<typeof calculateParticipationStats>,
  totalSpeeches: number,
): ReturnType<typeof calculateParticipationStats>[number] | null {
  if (totalSpeeches === 0) return null;
  const DOMINATION_THRESHOLD = 0.4;
  const top = stats.reduce((best, cur) =>
    cur.totalSpeeches > best.totalSpeeches ? cur : best,
  );
  return top.totalSpeeches / totalSpeeches >= DOMINATION_THRESHOLD ? top : null;
}
