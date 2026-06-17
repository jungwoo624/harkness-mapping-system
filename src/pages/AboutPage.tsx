import { Link } from 'react-router-dom'

const FEATURES = [
  {
    title: '원형 배치',
    desc: '모두가 서로의 얼굴을 마주 보는 둥근 테이블에서 동등하게 대화합니다.',
  },
  {
    title: '학생 주도',
    desc: '교사가 답을 주지 않습니다. 학생들이 스스로 질문하고 논의를 이끕니다.',
  },
  {
    title: '협력적 탐구',
    desc: '이기는 토론이 아니라, 함께 더 나은 이해에 도달하는 탐구입니다.',
  },
  {
    title: '경청과 연결',
    desc: '상대의 말을 인용하고 이어가며 생각과 생각을 연결합니다.',
  },
]

const STEPS = [
  { no: '01', title: '토론 준비', desc: '주제와 텍스트를 읽고 질문을 준비합니다.' },
  { no: '02', title: '하크니스 세션', desc: '원형 테이블에서 학생 주도로 토론합니다.' },
  { no: '03', title: 'AI 매핑·분석', desc: '발언 흐름과 참여도를 자동 분석합니다.' },
  { no: '04', title: '개인 리포트', desc: '학생별 강점과 성장 포인트를 받습니다.' },
]

const IVY = [
  {
    title: '에세이',
    desc: '자기 생각을 논리적으로 전개하는 글쓰기 역량의 토대가 됩니다.',
  },
  {
    title: '인터뷰',
    desc: '즉석에서 사고하고 설득력 있게 말하는 대화 능력을 기릅니다.',
  },
  {
    title: '세미나',
    desc: '대학 토론식 수업에서 필요한 경청·반박·연결 기술을 미리 익힙니다.',
  },
  {
    title: '리더십',
    desc: '다양한 의견을 조율하고 논의를 이끄는 협력적 리더십을 키웁니다.',
  },
]

/** 서비스 소개 (랜딩형) */
export function AboutPage() {
  return (
    <div className="bg-white text-slate-900">
      {/* 1. 히어로 */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            생각하고 연결하는
            <br />
            인간을 키우다
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
            제노 리케이온 — 하크니스 토론 기반 미래 인재 교육
          </p>
          <Link
            to="/pricing"
            className="mt-10 inline-block rounded-lg bg-teal-500 px-7 py-3 text-base font-semibold text-slate-900 transition-colors hover:bg-teal-400"
          >
            지금 시작하기
          </Link>
        </div>
      </section>

      {/* 2. 하크니스 토론이란 */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
            What is Harkness
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">하크니스 토론이란?</h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            하크니스(Harkness) 토론은 미국 명문 사립학교 필립스 엑서터에서 시작된 학습
            방식입니다. 둥근 테이블에 둘러앉아 교사의 강의가 아닌 학생들의 대화로 수업이
            진행됩니다. 정답을 맞히는 것이 아니라, 서로의 생각을 경청하고 연결하며 더 깊은
            이해에 함께 도달하는 것을 목표로 합니다.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-600">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 진행 4단계 */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              제노 리케이온은 이렇게 진행합니다
            </h2>
          </div>

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
                {/* 단계 연결 화살표 (마지막 제외, 데스크톱) */}
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

      {/* 4. AI 매핑 분석 미리보기 */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              AI Analysis
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">AI 매핑 분석 미리보기</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              토론 영상을 업로드하면 AI가 누가 누구에게 발언했는지 발언 흐름을 네트워크
              지도로 그려냅니다. 학생별 발언 횟수와 시간, 다른 학생과의 연결 정도를
              데이터로 분석해 참여도와 기여도를 객관적으로 보여줍니다.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-teal-600">✓</span> 발언 흐름 네트워크 시각화
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600">✓</span> 학생별 참여도·기여도 정량 분석
              </li>
              <li className="flex gap-2">
                <span className="text-teal-600">✓</span> 소외된 학생·발언 독점 자동 감지
              </li>
            </ul>
          </div>

          {/* 샘플 리포트 이미지 자리 (placeholder) */}
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-100">
            <span className="text-sm text-gray-400">샘플 리포트 이미지 영역</span>
          </div>
        </div>
      </section>

      {/* 5. 왜 아이비리그 진학에 필요한가 */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
              Why it matters
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              왜 아이비리그 진학에 필요한가
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {IVY.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mt-1 h-10 w-1 shrink-0 rounded bg-teal-500" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 하단 CTA */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">제노 리케이온과 함께 시작하세요</h2>
          <p className="mt-4 text-slate-300">
            생각하고 연결하는 힘, 지금부터 길러보세요.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-lg bg-teal-500 px-7 py-3 text-base font-semibold text-slate-900 transition-colors hover:bg-teal-400"
          >
            가입하기
          </Link>
        </div>
      </section>
    </div>
  )
}
