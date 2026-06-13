// HarknessTable 클릭 상호작용 검증 (Playwright 헤드리스)
import { chromium } from 'playwright'

const URL = 'http://localhost:5173/'
const YELLOW = '#facc15'
const BLUE = '#60a5fa'
const ARROW = '#93c5fd'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(URL, { waitUntil: 'networkidle' })

const status = () => page.getByTestId('status-text').innerText()
const count = () => page.getByTestId('record-count').innerText()
const seatStroke = (id) =>
  page.locator(`[data-testid="seat-${id}"] circle`).getAttribute('stroke')
const seatStrokeW = (id) =>
  page.locator(`[data-testid="seat-${id}"] circle`).getAttribute('stroke-width')
const arrowCount = () => page.locator(`path[stroke="${ARROW}"]`).count()
const arrowDs = () =>
  page.locator(`path[stroke="${ARROW}"]`).evaluateAll((els) =>
    els.map((e) => e.getAttribute('d')),
  )

// 초기 상태
check('초기 상태 텍스트', (await status()) === '발언자를 클릭하세요.', await status())
check('초기 발언자 강조 없음(파랑)', (await seatStroke('s1')) === BLUE)
check('초기 화살표 0개', (await arrowCount()) === 0)

// 학생A 클릭 → 발언자 선택 + 노란 강조
await page.getByTestId('seat-s1').click()
check('A 선택 후 상태 텍스트', (await status()).startsWith('학생A님이 발언 중'), await status())
check('A 테두리 노란색', (await seatStroke('s1')) === YELLOW)
check('A 테두리 두께 3', (await seatStrokeW('s1')) === '3')

// 같은 학생(A) 재클릭 → 토글 해제
await page.getByTestId('seat-s1').click()
check('A 재클릭 → 선택 해제', (await status()) === '발언자를 클릭하세요.', await status())
check('A 테두리 파랑 복귀', (await seatStroke('s1')) === BLUE)

// A → B 발언 기록 생성
await page.getByTestId('seat-s1').click()
await page.getByTestId('seat-s2').click()
check('A→B 후 화살표 1개', (await arrowCount()) === 1)
check('A→B 후 기록 1건', (await count()) === '총 발언 기록: 1건', await count())
check('기록 후 선택 해제', (await status()) === '발언자를 클릭하세요.')

// A → B 두 번 더 (같은 쌍) → 곡선으로 구분되는지
await page.getByTestId('seat-s1').click()
await page.getByTestId('seat-s2').click()
await page.getByTestId('seat-s1').click()
await page.getByTestId('seat-s2').click()
const ds = await arrowDs()
check('A→B 3회 후 화살표 3개', ds.length === 3, `${ds.length}개`)
check('3개 경로가 모두 다름(곡선 구분)', new Set(ds).size === 3, `unique=${new Set(ds).size}`)
check('직선 1개 + 곡선 2개', ds.filter((d) => d.includes('Q')).length === 2)

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`)
process.exit(failed.length === 0 ? 0 : 1)
