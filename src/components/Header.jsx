import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex items-baseline gap-4 border-b border-surface-2 bg-surface px-7 py-[18px]">
      <Link to="/" className="flex items-center gap-2 font-bold text-[18px] text-[#e8ecf4] no-underline">
        <span className="text-[22px] text-accent">◍</span>
        <span>Harkness Mapping</span>
      </Link>
      <p className="m-0 text-[13px] text-muted">토론 발언 흐름을 시각화하세요</p>
    </header>
  );
}
