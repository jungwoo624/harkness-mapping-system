# Harkness Mapping

하크니스(Harkness) 토론에서 참가자들의 발언 흐름을 원형 테이블 위에 시각적으로 매핑하는 React 웹 앱입니다.

## 주요 기능

- 토론 세션 생성 및 목록 관리 (브라우저 localStorage에 저장)
- 참가자를 원형 테이블 둘레에 자동 배치
- 좌석 두 개를 차례로 클릭해 발언 흐름(화살표) 연결
- 참가자별 발언 횟수 집계

## 폴더 구조

```
harkness-mapping/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # 진입점 + 라우팅
    ├── App.jsx               # 레이아웃 셸
    ├── components/           # 재사용 UI 컴포넌트
    │   ├── Header.jsx
    │   ├── Seat.jsx
    │   └── DiscussionMap.jsx
    ├── pages/                # 라우트 단위 화면
    │   ├── HomePage.jsx
    │   └── MappingPage.jsx
    ├── utils/                # 순수 로직 / 헬퍼
    │   ├── geometry.js       # 좌석 좌표 계산
    │   └── storage.js        # 세션 영속화
    └── styles/               # 스타일시트
        ├── global.css
        └── discussionMap.css
```

## 시작하기

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (dist/ 생성)
npm run preview  # 빌드 결과 미리보기 (http://localhost:4173)
```

## Vercel 배포

이 프로젝트는 Vite SPA로, 저장소에 포함된 `vercel.json`이 프레임워크 프리셋,
빌드 명령(`npm run build`), 출력 디렉터리(`dist`), SPA 폴백 리라이트를
정의합니다. Vercel에서 GitHub 저장소를 Import 하면 별도 설정 없이 빌드됩니다.

### 환경 변수 설정 (Vercel 대시보드)

AI 코멘트를 실제 Claude API로 연동할 때 필요한 `VITE_ANTHROPIC_API_KEY`는
소스에 커밋하지 말고 Vercel 대시보드에서 설정합니다.

1. Vercel에서 해당 프로젝트로 이동
2. 상단 **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Environment Variables** 선택
4. **Key** 에 `VITE_ANTHROPIC_API_KEY`, **Value** 에 실제 키 입력
5. 적용 환경(**Production / Preview / Development**) 선택 후 **Save**
6. 이미 배포된 경우 **Deployments → 최신 배포 → Redeploy** 로 재배포해야
   변경된 환경 변수가 반영됩니다.

> ⚠ **보안 주의**: `VITE_` 접두사가 붙은 환경 변수는 빌드 시 클라이언트
> 번들에 그대로 포함되어 브라우저에 노출됩니다. Anthropic API 키처럼
> 민감한 값은 프런트엔드에 직접 두지 말고, Vercel 서버리스 함수(`/api`)
> 같은 백엔드 경유로 호출하는 것을 권장합니다. 로컬 개발용 값은
> `.env.example` 을 참고해 `.env` 파일에 넣어 사용하세요(`.env` 는 git 제외됨).
