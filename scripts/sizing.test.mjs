// 발언 횟수에 따른 좌석 크기/색 변화 검증 (Playwright 헤드리스)
import { chromium } from 'playwright'

const URL = 'http://localhost:5173/'
const SEAT_IDS = ['s1', 's2', 's3', 's4', 's5', 's6']
const CLICKS = 40

const COLOR_NONE = '#e5e7eb'
const COLOR_LOW = '#bfdbfe'
const COLOR_MID = '#60a5fa'
const COLOR_HIGH = '#2563eb'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

/** 반지름으로부터 기대 색상(반지름↔색 매핑 일관성 검증용). */
function expectedFillFromRadius(r) {
  if (r >= 50) return COLOR_HIGH // count>=7 → 6회 이상 구간
  const count = (r - 30) / 3
  if (count >= 6) return COLOR_HIGH
  if (count >= 3) return COLOR_MID
  if (count >= 1) return COLOR_LOW
  return COLOR_NONE
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(URL, { waitUntil: 'networkidle' })

const readSeat = async (id) => {
  const circle = page.locator(`[data-testid="seat-${id}"] circle`)
  const text = page.locator(`[data-testid="seat-${id}"] text`)
  return {
    r: Number(await circle.getAttribute('r')),
    fill: await circle.getAttribute('fill'),
    textFill: await text.getAttribute('fill'),
  }
}

// 초기: 모두 반지름 30, 회색
const initial = await Promise.all(SEAT_IDS.map(readSeat))
check('초기 모든 좌석 r=30', initial.every((s) => s.r === 30))
check('초기 모든 좌석 회색', initial.every((s) => s.fill === COLOR_NONE))

// 테스트 버튼 40회 클릭
const button = page.getByTestId('add-random-speech')
for (let i = 0; i < CLICKS; i++) await button.click()

check(
  `버튼 ${CLICKS}회 → 기록 ${CLICKS}건`,
  (await page.getByTestId('record-count').innerText()) === `총 발언 기록: ${CLICKS}건`,
)

const seats = await Promise.all(SEAT_IDS.map(readSeat))
const validRadii = new Set([30, 33, 36, 39, 42, 45, 48, 50])

check('모든 반지름이 유효 값(30..50, 3단위/캡)', seats.every((s) => validRadii.has(s.r)))
check('반지름 50 초과 없음', seats.every((s) => s.r <= 50))
check('크기 변화 발생(최소 1개 r>30)', seats.some((s) => s.r > 30))
check('색 변화 발생(최소 1개 비회색)', seats.some((s) => s.fill !== COLOR_NONE))
check(
  '반지름↔색 매핑 일관',
  seats.every((s) => s.fill === expectedFillFromRadius(s.r)),
  seats.map((s) => `r${s.r}:${s.fill}`).join(' '),
)

// 진한 파랑(6회+) 좌석이 있으면 이름표는 흰색이어야 한다 (조건부)
const darkSeats = seats.filter((s) => s.fill === COLOR_HIGH)
if (darkSeats.length > 0) {
  check('진한 좌석 이름표 흰색', darkSeats.every((s) => s.textFill === '#ffffff'),
    `dark=${darkSeats.length}`)
} else {
  console.log('ℹ️ 이번 랜덤 시도에선 6회+ 좌석 없음 (흰색 라벨 검증 건너뜀)')
}

console.log('\n좌석 분포:', seats.map((s, i) => `${SEAT_IDS[i]}=r${s.r}`).join(' '))

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`결과: ${results.length - failed.length}/${results.length} 통과`)
process.exit(failed.length === 0 ? 0 : 1)
