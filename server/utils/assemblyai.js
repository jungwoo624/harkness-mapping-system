const fs = require('fs');
const axios = require('axios');

const BASE_URL = 'https://api.assemblyai.com/v2';
/** 변환 완료까지 폴링 간격(ms) */
const POLL_INTERVAL_MS = 3000;

/** API 키가 설정된 axios 인스턴스를 생성한다. */
function createClient() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    throw new Error('ASSEMBLYAI_API_KEY 가 설정되지 않았습니다. server/.env 를 확인하세요.');
  }
  return axios.create({
    baseURL: BASE_URL,
    headers: { authorization: apiKey },
  });
}

/** 오디오 파일을 AssemblyAI에 업로드하고 업로드 URL을 반환한다. */
async function uploadAudio(client, filePath) {
  const stream = fs.createReadStream(filePath);
  const { data } = await client.post('/upload', stream, {
    headers: { 'content-type': 'application/octet-stream' },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return data.upload_url;
}

/**
 * 오디오 파일을 전사(transcribe)한다.
 * 화자 분리(speaker_labels)를 활성화해 누가 말했는지도 함께 받는다.
 * @param {string} filePath 오디오 파일 경로
 * @returns {Promise<{ text: string, utterances: any[] }>}
 */
async function transcribeAudio(filePath) {
  const client = createClient();

  const audioUrl = await uploadAudio(client, filePath);

  const { data: created } = await client.post('/transcript', {
    audio_url: audioUrl,
    speaker_labels: true,
    language_code: 'ko',
  });

  const transcriptId = created.id;

  // 변환이 끝날 때까지 폴링
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const { data } = await client.get(`/transcript/${transcriptId}`);

    if (data.status === 'completed') {
      return { text: data.text || '', utterances: data.utterances || [] };
    }
    if (data.status === 'error') {
      throw new Error(`AssemblyAI 변환 실패: ${data.error}`);
    }
    // 'queued' | 'processing' → 계속 대기
  }
}

module.exports = { transcribeAudio };
