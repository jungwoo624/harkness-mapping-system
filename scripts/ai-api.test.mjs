// 실제 Claude API 호출 경로 검증 (네트워크 모킹)
// dev 서버에 더미 키가 설정된 상태에서 실행한다.
import { chromium } from 'playwright'

const URL = 'http://localhost:5173/'
const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MOCK_TEXT = '[MOCK] 학생들이 서로 잘 경청한 좋은 토론이었습니다.'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function runSession(page) {
  await page.evaluate(() => localStorage.removeItem('harkness_sessions'))
  await page.getByTestId('topic-input').fill('API 검증')
  await page.getByTestId('count-select').selectOption('5')
  await page.getByTestId('start-session').click()
  const speak = async (a, b) => {
    await page.getByTestId(`seat-${a}`).click()
    await page.getByTestId(`seat-${b}`).click()
  }
  await speak('s1', 's2')
  await speak('s1', 's3')
  await speak('s2', 's1')
  await page.getByTestId('end-session').click()
}

const browser = await chromium.launch()

// ── 케이스 1: API 성공 → 응답 텍스트 표시 + 요청 형식 검증 ──
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  let captured = null
  await page.route(ENDPOINT, async (route) => {
    captured = route.request()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'msg_mock',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: MOCK_TEXT }],
      }),
    })
  })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await runSession(page)
  await page.getByTestId('ai-comment-text').waitFor({ state: 'visible', timeout: 8000 })

  check('성공: API 응답 텍스트 표시', (await page.getByTestId('ai-comment-text').innerText()) === MOCK_TEXT)

  check('요청: POST 발생', captured !== null && captured.method() === 'POST')
  if (captured) {
    const headers = captured.headers()
    const body = captured.postDataJSON()
    check('요청 헤더: dangerous-direct-browser-access', headers['anthropic-dangerous-direct-browser-access'] === 'true')
    check('요청 헤더: x-api-key 존재', typeof headers['x-api-key'] === 'string' && headers['x-api-key'].length > 0)
    check('요청 헤더: anthropic-version', headers['anthropic-version'] === '2023-06-01')
    check('본문: model claude-sonnet-4-6', body.model === 'claude-sonnet-4-6')
    check('본문: max_tokens 500', body.max_tokens === 500)
    check('본문: system 프롬프트', typeof body.system === 'string' && body.system.includes('교육 전문가'))
    const userMsg = body.messages?.[0]?.content ?? ''
    check('본문: user 메시지에 통계 JSON 포함', userMsg.includes('totalSpeechCount') && userMsg.includes('participation'))
  }
  await ctx.close()
}

// ── 케이스 2: API 실패(401) → 규칙 기반 fallback ──
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.route(ENDPOINT, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ type: 'error', error: { type: 'authentication_error' } }),
    })
  })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await runSession(page)
  await page.getByTestId('ai-comment-text').waitFor({ state: 'visible', timeout: 8000 })
  const text = await page.getByTestId('ai-comment-text').innerText()
  check('실패 시 fallback 표시(규칙 기반)', text.includes('토론이었습니다'))
  check('실패 시 MOCK 텍스트 아님', !text.includes('[MOCK]'))
  await ctx.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`)
process.exit(failed.length === 0 ? 0 : 1)
