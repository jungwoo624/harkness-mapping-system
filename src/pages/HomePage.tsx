import { Link } from 'react-router-dom'

/** 랜딩 페이지 (placeholder) */
export function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight text-teal-600 sm:text-5xl">
        제노 리케이온
      </h1>
      <p className="mt-4 text-lg text-slate-700">
        Where Human Minds and Intelligent Systems Evolve Together.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        하크니스 토론을 매핑하고 AI로 분석하는 학습 플랫폼
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/admin"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          토론 분석 시작
        </Link>
        <Link
          to="/about"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-gray-400"
        >
          서비스 소개
        </Link>
      </div>
    </main>
  )
}
