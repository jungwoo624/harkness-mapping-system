import HarknessTable from '../components/HarknessTable';
import mockSession from '../data/mockSession';

/**
 * 토론 세션 화면. mockSession 데이터를 사용해
 * 원형 테이블과 참가 학생들을 렌더링한다.
 */
export default function SessionPage() {
  return (
    <section className="flex flex-col items-center gap-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">{mockSession.title}</h1>
        <p className="text-sm text-slate-500">
          참가 학생 {mockSession.students.length}명 · {mockSession.durationMinutes}분
        </p>
      </header>

      <HarknessTable students={mockSession.students} />
    </section>
  );
}
