import { useState } from 'react';
import type { Student, SpeechRecord } from '../types';

interface HarknessTableProps {
  /** 원형 테이블 둘레에 배치할 학생 목록 */
  students: Student[];
  /** 지금까지의 발언 기록 (상위에서 관리) */
  speechRecords: SpeechRecord[];
  /** 발언자→대상 발언이 기록될 때 호출 (읽기 전용이면 생략 가능) */
  onAddSpeech?: (speakerId: string, targetId: string) => void;
  /** true면 클릭/선택이 비활성화되어 최종 상태만 보여준다 */
  readOnly?: boolean;
}

/** SVG 캔버스 크기 (정사각형) */
const CANVAS_SIZE = 500;
/** 캔버스 중심 좌표 */
const CENTER = { x: 250, y: 250 };
/** 원형 테이블 반지름 */
const TABLE_RADIUS = 150;
/** 학생 좌석 기본 반지름 */
const BASE_SEAT_RADIUS = 30;
/** 학생 좌석 최대 반지름 */
const MAX_SEAT_RADIUS = 50;
/** 발언 1회당 늘어나는 반지름(px) */
const GROWTH_PER_SPEECH = 3;
/** 이름 텍스트를 진하게 칠하는 발언 횟수 임계값 */
const DARK_SEAT_THRESHOLD = 6;
/** 같은 두 학생 사이 곡선을 벌리는 간격(px) */
const CURVE_STEP = 25;

/** Tailwind 색상을 SVG에 적용하기 위한 hex 값 */
const COLORS = {
  /** gray-300 — 테이블 테두리 */
  table: '#d1d5db',
  /** 학생 원 기본 테두리 (blue-400) */
  seatStroke: '#60a5fa',
  /** yellow-400 — 선택된 발언자 강조 테두리 */
  seatSelected: '#facc15',
  /** blue-300 — 발언 화살표 */
  arrow: '#93c5fd',
  /** slate-300 — 다크 배경에서 읽히는 기본 이름 텍스트 */
  label: '#cbd5e1',
  /** 진한 좌석 위 이름 텍스트 */
  labelOnDark: '#ffffff',
} as const;

/** 발언 횟수별 좌석 채움 색 단계 */
const SEAT_FILL = {
  none: '#e5e7eb', // 0회: 회색
  low: '#bfdbfe', // 1-2회: 연한 파랑
  mid: '#60a5fa', // 3-5회: 중간 파랑
  high: '#2563eb', // 6회+: 진한 파랑
} as const;

/** 특정 학생이 발언자인 기록 수(총 발언 횟수)를 계산한다. */
function getSpeechCount(records: SpeechRecord[], studentId: string): number {
  return records.filter((record) => record.speakerId === studentId).length;
}

/** 발언 횟수에 따른 좌석 반지름 (기본 30, 1회당 +3, 최대 50). */
function getSeatRadius(count: number): number {
  return Math.min(BASE_SEAT_RADIUS + count * GROWTH_PER_SPEECH, MAX_SEAT_RADIUS);
}

/** 발언 횟수에 따른 좌석 채움 색. */
function getSeatFill(count: number): string {
  if (count === 0) return SEAT_FILL.none;
  if (count <= 2) return SEAT_FILL.low;
  if (count <= 5) return SEAT_FILL.mid;
  return SEAT_FILL.high;
}

/** 두 학생을 방향과 무관하게 식별하는 키 */
function undirectedKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/**
 * 같은 두 학생 사이 n번째 연결의 곡선 오프셋을 계산한다.
 * 0 → 직선, 이후 ±로 번갈아 벌어져 선이 겹치지 않는다.
 */
function curveOffset(pairIndex: number): number {
  if (pairIndex === 0) return 0;
  const magnitude = Math.ceil(pairIndex / 2) * CURVE_STEP;
  return pairIndex % 2 === 1 ? magnitude : -magnitude;
}

/**
 * 하크니스 토론용 원형 테이블. 학생을 좌석에 배치하고,
 * 클릭으로 발언자→대상 흐름을 화살표로 기록한다.
 * 발언 횟수가 많을수록 좌석이 커지고 색이 진해진다.
 */
