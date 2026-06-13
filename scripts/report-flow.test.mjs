// 종료 화면 리포트: 막대 그래프 + 색상 요약(소외/전원참여) 검증
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

const speak = async (a, b) => {
  await page.getByTestId(`seat-${a}`).click()
  await page.getByTestId(`seat-${b}`).click()
}
const barWidth = async (id) => {
  const box = await page.getByTestId(`bar-fill-${id}`).boundingBox()
  return box ? box.width : 0
}

// ── 시나리오 A: 소외 학생 존재 (5명: s1→s2, s1→s3, s2→s1) ──
await page.getByTestId('topic-input').fill('소외 케이스')
await page.getByTestId('count-select').selectOption('5')
await page.getByTestId('start-session').click()
await speak('s1', 's2')
await speak('s1', 's3')
await speak('s2', 's1')
await page.getByTestId('end-session').click()

check('A: 요약 카드 표시', await page.getByTestId('summary-card').isVisible())
check('A: 가장 활발한 참여자 학생1', (await page.getByTestId('summary-most').innerText()) === '학생1')
check('A: 가장 조용했던 참여자 학생3', (await page.getByTestId('summary-least').innerText()) === '학생3')

const isolatedVisible = await page.getByTestId('summary-isolated').isVisible()
check('A: 소외 학생 메시지 표시', isolatedVisible)
const isoText = await page.getByTestId('summary-isolated').innerText()
check('A: 소외 학생 4·5 포함', isoText.includes('학생4') && isoText.includes('학생5'), isoText)
const isoColor = await page
  .getByTestId('summary-isolated')
  .evaluate((el) => getComputedStyle(el).color)
check('A: 소외 메시지 주의색(주황 계열)', /rgb\(194, 65, 12\)|rgb\(154, 52, 18\)/.test(isoColor), isoColor)

// 막대: s1(2회) > s2(1회) > 0, s3/s4/s5 = 0
const w1 = await barWidth('s1')
const w2 = await barWidth('s2')
const w3 = await barWidth('s3')
check('A: 막대 s1 > s2 > 0', w1 > w2 && w2 > 0, `s1=${w1.toFixed(0)} s2=${w2.toFixed(0)}`)
check('A: 막대 s3 = 0(발언 0회)', w3 < 2, `s3=${w3.toFixed(1)}`)

// ── 시나리오 B: 전원 참여 (3명: s1→s2, s2→s3, s3→s1) ──
await page.getByTestId('new-session').click()
await page.getByTestId('topic-input').fill('전원 참여 케이스')
await page.getByTestId('count-select').selectOption('3')
await page.getByTestId('start-session').click()
await speak('s1', 's2')
await speak('s2', 's3')
await speak('s3', 's1')
await page.getByTestId('end-session').click()

check('B: 소외 메시지 없음', !(await page.getByTestId('summary-isolated').isVisible().catch(() => false)))
const allVisible = await page.getByTestId('summary-all-participated').isVisible()
check('B: 전원 참여 메시지 표시', allVisible)
check(
  'B: 전원 참여 문구',
  (await page.getByTestId('summary-all-participated').innerText()).includes('모든 학생이 대화에 참여했습니다'),
)
const okColor = await page
  .getByTestId('summary-all-participated')
  .evaluate((el) => getComputedStyle(el).color)
check('B: 긍정색(초록 계열)', /rgb\(4, 120, 87\)|rgb\(6, 95, 70\)/.test(okColor), okColor)

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`)
process.exit(failed.length === 0 ? 0 : 1)
