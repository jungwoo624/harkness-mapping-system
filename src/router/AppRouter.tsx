import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { HomePage } from '../pages/HomePage'
import { AboutPage } from '../pages/AboutPage'
import { PricingPage } from '../pages/PricingPage'
import { LearnPage } from '../pages/LearnPage'
import { ArchivePage } from '../pages/ArchivePage'
import { MyPage } from '../pages/MyPage'
import { LoginPage } from '../pages/LoginPage'
import { AdminPage } from '../pages/AdminPage'

/** 모든 페이지 공통 레이아웃 (상단 NavBar + 페이지 본문) */
function Layout() {
  return (
    <div className="min-h-full bg-white text-slate-900">
      <NavBar />
      <Outlet />
    </div>
  )
}

/** URL 기반 라우팅 정의 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* 없는 경로는 홈으로 */}
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
