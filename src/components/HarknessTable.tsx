import { useState } from 'react';
import type { Student, SpeechRecord } from '../types';

interface HarknessTableProps {
  /** 원형 테이블 둘레에 배치할 학생 목록 */
  students: Student[];
}

/** SVG 캔버스 크기 (정사각형) */
const CANVAS_SIZE = 500;
/** 캔버스 중심 좌표 */
const CENTER = { x: 250, y: 250 };
/** 원형 테이블 반지름 */
const TABLE_RADIUS = 150;
/** 학생 좌석 원 반지름 */
const SEAT_RADIUS = 30;
/** 같은 두 학생 사이 곡선을 벌리는 간격(px) */
const CURVE_STEP = 25;

/** Tailwind 색상을 SVG에 적용하기 위한 hex 값 */
const COLORS = {
  /** gray-300 — 테이블 테두리 */
  table: '#d1d5db',
  /** blue-100 — 학생 원 채움 */
  seatFill: '#dbeafe',
  /** blue-400 — 학생 원 기본 테두리 */
  seatStroke: '#60a5fa',
  /** yellow-400 — 선택된 발언자 강조 테두리 */
  seatSelected: '#facc15',
  /** blue-300 — 발언 화살표 */
  arrow: '#93c5fd',
  /** slate-700 — 이름 텍스트 */
  label: '#334155',
} as const;

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
 */
export default function HarknessTable({ students }: HarknessTableProps) {
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);
  const [speechRecords, setSpeechRecords] = useState<SpeechRecord[]>([]);

  const studentById = new Map(students.map((s) => [s.id, s]));
  const selectedStudent = selectedSpeakerId ? studentById.get(selectedSpeakerId) : undefined;

  const statusText = selectedStudent
    ? `${selectedStudent.name}님이 발언 중입니다. 대화 상대를 클릭하세요.`
    : '발언자를 클릭하세요.';

  function handleSeatClick(studentId: string): void {
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
    // 다른 학생 클릭 → 발언 기록 생성 후 선택 초기화
    const record: SpeechRecord = {
      id: Date.now().toString(),
      speakerId: selectedSpeakerId,
      targetId: studentId,
      timestamp: Date.now(),
    };
    setSpeechRecords((prev) => [...prev, record]);
    setSelectedSpeakerId(null);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-slate-600">{statusText}</p>

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

          // 원 가장자리에서 시작/끝 (원 위를 침범하지 않도록)
          const sx = speaker.position.x + ux * SEAT_RADIUS;
          const sy = speaker.position.y + uy * SEAT_RADIUS;
          const ex = target.position.x - ux * SEAT_RADIUS;
          const ey = target.position.y - uy * SEAT_RADIUS;

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

        {/* 학생 좌석 */}
        {students.map((student) => {
          const isSelected = student.id === selectedSpeakerId;
          return (
            <g
              key={student.id}
              onClick={() => handleSeatClick(student.id)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={student.position.x}
                cy={student.position.y}
                r={SEAT_RADIUS}
                fill={COLORS.seatFill}
                stroke={isSelected ? COLORS.seatSelected : COLORS.seatStroke}
                strokeWidth={isSelected ? 3 : 2}
              />
              <text
                x={student.position.x}
                y={student.position.y + SEAT_RADIUS + 16}
                textAnchor="middle"
                fontSize={14}
                fill={COLORS.label}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {student.name}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="text-sm text-slate-500">총 발언 기록: {speechRecords.length}건</p>
    </div>
  );
}
