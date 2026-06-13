// localStorage 세션 저장 검증: 2개 세션 누적 저장 확인
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

// localStorage 초기화 (깨끗한 상태에서 시작)
await page.evaluate(() => localStorage.removeItem('harkness_sessions'))

/** 한 세션을 처음부터 끝까지 진행한다. speeches: [speakerSeat, targetSeat] 목록 */
async function runSession(topic, count, speeches) {
  await page.getByTestId('topic-input').fill(topic)
  await page.getByTestId('count-select').selectOption(String(count))
  await page.getByTestId('start-session').click()
  for (const [a, b] of speeches) {
    await page.getByTestId(`seat-${a}`).click()
    await page.getByTestId(`seat-${b}`).click()
  }
  await page.getByTestId('end-session').click()
}

// 세션 1: 토론1, 4명, 발언 1건
await runSession('토론1', 4, [['s1', 's2']])

// 저장 직후 raw localStorage 확인
const after1 = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('harkness_sessions') ?? '[]'),
)
check('세션1 저장 후 1개', after1.length === 1, `${after1.length}개`)

// 새 세션 시작 → 설정 화면 복귀
await page.getByTestId('new-session').click()
check('새 세션 시작 → 설정 폼', await page.getByTestId('topic-input').isVisible())

// 세션 2: 토론2, 5명, 발언 2건
await runSession('토론2', 5, [['s1', 's2'], ['s3', 's4']])

// "저장된 세션 목록 보기" 버튼으로 화면 출력 확인
await page.getByTestId('view-saved').click()
const dumpText = await page.getByTestId('session-dump').innerText()
const dump = JSON.parse(dumpText)

check('세션 2개 누적 저장', dump.length === 2, `${dump.length}개`)
check('세션1 제목', dump[0].title === '토론1')
check('세션2 제목', dump[1].title === '토론2')
check('세션1 학생 4명', dump[0].students.length === 4)
check('세션2 학생 5명', dump[1].students.length === 5)
check('세션1 발언 1건', dump[0].speechRecords.length === 1)
check('세션2 발언 2건', dump[1].speechRecords.length === 2)
check(
  '필수 필드 포함(date/durationMinutes/id)',
  dump.every((s) => typeof s.id === 'string' && typeof s.date === 'string' && typeof s.durationMinutes === 'number'),
)

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`)
process.exit(failed.length === 0 ? 0 : 1)
