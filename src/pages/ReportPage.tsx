import HarknessTable from '../components/HarknessTable';
import {
  calculateParticipationStats,
  calculateOverallStats,
} from '../utils/calculateStats';
import type { Session } from '../types';

interface ReportPageProps {
  /** 리포트를 생성할 종료된 세션 */
  session: Session;
}

/** ISO 날짜 문자열을 한국어 표기로 변환한다. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', { dateStyle: 'long', timeStyle: 'short' });
}

/**
 * 세션 종료 후 결과 리포트 화면.
 * 통계 유틸로 학생별/전체 통계를 계산해 네트워크 지도, 막대 그래프,
 * 요약 카드를 보여준다.
 */
export default function ReportPage({ session }: ReportPageProps) {
  const stats = calculateParticipationStats(session);
  const overall = calculateOverallStats(session);

  // 막대 길이 비율 계산용 최댓값 (0으로 나누는 것 방지)
  const maxSpeeches = Math.max(1, ...stats.map((s) => s.totalSpeeches));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {/* 상단: 세션 메타 정보 */}
      <header className="rounded-lg bg-surface p-5">
        <h1 className="text-2xl font-bold text-[#e8ecf4]">{session.title}</h1>
        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
          <div className="flex gap-1">
            <dt>날짜:</dt>
            <dd>{formatDate(session.date)}</dd>
          </div>
          <div className="flex gap-1">
            <dt>진행시간:</dt>
            <dd>{session.durationMinutes}분</dd>
          </div>
          <div className="flex gap-1">
            <dt>참여 인원:</dt>
            <dd>{session.students.length}명</dd>
          </div>
        </dl>
      </header>

      {/* 발언 네트워크 지도 (읽기 전용) */}
      <section className="rounded-lg bg-surface p-5">
        <h2 className="mb-3 text-lg font-semibold text-[#e8ecf4]">발언 네트워크 지도</h2>
        <HarknessTable
          students={session.students}
          speechRecords={session.speechRecords}
          readOnly
        />
      </section>

      {/* 학생별 참여 현황 막대 그래프 */}
      <section className="rounded-lg bg-surface p-5">
        <h2 className="mb-4 text-lg font-semibold text-[#e8ecf4]">학생별 참여 현황</h2>
        <ul className="flex flex-col gap-3">
          {stats.map((s) => (
            <li key={s.studentId} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-sm text-[#e8ecf4]">{s.studentName}</span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-surface-2">
                <div
                  className="h-full rounded bg-accent transition-all"
                  style={{ width: `${(s.totalSpeeches / maxSpeeches) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-muted">
                {s.totalSpeeches}회
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 전체 요약 카드 */}
      <section className="rounded-lg bg-surface p-5">
        <h2 className="mb-4 text-lg font-semibold text-[#e8ecf4]">전체 요약</h2>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-[#e8ecf4]">
            가장 활발한 참여자:{' '}
            <span className="font-semibold text-accent">
              {overall.mostActiveStudent ?? '-'}
            </span>
          </p>
          <p className="text-[#e8ecf4]">
            가장 조용했던 참여자:{' '}
            <span className="font-semibold text-muted">
              {overall.leastActiveStudent ?? '-'}
            </span>
          </p>

          {overall.isolatedStudents.length > 0 ? (
            <p className="mt-2 rounded bg-orange-500/15 px-3 py-2 font-medium text-orange-400">
              ⚠ 대화에서 소외된 학생: {overall.isolatedStudents.join(', ')}
            </p>
          ) : (
            <p className="mt-2 rounded bg-green-500/15 px-3 py-2 font-medium text-green-400">
              ✓ 모든 학생이 대화에 참여했습니다
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
