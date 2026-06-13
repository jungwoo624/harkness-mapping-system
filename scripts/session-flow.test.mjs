// 세션 전체 흐름 검증: 주제 입력 → 인원 선택 → 시작 → 발언 기록 → 종료
import { chromium } from 'playwright'

const URL = 'http://localhost:5173/'
const ARROW = '#93c5fd'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(URL, { waitUntil: 'networkidle' })

// 1) 설정 화면
check('설정: 주제 입력 필드 존재', await page.getByTestId('topic-input').isVisible())
check('설정: 인원 선택 존재', await page.getByTestId('count-select').isVisible())
check('설정: 세션 시작 버튼 존재', await page.getByTestId('start-session').isVisible())
check(
  '설정: 주제 placeholder',
  (await page.getByTestId('topic-input').getAttribute('placeholder')) ===
    '토론 주제를 입력하세요',
)

// 2) 주제 입력 + 인원 6명 선택 + 시작
await page.getByTestId('topic-input').fill('AI 시대의 직업 윤리')
await page.getByTestId('count-select').selectOption('6')
await page.getByTestId('start-session').click()

// 3) 진행 화면
check('진행: 제목 반영', (await page.getByTestId('session-title').innerText()) === 'AI 시대의 직업 윤리')
check('진행: 세션 종료 버튼 표시', await page.getByTestId('end-session').isVisible())
const seatCount = await page.locator('[data-testid^="seat-s"]').count()
check('진행: 학생 6명 배치', seatCount === 6, `${seatCount}명`)
check('진행: 설정 폼 사라짐', !(await page.getByTestId('topic-input').isVisible().catch(() => false)))

// 4) 발언 기록: s1→s2, s3→s4 (2건), s5→s5 토글(기록 안 됨)
await page.getByTestId('seat-s1').click()
await page.getByTestId('seat-s2').click()
await page.getByTestId('seat-s3').click()
await page.getByTestId('seat-s4').click()
await page.getByTestId('seat-s5').click()
await page.getByTestId('seat-s5').click() // 같은 학생 토글 → 기록 없음

check(
  '발언: 기록 2건',
  (await page.getByTestId('record-count').innerText()) === '총 발언 기록: 2건',
  await page.getByTestId('record-count').innerText(),
)
check('발언: 화살표 2개', (await page.locator(`path[stroke="${ARROW}"]`).count()) === 2)

// 5) 세션 종료
await page.getByTestId('end-session').click()
const endText = await page.getByTestId('end-screen').innerText()
check('종료: 종료 메시지', endText.includes('세션이 종료되었습니다'))
check('종료: 진행시간 표시', /진행시간:\s*\d+분/.test(endText), endText.replace(/\n/g, ' '))
check('종료: 총 발언 2건', endText.includes('총 발언 2건'))
check('종료: 테이블 사라짐', (await page.locator('[data-testid^="seat-s"]').count()) === 0)

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`)
process.exit(failed.length === 0 ? 0 : 1)
