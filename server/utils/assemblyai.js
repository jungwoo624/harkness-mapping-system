const fs = require('fs');
const axios = require('axios');

const BASE_URL = 'https://api.assemblyai.com/v2';
/** 폴링 간격(ms) */
const POLL_INTERVAL_MS = 2000;
/** 최대 대기 시간(ms) — 10분 */
const MAX_WAIT_MS = 10 * 60 * 1000;

/**
 * @typedef {Object} Utterance
 * @property {string} speaker     화자 레이블("A","B"...) 또는 매핑된 학생 이름
 * @property {string} text        발언 내용
 * @property {number} start       시작 시각(ms)
 * @property {number} end         종료 시각(ms)
 * @property {number} confidence  인식 정확도(0~1)
 */

/**
 * @typedef {Object} TranscriptResult
 * @property {Utterance[]} utterances
 * @property {string} fullTranscript  전체 텍스트
 * @property {number} speakerCount    감지된 화자 수
 */

/** API 키를 읽어 검증한다. */
function getApiKey() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    throw new Error('ASSEMBLYAI_API_KEY가 .env에 없습니다.');
  }
  return apiKey;
}

/** Step 1 — 오디오 파일을 업로드하고 upload_url을 반환한다. */
async function uploadAudio(apiKey, audioFilePath) {
  const stream = fs.createReadStream(audioFilePath);
  const { data } = await axios.post(`${BASE_URL}/upload`, stream, {
    headers: { authorization: apiKey, 'content-type': 'application/octet-stream' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return data.upload_url;
}

/** Step 2 — 전사를 요청하고 transcript id를 반환한다. */
async function requestTranscript(apiKey, audioUrl, studentNames, useKorean) {
  const body = {
    audio_url: audioUrl,
    speaker_labels: true,
    speakers_expected: studentNames.length || undefined,
    punctuate: true,
    format_text: true,
  };
  if (useKorean) {
    body.language_code = 'ko';
  }

  const { data } = await axios.post(`${BASE_URL}/transcript`, body, {
    headers: { authorization: apiKey, 'content-type': 'application/json' },
  });
  return data.id;
}

/** Step 3 — 완료될 때까지 폴링한다. */
async function pollTranscript(apiKey, transcriptId, jobId) {
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const { data } = await axios.get(`${BASE_URL}/transcript/${transcriptId}`, {
      headers: { authorization: apiKey },
    });

    if (data.status === 'completed') {
      return data;
    }
    if (data.status === 'error') {
      throw new Error(`AssemblyAI 전사 실패: ${data.error}`);
    }
    console.log(`[${jobId}] 전사 중... (status: ${data.status})`);
  }

  throw new Error(`[${jobId}] 전사 시간 초과(10분). 잠시 후 다시 시도하세요.`);
}

/** Step 4 — 응답을 TranscriptResult 형식으로 파싱한다. */
function parseResult(data) {
  const rawUtterances = Array.isArray(data.utterances) ? data.utterances : [];
  const utterances = rawUtterances.map((u) => ({
    speaker: u.speaker,
    text: u.text,
    start: u.start,
    end: u.end,
    confidence: u.confidence,
  }));

  const speakerCount = new Set(utterances.map((u) => u.speaker)).size;

  return {
    utterances,
    fullTranscript: data.text || '',
    speakerCount,
  };
}

/**
 * 화자 레이블("A","B"...)을 실제 학생 이름으로 매핑한다.
 * A → studentNames[0], B → studentNames[1] 순서.
 * 이름이 없으면 "Speaker A" 형태로 둔다.
 * @param {Utterance[]} utterances
 * @param {string[]} studentNames
 * @returns {Utterance[]} 매핑된 새 배열
 */
function mapSpeakerNames(utterances, studentNames) {
  return utterances.map((u) => {
    const index = (u.speaker || '').charCodeAt(0) - 'A'.charCodeAt(0);
    const name =
      index >= 0 && index < studentNames.length && studentNames[index]?.trim()
        ? studentNames[index].trim()
        : `Speaker ${u.speaker}`;
    return { ...u, speaker: name };
  });
}

/** 전사 1회 시도(업로드 URL 재사용). */
async function runTranscription(apiKey, audioUrl, studentNames, jobId, useKorean) {
  const transcriptId = await requestTranscript(apiKey, audioUrl, studentNames, useKorean);
  const data = await pollTranscript(apiKey, transcriptId, jobId);
  return data;
}

/**
 * 오디오 파일을 화자 분리와 함께 전사한다.
 * 한국어(language_code: ko)로 먼저 시도하고, 실패하면 언어 설정 없이 재시도한다.
 *
 * @param {string} audioFilePath 전사할 오디오 파일 경로
 * @param {string[]} studentNames 화자 매핑에 쓸 학생 이름 목록
 * @param {string} jobId 로그 식별용 jobId
 * @returns {Promise<TranscriptResult>}
 */
async function transcribeWithDiarization(audioFilePath, studentNames, jobId) {
  const apiKey = getApiKey();
  const names = Array.isArray(studentNames) ? studentNames : [];

  console.log(`[${jobId}] AssemblyAI 업로드 시작...`);
  const audioUrl = await uploadAudio(apiKey, audioFilePath);

  let data;
  try {
    console.log(`[${jobId}] 전사 요청(한국어)...`);
    data = await runTranscription(apiKey, audioUrl, names, jobId, true);
  } catch (err) {
    // 한국어 인식 실패 시 language_code 제거하고 재시도
    console.warn(`[${jobId}] 한국어 전사 실패 — 언어 설정 없이 재시도합니다: ${err.message}`);
    data = await runTranscription(apiKey, audioUrl, names, jobId, false);
  }

  const result = parseResult(data);
  result.utterances = mapSpeakerNames(result.utterances, names);

  console.log(`[${jobId}] 전사 완료 — 화자 ${result.speakerCount}명, 발언 ${result.utterances.length}건`);
  return result;
}

module.exports = { transcribeWithDiarization, mapSpeakerNames };
