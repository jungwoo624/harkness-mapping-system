import SessionPage from './pages/SessionPage';

/**
 * 앱 루트. 현재는 토론 세션 화면(SessionPage)을 렌더링한다.
 */
export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="flex-1 p-7">
        <SessionPage />
      </main>
    </div>
  );
}
