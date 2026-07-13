# Aletheia AI 모델 API 연동 가이드

> 재은(프론트·백엔드) × 태인(AI 모델) 협업 기준
> 현재 상태: 프론트 목업 v8 완성(mock 데이터 동작), 모델 개발 중

---

## 0. 오늘 미팅에서 정하고 끝낼 것 (30분 안에)

이 네 가지만 합의되면 이후는 각자 병렬로 진행할 수 있다.

1. **API 응답 스키마 확정** (아래 1장 초안 기준으로 수정·확정)
2. **v0 오류 유형 범위**: 13개 전부가 아니라 시연용 3~5개(논리적 비약, 성급한 일반화, 거짓 딜레마 등)로 시작할지
3. **모델 서버 배포 위치**: Hugging Face Spaces(무료 CPU) 1순위 합의 여부
4. **일정**: 태인의 모델 v0(정확도보다 "스키마대로 응답이 나오는 것"이 기준) 완성 목표일

미팅 팁: 웹사이트를 먼저 시연하고, "이 화면이 받아야 하는 데이터가 이것"이라며 스키마를 보여주면 논의가 빨라진다. 프론트가 이미 있으니 스키마가 곧 요구사항 문서다.

---

## Step 1. API 계약 확정 (오늘, 둘이 함께)

프론트 mock 데이터와 1:1로 대응하는 스키마. 태인은 이 JSON을 뱉는 것만 목표로 하면 된다.

### `POST /api/v1/analyze`

**Request**
```json
{ "text": "요즘 학생들의 AI 사용률이 크게 증가했다. ..." }
```

**Response 200**
```json
{
  "nodes": [
    { "id": "E1", "type": "Evidence",   "label": "근거 1", "text": "학생들의 AI 사용률이 크게 증가했다." },
    { "id": "C1", "type": "Claim",      "label": "주장",   "text": "AI 사용은 학생의 사고력을 저하시킨다." },
    { "id": "CC", "type": "Conclusion", "label": "결론",   "text": "AI를 전면 금지하거나 교육을 포기해야 한다." }
  ],
  "edges": [
    { "from": "E1", "to": "C1", "relation": "unsupported", "confidence": 0.87 }
  ],
  "fallacies": [
    {
      "id": "f1",
      "name": "논리적 비약",
      "severity": "high",
      "edge": "근거 1 → 주장",
      "nodeIds": ["E1", "C1"],
      "why": "NLI 분석 결과 두 문장의 관계가 neutral로 분류됐어요. ...",
      "fix": "사고력 변화를 직접 측정한 근거로 보강해 보세요."
    }
  ],
  "meta": { "model_version": "nli-v0.1", "latency_ms": 940 }
}
```

**합의할 enum**
- `type`: `Claim` | `Evidence` | `Reasoning` | `Conclusion`
- `relation`: `support` | `weak` | `unsupported` | `contradiction`
- `severity`: `high` | `medium` | `low`

**중요한 차이 하나**: 프론트 mock에는 노드에 `x, y` 좌표가 있지만, **서버는 좌표를 보내지 않는다.** 좌표는 화면 문제라 프론트가 계산한다(연동 시 재은이 자동 레이아웃 추가 예정). 태인은 신경 쓰지 않아도 됨.

**`why`, `fix` 문구는 누가 만드나**: v0에서는 오류 유형별 템플릿 문장을 서버에 하드코딩해도 충분하다. 모델은 유형 분류만 하고, 설명 문장은 규칙 기반으로 채우는 것이 빠르다.

---

## Step 2. 태인: 모델을 FastAPI로 감싸기

모델 성능과 무관하게 **스키마대로 응답하는 서버**를 먼저 만든다. 처음엔 내부가 규칙 기반이어도 된다.

```python
# inference/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Aletheia Inference API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://aletheia.vercel.app"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

@app.post("/api/v1/analyze")
def analyze(req: AnalyzeRequest):
    sentences = split_sentences(req.text)        # 1) 문장 분리
    nodes = classify_roles(sentences)            # 2) Claim/Evidence/Conclusion 분류
    edges = infer_relations(nodes)               # 3) 문장 쌍 NLI
    fallacies = map_fallacies(edges)             # 4) 관계 -> 오류 유형 매핑
    return {"nodes": nodes, "edges": edges, "fallacies": fallacies,
            "meta": {"model_version": "nli-v0.1"}}
```