export default function HarknessTable({
  students,
  speechRecords,
  onAddSpeech,
  readOnly = false,
}: HarknessTableProps) {
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);

  const studentById = new Map(students.map((s) => [s.id, s]));
  const selectedStudent = selectedSpeakerId ? studentById.get(selectedSpeakerId) : undefined;

  /** 좌석 반지름을 학생 id로 조회 (화살표가 원 가장자리에 닿도록 사용) */
  const radiusOf = (studentId: string): number =>
    getSeatRadius(getSpeechCount(speechRecords, studentId));

  const statusText = selectedStudent
    ? `${selectedStudent.name}님이 발언 중입니다. 대화 상대를 클릭하세요.`
    : '발언자를 클릭하세요.';

  function handleSeatClick(studentId: string): void {
    // 읽기 전용이면 어떤 클릭도 무시
    if (readOnly) return;
    // 아직 발언자가 없으면 → 발언자로 선택
    if (selectedSpeakerId === null) {
      setSelectedSpeakerId(studentId);
      return;
    }
    // 같은 학생을 다시 클릭 → 선택 취소(토글)
    if (selectedSpeakerId === studentId) {
      setSelectedSpeakerId(null);
      return;
    }
    // 다른 학생 클릭 → 발언 기록 추가 후 선택 초기화
    onAddSpeech?.(selectedSpeakerId, studentId);
    setSelectedSpeakerId(null);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {!readOnly && <p className="text-sm font-medium text-muted">{statusText}</p>}

      <svg
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        role="img"
        aria-label="하크니스 토론 원형 테이블"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth={8}
            markerHeight={8}
            refX={6}
            refY={3}
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill={COLORS.arrow} />
          </marker>
        </defs>

        {/* 중앙 원형 테이블 (테두리만) */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={TABLE_RADIUS}
          fill="none"
          stroke={COLORS.table}
          strokeWidth={2}
        />

        {/* 발언 화살표 (좌석보다 먼저 그려 좌석 아래에 깔리도록) */}
        {speechRecords.map((record, index) => {
          const speaker = studentById.get(record.speakerId);
          const target = record.targetId ? studentById.get(record.targetId) : undefined;
          if (!speaker || !target || !record.targetId) return null;

          const key = undirectedKey(record.speakerId, record.targetId);
          const pairIndex = speechRecords
            .slice(0, index)
            .filter((r) => r.targetId && undirectedKey(r.speakerId, r.targetId) === key).length;
          const offset = curveOffset(pairIndex);

          const dx = target.position.x - speaker.position.x;
          const dy = target.position.y - speaker.position.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;

          // 각 원의 실제 반지름만큼 떨어진 가장자리에서 시작/끝
          const sx = speaker.position.x + ux * radiusOf(speaker.id);
          const sy = speaker.position.y + uy * radiusOf(speaker.id);
          const ex = target.position.x - ux * radiusOf(target.id);
          const ey = target.position.y - uy * radiusOf(target.id);

          // 수직 방향으로 제어점을 밀어 곡선 생성
          const mx = (sx + ex) / 2;
          const my = (sy + ey) / 2;
          const cx = mx + -uy * offset;
          const cy = my + ux * offset;

          const d =
            offset === 0
              ? `M ${sx} ${sy} L ${ex} ${ey}`
              : `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;

          return (
            <path
              key={record.id}
              d={d}
              fill="none"
              stroke={COLORS.arrow}
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* 학생 좌석 (발언 횟수에 따라 크기·색 변화) */}
        {students.map((student) => {
          const count = getSpeechCount(speechRecords, student.id);
          const radius = getSeatRadius(count);
          const isSelected = student.id === selectedSpeakerId;
          const isDark = count >= DARK_SEAT_THRESHOLD;

          return (
            <g
              key={student.id}
              onClick={() => handleSeatClick(student.id)}
              style={{ cursor: readOnly ? 'default' : 'pointer' }}
            >
              <circle
                cx={student.position.x}
                cy={student.position.y}
                r={radius}
                fill={getSeatFill(count)}
                stroke={isSelected ? COLORS.seatSelected : COLORS.seatStroke}
                strokeWidth={isSelected ? 3 : 2}
              />
              {/* 원 반지름에 맞춰 아래쪽에 여백을 두고 이름 배치 */}
              <text
                x={student.position.x}
                y={student.position.y + radius + 16}
                textAnchor="middle"
                fontSize={14}
                fill={isDark ? COLORS.labelOnDark : COLORS.label}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {student.name} ({count})
              </text>
            </g>
          );
        })}
      </svg>

      <p className="text-sm text-muted">총 발언 기록: {speechRecords.length}건</p>
    </div>
  );
}
