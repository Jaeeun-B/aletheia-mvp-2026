# Aletheia Frontend (MVP, mock)

과정을 읽는 논리 검증 서비스 Aletheia의 프론트엔드입니다.
현재는 AI 모델 연동 전 단계로, mock 데이터로 전체 플로우를 시연합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:5173 에서 확인.

## Vercel 배포 (mock 시연용)

1. 이 폴더를 GitHub 리포로 푸시
2. vercel.com → Add New Project → 해당 리포 Import
3. Framework Preset: Vite (자동 감지), 설정 변경 없이 Deploy
4. 발급된 URL 공유

## 구조

- `src/App.jsx` : 전체 화면 (홈 / 소개 / 검증 / 보관함 탭)
- `src/mocks/analysis.json` : API 계약 픽스처 (inference 리포와 동일하게 유지)
- `public/logo.png` : 브랜드 로고

## 이후 실서버 연동

`src/App.jsx`의 mock 데이터 사용부를 `services/api.js`로 분리하고
`VITE_API_BASE` 환경변수로 추론 서버 URL을 주입할 예정입니다.
(자세한 절차는 aletheia-api-integration-guide.md 참고)

저장 기능은 현재 브라우저 localStorage를 사용합니다.
