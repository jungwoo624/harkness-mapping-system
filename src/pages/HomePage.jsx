import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSessions, createSession } from '../utils/storage.js';

export default function HomePage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    setSessions(listSessions());
  }, []);

  const handleCreate = (event) => {
    event.preventDefault();
    const session = createSession(title);
    navigate(`/session/${session.id}`);
  };

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="mb-1.5 text-2xl font-bold">토론 세션</h1>
        <p className="text-muted">
          새 하크니스 토론을 만들고 학생들의 발언 흐름을 매핑하세요.
        </p>
      </div>

      <form className="mb-7 flex gap-2.5" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="새 토론 제목 (예: 정의란 무엇인가)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-xl border border-surface-2 bg-surface px-3.5 py-3 text-[#e8ecf4] outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:brightness-110"
        >
          토론 시작
        </button>
      </form>

      <ul className="grid list-none gap-2.5 p-0">
        {sessions.length === 0 && (
          <li className="text-[13px] text-muted">아직 토론 세션이 없습니다.</li>
        )}
        {sessions.map((session) => (
          <li
            key={session.id}
            onClick={() => navigate(`/session/${session.id}`)}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-2 bg-surface px-[18px] py-4 transition hover:-translate-y-px hover:border-accent"
          >
            <span className="font-semibold">{session.title}</span>
            <span className="text-[13px] text-muted">
              학생 {session.students.length}명 · 발언 {session.links.length}건
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
