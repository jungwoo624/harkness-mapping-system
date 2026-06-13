// 종료 화면 참여 리포트 검증
// 시나리오(5명): s1→s2, s1→s3, s2→s1  → 발언수 s1=2,s2=1, 나머지 0 / s4·s5 고립
import { chromium } from 'playwright'

const URL = 'http://localhost:5173/'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(URL, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.removeItem('harkness_sessions'))

// 세션 시작 (5명)
await page.getByTestId('topic-input').fill('리포트 검증')
await page.getByTestId('count-select').selectOption('5')
await page.getByTestId('start-session').click()

// 발언: s1→s2, s1→s3, s2→s1
const speak = async (a, b) => {
  await page.getByTestId(`seat-${a}`).click()
  await page.getByTestId(`seat-${b}`).click()
}
await speak('s1', 's2')
await speak('s1', 's3')
await speak('s2', 's1')

await page.getByTestId('end-session').click()

// 리포트 존재
check('리포트 영역 표시', await page.getByTestId('session-report').isVisible())

// 요약 통계
const text = (tid) => page.getByTestId(tid).innerText()
check('총 발언 3건', (await text('stat-total')).includes('3건'))
check('최다 발언 학생1', (await text('stat-most')).includes('학생1'))
// 최소: 발언 0인 학생 다수(학생3,4,5) 중 먼저 등장한 학생3
check('최소 발언 학생(0회 포함)', (await text('stat-least')).includes('학생3'))
// 고립(연결 0): s4, s5 → 학생4, 학생5
const isolated = await text('stat-isolated')
check('고립 학생 4·5', isolated.includes('학생4') && isolated.includes('학생5'), isolated)
check('고립에 연결된 학생 미포함', !isolated.includes('학생1') && !isolated.includes('학생2'))

// 학생별 발언 수
const speeches = async (id) => Number(await page.getByTestId(`report-speeches-${id}`).innerText())
check('s1 발언 2', (await speeches('s1')) === 2)
check('s2 발언 1', (await speeches('s2')) === 1)
check('s3 발언 0', (await speeches('s3')) === 0)
check('s4 발언 0', (await speeches('s4')) === 0)

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`)
process.exit(failed.length === 0 ? 0 : 1)
