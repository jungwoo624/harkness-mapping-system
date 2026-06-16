import { useState } from 'react'
import { SessionPage } from './pages/SessionPage'
import { VideoUploadPage } from './pages/VideoUploadPage'
import { AnalysisResultPage } from './pages/AnalysisResultPage'
import { mockAnalysisResult } from './data/mockAnalysisResult'
import type { AnalysisResult } from './data/mockAnalysisResult'

type Tab = 'manual' | 'video' | 'result'

const TABS: { id: Tab; label: string }[] = [
  { id: 'manual', label: '수동 매핑' },
  { id: 'video', label: '영상 분석' },
  { id: 'result', label: '결과' },
]

function App() {
  const [tab, setTab] = useState<Tab>('video')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [resultTitle, setResultTitle] = useState('')

  const handleViewResult = (result: AnalysisResult, title: string): void => {
    setAnalysisResult(result)
    setResultTitle(title)
    setTab('result')
  }

  const handleNewSession = (): void => {
    setAnalysisResult(null)
    setResultTitle('')
    setTab('video')
  }

  return (
    <div className="min-h-full bg-white text-slate-900">
      {/* 브랜드 헤더 */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 pt-10 pb-6 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-teal-600  sm:text-5xl">
            Xeno-Lykeion
          </h1>
          <p className="mt-3 text-sm font-light tracking-wide text-slate-700 sm:text-base">
            Where Human Minds and Intelligent Systems Evolve Together.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <nav className="mx-auto flex max-w-3xl justify-center gap-2 px-4">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 px-5 py-3 text-sm font-semibold tracking-wide transition-colors ${
                tab === id
                  ? 'border-teal-600 text-teal-600 '
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="pb-16">
        {tab === 'manual' && <SessionPage />}
        {tab === 'video' && <VideoUploadPage onViewResult={handleViewResult} />}
        {tab === 'result' && (
          <AnalysisResultPage
            analysisResult={analysisResult ?? mockAnalysisResult}
            sessionTitle={
              analysisResult ? resultTitle : '예시 결과 (영상 분석 전 미리보기)'
            }
            onNewSession={handleNewSession}
          />
        )}
      </main>
    </div>
  )
}

export default App
