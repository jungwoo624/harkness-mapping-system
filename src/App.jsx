import { Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';

/**
 * 앱 레이아웃 셸. 헤더 + 라우팅된 페이지(Outlet)를 렌더링한다.
 */
export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1 p-7">
        <Outlet />
      </main>
    </div>
  );
}
