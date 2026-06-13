// AI 분석 코멘트(규칙 기반) 표시 검증
// 시나리오(5명): s1→s2, s1→s3, s1→s4, s1→s2, s2→s1
//  → 총 5건, 학생1이 4건(80%) 독점, 학생5 소외
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

await page.getByTestId('topic-input').fill('AI 코멘트 검증')
await page.getByTestId('count-select').selectOption('5')
await page.getByTestId('start-session').click()
await speak('s1', 's2')
await speak('s1', 's3')
await speak('s1', 's4')
await speak('s1', 's2')
await speak('s2', 's1')

await page.getByTestId('end-session').click()

// 로딩 표시 (지연 동안 노출)
check('로딩 "분석 중입니다..." 표시', await page.getByTestId('ai-loading').isVisible())

// 코멘트 등장 대기
await page.getByTestId('ai-comment-text').waitFor({ state: 'visible', timeout: 5000 })
const c = await page.getByTestId('ai-comment-text').innerText()
console.log('\n--- 생성된 코멘트 ---\n' + c + '\n--------------------')

check('전체 분위기 평가 포함', c.includes('발언') && c.includes('토론'))
check('독점 학생 언급(학생1 + 80%)', c.includes('학생1') && c.includes('80%'))
check('소외 학생 언급(학생5)', c.includes('학생5'))
check('소외 제안 문구 포함', c.includes('발언 기회') || c.includes('질문'))
check('로딩 사라짐', !(await page.getByTestId('ai-loading').isVisible().catch(() => false)))

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`)
process.exit(failed.length === 0 ? 0 : 1)
