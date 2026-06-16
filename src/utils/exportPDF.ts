import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { AnalysisResult, IndividualReport } from '../data/mockAnalysisResult'

/** 서비스 이름 (추후 브랜딩 자리) */
const SERVICE_NAME = 'Harkness Analyzer'
/** 인쇄용 레이아웃 너비(px, ~A4 96dpi) */
const RENDER_WIDTH = 794

/** HTML 특수문자 이스케이프 */
function esc(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  )
}

/** 초 → "분:초" */
function mmss(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** YYYY-MM-DD */
function today(): string {
  const d = new Date()
  const p = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function fileName(label: string): string {
  return `하크니스리포트_${label}_${today()}.pdf`
}

/** 별점 텍스트 (10점 → ★5) */
function stars(score: number): string {
  const filled = Math.round(score / 2)
  return '★'.repeat(filled) + '☆'.repeat(Math.max(0, 5 - filled))
}

function headerHTML(title: string): string {
  return `
  <div style="background:#4f46e5;color:#ffffff;padding:22px 24px;">
    <h1 style="margin:0;font-size:22px;font-weight:800;">하크니스 토론 분석 리포트</h1>
    <p style="margin:8px 0 0;font-size:13px;opacity:.92;">${today()} · ${esc(title || '제목 없는 토론')}</p>
  </div>`
}

function footerHTML(): string {
  return `
  <div style="border-top:1px solid #e2e8f0;padding:14px 24px;color:#94a3b8;font-size:12px;text-align:center;">
    ${SERVICE_NAME} · AI 토론 분석 서비스
  </div>`
}

function badgeListHTML(items: string[], bg: string, color: string): string {
  return `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">${items
    .map(
      (s) =>
        `<span style="background:${bg};color:${color};border-radius:999px;padding:4px 10px;font-size:12px;">${esc(s)}</span>`,
    )
    .join('')}</div>`
}

function quotesHTML(quotes: string[]): string {
  return quotes
    .map(
      (q) =>
        `<blockquote style="border-left:3px solid #a5b4fc;background:#eef2ff;margin:4px 0;padding:6px 10px;font-size:13px;font-style:italic;color:#334155;">“${esc(q)}”</blockquote>`,
    )
    .join('')
}

function studentSectionHTML(report: IndividualReport): string {
  const section = (label: string, body: string): string =>
    `<div style="margin-top:10px;"><p style="margin:0 0 2px;font-size:12px;font-weight:600;color:#64748b;">${label}</p>${body}</div>`

  return `
  <div style="padding:16px 24px;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <h2 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">${esc(report.studentName)}</h2>
      <div style="font-size:15px;color:#f59e0b;">${stars(report.participationScore)} <span style="color:#94a3b8;font-size:12px;">${report.participationScore}/10</span></div>
    </div>
    <p style="margin:6px 0 0;font-size:13px;color:#475569;">총 발언 ${report.totalSpeeches}회 · 발언 시간 ${mmss(report.totalDurationSeconds)}</p>
    ${report.keyQuotes?.length ? section('대표 발언', quotesHTML(report.keyQuotes)) : ''}
    ${report.strengths?.length ? section('잘한 점', badgeListHTML(report.strengths, '#dcfce7', '#15803d')) : ''}
    ${report.improvements?.length ? section('성장 포인트', badgeListHTML(report.improvements, '#ffedd5', '#c2410c')) : ''}
  </div>`
}

function wrap(inner: string): string {
  return `<div style="font-family:'Pretendard','Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif;color:#1e293b;background:#ffffff;">${inner}</div>`
}

/** 오프스크린 HTML을 캡처해 A4 PDF로 저장한다 (내용이 길면 여러 페이지). */
async function renderToPdf(innerHTML: string, outFileName: string): Promise<void> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.width = `${RENDER_WIDTH}px`
  container.style.background = '#ffffff'
  container.innerHTML = innerHTML
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' })
    // JPEG로 압축해 파일 용량을 줄인다 (흰 배경이라 품질 손실 미미)
    const imgData = canvas.toDataURL('image/jpeg', 0.9)

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pageW) / canvas.width

    let heightLeft = imgH
    let position = 0
    pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH)
    heightLeft -= pageH

    while (heightLeft > 0) {
      position -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH)
      heightLeft -= pageH
    }

    pdf.save(outFileName)
  } finally {
    document.body.removeChild(container)
  }
}

/**
 * 학생 한 명의 개인 리포트를 PDF로 저장한다.
 * (헤더/푸터·날짜·주제를 포함한 인쇄용 레이아웃으로 구성해 캡처)
 */
export async function exportToPDF(
  studentName: string,
  reportData: IndividualReport,
  sessionTitle = '',
): Promise<void> {
  const html = wrap(headerHTML(sessionTitle) + studentSectionHTML(reportData) + footerHTML())
  await renderToPdf(html, fileName(studentName))
}

/** 전체 분석 결과를 A4 PDF로 저장한다. */
export async function exportFullReportToPDF(
  result: AnalysisResult,
  sessionTitle = '',
): Promise<void> {
  const flow = result.discussionFlowAnalysis
  const overallHTML = `
    <div style="padding:16px 24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#64748b;">AI 종합 분석</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#1e293b;">${esc(result.overallAnalysis)}</p>
      <div style="margin-top:10px;font-size:13px;color:#475569;">
        <span>발언 분포: <b>${esc(flow.turnTakingQuality || '-')}</b></span> ·
        <span>주도적 발언자: <b>${esc(flow.dominantSpeaker ?? '없음')}</b></span> ·
        <span>소외 학생: <b>${flow.isolatedStudents.length ? esc(flow.isolatedStudents.join(', ')) : '없음'}</b></span>
      </div>
      ${
        flow.suggestedNextTopics.length
          ? `<div style="margin-top:8px;font-size:13px;color:#475569;"><b>다음 토론 추천 주제</b><ol style="margin:4px 0 0;padding-left:18px;">${flow.suggestedNextTopics
              .map((t) => `<li>${esc(t)}</li>`)
              .join('')}</ol></div>`
          : ''
      }
    </div>`

  const studentsHTML = result.individualReports
    .map(studentSectionHTML)
    .join('<div style="border-top:1px solid #e2e8f0;"></div>')

  const html = wrap(headerHTML(sessionTitle) + overallHTML + studentsHTML + footerHTML())
  await renderToPdf(html, fileName('전체'))
}
