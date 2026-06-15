import { useState } from 'react';
import HarknessTable from '../components/HarknessTable';
import type { Student, SpeechRecord } from '../types';

/** 세션 진행 단계 */
type Phase = 'setup' | 'active' | 'ended';

/** 좌석 원형 배치 중심 좌표 */
const CENTER = { x: 250, y: 250 };
/** 좌석 원형 배치 반지름 */
const SEAT_LAYOUT_RADIUS = 180;
/** 선택 가능한 학생 수 범위 */
const MIN_STUDENTS = 3;
const MAX_STUDENTS = 12;
const DEFAULT_STUDENTS = 6;

/**
 * 학생 수만큼 원형으로 균등 배치된 학생 객체를 생성한다.
 * 이름은 "학생1"..형식으로 자동 생성하며, 이후 수정 가능하도록
 * 개별 객체로 보관한다.
 */
function createStudents(count: number): Student[] {
  return Array.from({ length: count }, (_, i) => {
    // 12시 방향에서 시작해 시계 방향으로 균등 분배
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    return {
      id: `student-${i + 1}`,
      name: `학생${i + 1}`,
      position: {
        x: CENTER.x + SEAT_LAYOUT_RADIUS * Math.cos(angle),
        y: CENTER.y + SEAT_LAYOUT_RADIUS * Math.sin(angle),
      },
    };
  });
}

/**
 * 토론 세션 화면.
 * 주제·인원 입력 → 세션 진행(발언 기록) → 세션 종료 흐름을 관리한다.
 */
export default function SessionPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [title, setTitle] = useState('');
  const [studentCount, setStudentCount] = useState(DEFAULT_STUDENTS);

  const [students, setStudents] = useState<Student[]>([]);
  const [speechRecords, setSpeechRecords] = useState<SpeechRecord[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);

  function handleStart(): void {
    setStudents(createStudents(studentCount));
    setSpeechRecords([]);
    setStartedAt(Date.now());
    setEndedAt(null);
    setPhase('active');
  }

  function handleEnd(): void {
    setEndedAt(Date.now());
    setPhase('ended');
  }

  function handleAddSpeech(speakerId: string, targetId: string): void {
    const record: SpeechRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      speakerId,
      targetId,
      timestamp: Date.now(),
    };
    setSpeechRecords((prev) => [...prev, record]);
  }

  // ── 세션 설정 화면 ────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-800">새 토론 세션</h1>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          토론 주제
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="토론 주제를 입력하세요"
            className="rounded border border-slate-300 px-3 py-2 text-base text-slate-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          참여 학생 수
          <select
            value={studentCount}
            onChange={(e) => setStudentCount(Number(e.target.value))}
            className="rounded border border-slate-300 px-3 py-2 text-base text-slate-800"
          >
            {Array.from(
              { length: MAX_STUDENTS - MIN_STUDENTS + 1 },
              (_, i) => MIN_STUDENTS + i,
            ).map((n) => (
              <option key={n} value={n}>
                {n}명
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleStart}
          className="rounded bg-blue-600 px-4 py-2 text-base font-semibold text-white hover:bg-blue-500"
        >
          세션 시작
        </button>
      </section>
    );
  }

  // ── 세션 종료 화면 (리포트는 다음 단계 예정) ──────────────────────
  if (phase === 'ended') {
    const durationMinutes =
      startedAt && endedAt ? Math.round((endedAt - startedAt) / 60000) : 0;

    return (
      <section className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-bold text-slate-800">세션이 종료되었습니다.</h1>
        <p className="text-base text-slate-600">
          진행시간: {durationMinutes}분, 총 발언 {speechRecords.length}건
        </p>
        <button
          type="button"
          onClick={() => setPhase('setup')}
          className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          새 세션 시작
        </button>
      </section>
    );
  }

  // ── 세션 진행 화면 ────────────────────────────────────────────────
  return (
    <section className="flex flex-col items-center gap-4">
      <header className="flex w-full max-w-xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {title || '제목 없는 토론'}
          </h1>
          <p className="text-sm text-slate-500">참가 학생 {students.length}명</p>
        </div>
        <button
          type="button"
          onClick={handleEnd}
          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          세션 종료
        </button>
      </header>

      <HarknessTable
        students={students}
        speechRecords={speechRecords}
        onAddSpeech={handleAddSpeech}
      />
    </section>
  );
}
