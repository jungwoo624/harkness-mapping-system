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
  const [tab, setTab] = useState<Tab>('manual')
  // 영상 분석으로 생성된 실제 결과 (없으면 미리보기용 목 데이터 표시)
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
    <div className="min-h-full bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl gap-1 px-4">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

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
    </div>
  )
}

export default App
