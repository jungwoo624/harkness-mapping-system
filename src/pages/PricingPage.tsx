import { useState } from 'react'
import { Link } from 'react-router-dom'

// ⚠️ 임시 데이터 — 실제 가격/기능은 추후 확정 예정
const TIERS = [
  {
    name: '체험',
    price: '무료',
    period: '',
    features: ['학습 미리보기', '샘플 리포트 열람'],
    recommended: false,
  },
  {
    name: '기본',
    price: '월 OOO원',
    period: '',
    features: ['전체 학습 콘텐츠', '월 2회 토론 세션', '개인 리포트'],
    recommended: true,
  },
  {
    name: '프리미엄',
    price: '월 OOO원',
    period: '',
    features: ['무제한 세션', '1:1 피드백', '성장 곡선 추적'],
    recommended: false,
  },
]

const STEPS = [
  { no: '01', title: '회원가입', desc: '이메일로 간편하게 가입합니다.' },
  { no: '02', title: '등급 선택', desc: '학습 목표에 맞는 등급을 고릅니다.' },
  { no: '03', title: '결제', desc: '안전하게 결제를 진행합니다.' },
  { no: '04', title: '세션 예약', desc: '토론 세션 일정을 예약합니다.' },
]

// ⚠️ 임시 FAQ — 실제 내용은 추후 확정 예정
const FAQS = [
  {
    q: '하크니스 토론 경험이 전혀 없어도 되나요?',
    a: '네, 괜찮습니다. 처음 참여하는 학생도 따라올 수 있도록 준비 자료와 진행 가이드를 제공합니다.',
  },
  {
    q: '토론 세션은 온라인으로 진행되나요?',
    a: '온라인과 오프라인 세션을 모두 운영할 예정입니다. 등급과 일정에 따라 선택할 수 있습니다.',
  },
  {
    q: 'AI 분석 리포트는 어떤 내용을 담고 있나요?',
    a: '발언 흐름 네트워크, 학생별 참여도·기여도, 강점과 성장 포인트를 데이터 기반으로 제공합니다.',
  },
  {
    q: '등급은 언제든지 변경할 수 있나요?',
    a: '네, 마이페이지에서 언제든 상위/하위 등급으로 변경할 수 있습니다. (정책 추후 확정)',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '결제일 기준 일정 기간 내 미사용 시 환불이 가능합니다. 자세한 정책은 추후 안내됩니다.',
  },
]

/** 가입·이용료 안내 */
export function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="bg-white text-slate-900">
      {/* 1. 제목 + 부제 */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">이용 안내</h1>
        <p className="mt-3 text-slate-600">
          학습 목표에 맞는 멤버십을 선택하고 제노 리케이온을 시작하세요.
        </p>
      </section>

      {/* 2. 멤버십 등급 비교 */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid items-start gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm ${
                tier.recommended
                  ? 'border-teal-500 ring-2 ring-teal-500/30 md:-mt-2 md:mb-2'
                  : 'border-gray-200'
              }`}
            >
              {tier.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-500 px-3 py-1 text-xs font-bold text-slate-900">
                  추천
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
              <p className="mt-3 text-2xl font-bold text-slate-900">{tier.price}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-600">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-teal-600">✓</span> {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/login"
                className={`mt-8 rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                  tier.recommended
                    ? 'bg-slate-900 text-white hover:bg-slate-700'
                    : 'border border-gray-300 text-slate-700 hover:border-gray-400'
                }`}
              >
                선택하기
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          * 가격과 제공 기능은 추후 확정될 예정입니다.
        </p>
      </section>

      {/* 3. 가입 절차 4단계 */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-slate-900">가입 절차</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.no} className="relative">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <span className="font-display text-2xl font-bold text-teal-600">
                    {s.no}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="absolute right-[-18px] top-1/2 hidden -translate-y-1/2 text-2xl text-gray-300 lg:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ 아코디언 */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">자주 묻는 질문</h2>
        <div className="mt-10 divide-y divide-gray-200 rounded-xl border border-gray-200">
          {FAQS.map((faq, i) => {
            const open = openFaq === i
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="font-medium text-slate-900">{faq.q}</span>
                  <span
                    className={`shrink-0 text-teal-600 transition-transform ${
                      open ? 'rotate-45' : ''
                    }`}
                  >
                    ＋
                  </span>
                </button>
                {open && (
                  <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{faq.a}</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. 하단 CTA */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">지금 가입하고 시작하세요</h2>
          <Link
            to="/login?tab=signup"
            className="mt-6 inline-block rounded-lg bg-teal-500 px-7 py-3 text-base font-semibold text-slate-900 transition-colors hover:bg-teal-400"
          >
            가입하기
          </Link>
        </div>
      </section>
    </div>
  )
}
