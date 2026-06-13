import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DiscussionMap from '../components/DiscussionMap.jsx';
import { getSession, saveSession } from '../utils/storage.js';
import { MAX_STUDENTS } from '../utils/constants.js';

export default function MappingPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setSession(getSession(id));
  }, [id]);

  // 변경 시마다 저장소에 반영
  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  if (!session) {
    return <p className="text-[13px] text-muted">세션을 찾을 수 없습니다.</p>;
  }

  const isFull = session.students.length >= MAX_STUDENTS;

  const addStudent = (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name || isFull) return;
    setSession((prev) => ({
      ...prev,
      students: [
        ...prev.students,
        { id: crypto.randomUUID(), name, contributions: 0 },
      ],
    }));
    setNewName('');
  };

  const addLink = ({ from, to }) => {
    setSession((prev) => ({
      ...prev,
      links: [...prev.links, { from, to, at: Date.now() }],
      students: prev.students.map((s) =>
        s.id === from ? { ...s, contributions: (s.contributions ?? 0) + 1 } : s
      ),
    }));
  };

  const resetLinks = () => {
    setSession((prev) => ({
      ...prev,
      links: [],
      students: prev.students.map((s) => ({ ...s, contributions: 0 })),
    }));
  };

  return (
    <section className="grid grid-cols-[280px_1fr] gap-7">
      {/* 사이드바 */}
      <aside>
        <h2 className="mb-4 text-xl font-semibold">{session.title}</h2>

        <form className="mb-3 flex gap-2" onSubmit={addStudent}>
          <input
            type="text"
            placeholder="학생 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isFull}
            className="min-w-0 flex-1 rounded-xl border border-surface-2 bg-surface px-3 py-2.5 text-[#e8ecf4] outline-none placeholder:text-muted focus:border-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isFull}
            className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            추가
          </button>
        </form>

        <p className="mb-1 text-[13px] text-muted">
          학생 {session.students.length} / {MAX_STUDENTS}명
          {isFull && <span className="ml-1 text-accent">(정원 도달)</span>}
        </p>
        <p className="mb-4 text-[13px] leading-relaxed text-muted">
          퍼실리테이터가 학생 A를 클릭한 뒤 학생 B를 클릭하면 두 사람 사이에
          발언 화살표가 그려집니다.
        </p>

        <div className="flex items-center justify-between border-t border-surface-2 pt-3">
          <span className="text-[13px] text-muted">총 발언 {session.links.length}건</span>
          {session.links.length > 0 && (
            <button
              type="button"
              onClick={resetLinks}
              className="rounded-lg border border-surface-2 px-3 py-1.5 text-[12px] text-muted transition hover:border-accent hover:text-accent"
            >
              초기화
            </button>
          )}
        </div>
      </aside>

      {/* 매핑 캔버스 */}
      <div className="flex items-center justify-center">
        {session.students.length === 0 ? (
          <p className="text-[13px] text-muted">학생을 추가해 매핑을 시작하세요.</p>
        ) : (
          <DiscussionMap
            students={session.students}
            links={session.links}
            onAddLink={addLink}
          />
        )}
      </div>
    </section>
  );
}
