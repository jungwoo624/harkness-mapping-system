import { useState } from 'react'
import { SessionPage } from './pages/SessionPage'
import { VideoUploadPage } from './pages/VideoUploadPage'

type Tab = 'manual' | 'video'

const TABS: { id: Tab; label: string }[] = [
  { id: 'manual', label: '수동 매핑' },
  { id: 'video', label: '영상 분석' },
]

function App() {
  const [tab, setTab] = useState<Tab>('manual')

  return (
    <div className="min-h-full bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl gap-1 px-4">
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

      {tab === 'manual' ? <SessionPage /> : <VideoUploadPage />}
    </div>
  )
}

export default App
