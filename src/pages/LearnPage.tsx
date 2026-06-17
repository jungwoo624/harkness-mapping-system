import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LEARN_CATEGORIES, LEARN_ITEMS, type LearnItem } from '../data/learnContent'

/** 학습 항목 한 줄 */
function ItemRow({ item, locked }: { item: LearnItem; locked: boolean }) {
  const inner = (
    <>
      <div className="flex items-center gap-2">
        <h4 className="font-medium text-slate-900">{item.title}</h4>
        {item.externalLink && <span className="text-xs text-teal-600">↗ 바로가기</span>}
      </div>
      <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
    </>
  )

  if (locked) {
    return (
      <div className="relative rounded-lg border border-gray-200 p-4">
        <div className="pointer-events-none select-none blur-sm">{inner}</div>
        <span className="absolute right-3 top-3 text-sm" aria-label="회원 전용">
          🔒
        </span>
      </div>
    )
  }

  if (item.externalLink) {
    return (
      <a
        href={item.externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
      >
        {inner}
      </a>
    )
  }

  return <div className="rounded-lg border border-gray-200 p-4">{inner}</div>
}

/** 심층 학습 (공개 페이지, 로그인 여부에 따라 콘텐츠 분기) */
export function LearnPage() {
  const { user } = useAuth()
  const [openCats, setOpenCats] = useState<Set<string>>(() => new Set([LEARN_CATEGORIES[0].name]))

  const toggle = (name: string): void => {
    setOpenCats((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="bg-white text-slate-900">
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">심층 학습</h1>
        <p className="mt-3 text-slate-600">
          하크니스 토론을 더 깊이 이해할 수 있는 학습 자료입니다.
        </p>
        {!user && (
          <p className="mt-2 text-sm text-slate-400">
            일부 자료는 미리보기로 제공됩니다. 전체 자료는 회원가입 후 이용할 수 있어요.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="flex flex-col gap-4">
          {LEARN_CATEGORIES.map((cat) => {
            const items = LEARN_ITEMS.filter((i) => i.category === cat.name)
            const open = openCats.has(cat.name)
            const hasLocked = !user && items.some((i) => !i.isPreview)

            return (
              <div
                key={cat.name}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* 카테고리 헤더 (클릭 시 펼침) */}
                <button
                  type="button"
                  onClick={() => toggle(cat.name)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{cat.desc}</p>
                  </div>
                  <span
                    className={`shrink-0 text-teal-600 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {/* 상세 콘텐츠 */}
                {open && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <div className="flex flex-col gap-3">
                      {items.map((item, idx) => (
                        <ItemRow
                          key={idx}
                          item={item}
                          locked={!user && !item.isPreview}
                        />
                      ))}
                    </div>

                    {/* 비로그인: 회원 전용 안내 + 가입 */}
                    {hasLocked && (
                      <div className="mt-4 rounded-lg bg-slate-50 px-4 py-4 text-center">
                        <p className="text-sm text-slate-600">
                          🔒 전체 보기는 회원가입 후 이용 가능합니다.
                        </p>
                        <Link
                          to="/login?tab=signup"
                          className="mt-3 inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                          회원가입하고 전체 보기
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