실행: `uvicorn main:app --reload --port 8000`
확인: 브라우저에서 `http://localhost:8000/docs` (Swagger 자동 생성, 여기서 바로 테스트 가능)

**개발 순서 권장**
1. 4개 함수 전부 하드코딩(mock 반환) → 서버부터 살린다
2. `split_sentences`: kss 같은 한국어 문장 분리기
3. `infer_relations`: NLI 모델 연결 (klue/roberta 계열 fine-tuning)
4. `classify_roles`, `map_fallacies`: 규칙 기반 → 점진적으로 모델화

---

## Step 3. 로컬 연결 테스트 (같이 앉아서 30분)

1. 태인: `uvicorn main:app --port 8000` 실행
2. 재은: 프론트 API 레이어의 `API_BASE`를 `http://localhost:8000`으로 지정
3. 예시 문단 입력 → 실제 서버 응답으로 그래프가 그려지는지 확인
4. 실패 케이스 확인: 빈 텍스트, 아주 긴 텍스트, 오류가 하나도 없는 글

프론트 쪽 연동 코드는 함수 하나만 바꾸면 되도록 준비돼 있다:

```js
// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function analyzeText(text) {
  if (!API_BASE) return mockAnalyze(text);   // 환경변수 없으면 mock 유지
  const res = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`분석 실패: ${res.status}`);
  return res.json();
}
```

---

## Step 4. 모델 서버 배포 (태인, 로컬 테스트 통과 후)

**Hugging Face Spaces (Docker) 권장 절차**
1. huggingface.co에서 New Space → SDK: Docker 선택
2. 리포에 `main.py`, `requirements.txt`, `Dockerfile` 푸시
3. 자동 빌드 후 `https://<계정>-aletheia.hf.space` URL 발급
4. `/docs` 접속해서 배포 확인

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
```

주의: HF Spaces 기본 포트는 7860. 무료 CPU 기준 klue/roberta-base급 NLI는 문장 쌍당 수백 ms라 시연에 충분하다. 48시간 미접속 시 슬립되므로 발표 직전에 한 번 깨워둘 것.

---

## Step 5. 프론트 연동 및 전체 배포 (재은)

1. 목업을 Vite 프로젝트로 이식 (`npm create vite@latest aletheia -- --template react`)
2. Tailwind 설치, v8 컴포넌트 이관, 로고는 `/public/logo.png`로 분리
3. `mockAnalyze`를 별도 파일로 분리해 **fallback으로 유지** (시연 중 서버 다운 대비)
4. 노드 자동 레이아웃 추가: 노드 수가 가변이 되므로 dagre 또는 d3-hierarchy로 좌표 계산
5. GitHub 푸시 → Vercel Import → 환경변수 `VITE_API_BASE`에 HF Spaces URL 등록
6. Vercel 도메인을 태인 서버의 CORS `allow_origins`에 추가

---

## Step 6. 연동 완료 판정 체크리스트

- [ ] Swagger(`/docs`)에서 예시 문단 분석이 스키마대로 응답
- [ ] 프론트에서 실서버 응답으로 그래프·오류 카드 정상 렌더
- [ ] 오류 0건인 글에서 "모든 오류를 검토했어요" 상태 정상 표시
- [ ] 서버 응답 5초 초과 시 로딩 화면이 어색하지 않은지 확인 (필요 시 단계 문구 반복)
- [ ] 서버 다운 시 mock fallback 동작
- [ ] 저장 → 보관함 → 다시 열기가 실서버 데이터로도 동작

---

## 역할 분담 요약

| 단계 | 재은 | 태인 |
|---|---|---|
| 오늘 | 스키마 확정 주도, 사이트 시연 | 스키마 검토, 모델 v0 범위 확정 |
| 이번 주 | Vite 이식, 자동 레이아웃, api.js | FastAPI 골격 + mock 응답 서버 |
| 다음 | Vercel 배포, 연동 테스트 | NLI 모델 탑재, HF Spaces 배포 |
