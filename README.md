<div align="center">

<img src="public/logo.png" alt="Aletheia" width="420" />

**과정을 읽는 논리 검증 서비스**

문장 뒤에 가려진 논증 구조를 걷어내어, 사용자가 스스로 논리를 검토하게 합니다.

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=flat-square)](https://aletheia-mvp-2026.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Status](https://img.shields.io/badge/Status-MVP_(mock)-orange?style=flat-square)](#-로드맵)

[라이브 데모](https://aletheia-mvp-2026.vercel.app) · [빠른 시작](#-빠른-시작) · [AI 파이프라인](#-ai-파이프라인) · [API 계약](#-api-계약) · [로드맵](#-로드맵) · [기여](#-기여)

</div>

---

## 📖 개요

**Aletheia**는 글의 논증 구조를 Knowledge Graph로 시각화하고, 논리 오류를 판단 근거와 함께 제시하는 검증 도구입니다. 사용자는 그래프의 노드 단위로 논리를 반박하거나 직접 수정할 수 있습니다.

이름은 고대 그리스어 **ἀλήθεια**에서 왔습니다. 부정 접두사 `ἀ`와 "가려짐, 망각"을 뜻하는 `λήθη`의 결합으로 "가려져 있지 않음"을 의미합니다. 그리스인들에게 진리란 새로 만들어내는 것이 아니라 덮여 있던 것을 걷어내는 일이었고, 이는 이 서비스가 하는 일과 정확히 같습니다.

> 현재 상태: AI 모델 연동 전 단계입니다. 배포된 데모는 목업 데이터로 전체 흐름을 시연합니다.

### 왜 만드는가

AI가 매끄러운 결론을 쏟아내는 시대에, 정작 그 결론이 어떤 근거 위에 서 있는지는 문장 뒤에 가려져 있습니다. 그런데 문헌 조사에서 확인한 두 가지 사실이 이 프로젝트의 방향을 결정했습니다.

- 최신 LLM조차 논리 오류 추론 정확도가 약 62%에 그칩니다 (인간은 90% 이상). 판정을 AI에 통째로 맡길 수 없습니다.
- 설명을 덧붙이는 것만으로는 AI 과의존이 줄지 않습니다. 사용자가 스스로 판단하도록 강제하는 인지적 개입이 있어야 합니다.

그래서 Aletheia는 "정확한 오류 탐지기"가 아니라 "사용자가 논리를 검토하게 만드는 도구"를 지향합니다.

### 핵심 특징

- **구조를 먼저, 판정은 나중에**: 결과 화면을 구조 분석과 논리 검증 2단계로 분리해, 오류 판정을 보기 전에 논증 구조를 먼저 읽게 합니다
- **판단 근거의 노출**: "오류입니다"가 아니라 "어떤 논리 메커니즘이 성립하지 않았는지"를 제시합니다
- **노드 단위 개입**: 그래프의 명제를 직접 수정하고 재검증할 수 있습니다. AI 판정에 동의하지 않을 자유가 보장됩니다
- **검증 가능한 설명**: 설명 생성에 생성 모델을 쓰지 않습니다. 설명이 또 다른 블랙박스가 되지 않도록 판정 결과를 템플릿에 결합합니다
- **접근성 우선**: 색상만으로 오류를 전달하지 않으며, 텍스트 대비 4.6 이상을 확보했습니다

---

## ✨ 화면 구성

| 탭 | 내용 |
|---|---|
| **홈** | 진입점. 로고와 서비스 한 줄 정의 |
| **소개** | 어원(ἀλήθεια)에서 출발하는 브랜드 서사와 세 가지 원칙 |
| **검증** | 입력 → 분석 → 결과(구조 분석 / 논리 검증 2단계) |
| **파이프라인** | AI 파이프라인 7단계와 각 단계의 실제 산출물 형태 |
| **보관함** | 저장한 분석 목록. 재열람 및 삭제 |

### 검증 화면의 2단계 분리

이 프로젝트에서 가장 중요한 설계 결정입니다.

| 단계 | 표시 | 표시하지 않는 것 |
|---|---|---|
| **1단계 구조 분석** | 명제 분해 목록, 중립 색상 그래프 | 오류 판정, 관계별 색상, 심각도 |
| **2단계 논리 검증** | 오류 카드, 색상 그래프, 판단 근거, 수정 기능 | 없음 |

판정을 첫 화면에 노출하면 사용자는 구조를 읽기 전에 결론부터 수용합니다. 구조를 먼저 보게 하고 판정을 한 단계 뒤로 미루는 것 자체가 인지적 개입 장치입니다.

---

## 🧠 AI 파이프라인

입력 텍스트가 그래프가 되기까지 7단계를 거칩니다. 각 단계의 산출물은 배포된 데모의 **파이프라인** 탭에서 확인할 수 있습니다.

| 단계 | 이름 | 모델 / 방법 | 상태 |
|---|---|---|---|
| ① | 문장 및 논증 단위 분할 | KSS / rule-based | 계획 |
| ② | 논증 요소 식별 | KLUE-RoBERTa-base 멀티태스크 | 계획 |
| ③ | 개체 및 개념 추출 | GLiNER medium-v2.1 | 선택 |
| ④ | 논증 관계 분류 | KLUE-NLI + 논리 메커니즘 4축 | 계획 |
| ⑤ | 논리 오류 탐지 | 규칙 기반 → 학습 기반 | 계획 |
| ⑥ | 근거 및 설명 생성 | 부족 전제 추론 + 템플릿 | 계획 |
| ⑦ | 그래프 표현 | API 응답 | **완료** |

### 관계 매핑

NLI 3분류를 서비스 관계 4종으로 변환합니다.

```
entailment    → support        (지지)
contradiction → contradiction  (모순)
neutral       → weak           (약한 지지)   confidence < 0.7
              → unsupported    (근거 부족)   confidence >= 0.7
```

### 논리 메커니즘 4축

관계 판정을 네 축으로 분해해 "왜 지지하지 못하는가"를 설명합니다. 관계 라벨이 붙은 학습 데이터 없이도 시작할 수 있다는 점이 핵심입니다.

| 메커니즘 | 판정 대상 |
|---|---|
| 사실 일관성 (factual consistency) | 모순 판정의 근거 |
| 감정 일관성 (sentiment coherence) | 지지 강도 |
| 인과 관계 (causal relation) | 논리적 비약 판정의 핵심 |
| 규범 관계 (normative relation) | 결론 도출의 정당성 |

### v0 탐지 대상 오류

| 오류 유형 | 탐지 규칙 |
|---|---|
| 논리적 비약 (Logical Leap) | `relation == unsupported AND 미성립 == 인과 AND Evidence → Claim` |
| 성급한 일반화 (Hasty Generalization) | `relation == weak AND partial → universal` |
| 거짓 딜레마 (False Dilemma) | `pattern matches 'A 또는 B 둘 중 하나' AND relation != support` |

---

## 🔌 API 계약

`src/mocks/analysis.json`이 프론트엔드와 추론 서버 사이의 **계약 문서**입니다. 서버는 이 구조로 응답하면 됩니다.

### `POST /api/v1/analyze`

```json
{ "text": "분석할 텍스트" }
```

**응답**

```json
{
  "nodes": [
    { "id": "E1", "type": "Evidence", "label": "근거 1", "text": "..." }
  ],
  "edges": [
    { "from": "E1", "to": "C1", "relation": "unsupported",
      "confidence": 0.81, "failed_mechanism": "causal" }
  ],
  "fallacies": [
    { "id": "f1", "name": "논리적 비약", "severity": "high",
      "edge": "근거 1 → 주장", "nodeIds": ["E1", "C1"],
      "why": "...", "missing": "...", "fix": "..." }
  ],
  "meta": { "model_version": "nli-v0.1", "latency_ms": 940 }
}
```

**enum**

- `type`: `Claim` | `Evidence` | `Reasoning` | `Conclusion`
- `relation`: `support` | `weak` | `unsupported` | `contradiction`
- `severity`: `high` | `medium` | `low`

> **노드 좌표(x, y)는 서버가 보내지 않습니다.** 화면 배치는 표현의 문제이므로 프론트엔드의 `applyLayout()`이 계산합니다. 덕분에 모델 팀과 프론트 팀이 좌표 규격을 협의할 필요가 없습니다.

---

## 📁 프로젝트 구조

```
aletheia-mvp-2026/
├── docs/                          # 연동 가이드, 기술 문서
├── public/
│   └── logo.png                   #   브랜드 로고 (파비콘 겸용)
├── src/
│   ├── App.jsx                    #   탭 라우팅, 분석 상태 관리
│   ├── theme.js                   #   색상 토큰 (그래픽용 / 텍스트용 이원 체계)
│   ├── storage.js                 #   보관함 (localStorage + 메모리 폴백)
│   ├── components/
│   │   └── common.jsx             #     Nav, Footer, Graph(SVG)
│   ├── pages/
│   │   ├── Landing.jsx            #     홈, 소개
│   │   ├── Verify.jsx             #     입력, 로딩, 결과
│   │   ├── Pipeline.jsx           #     AI 파이프라인
│   │   └── Archive.jsx            #     보관함
│   ├── services/
│   │   └── api.js                 #   API 호출 + 목업 폴백 + 레이아웃 계산
│   └── mocks/
│       ├── analysis.json          #   ★ API 계약 픽스처
│       └── pipeline.js            #     파이프라인 단계별 산출물 목업
└── (예정) inference/               # FastAPI + 모델
```

### 색상 규칙

브랜드 원색 5종은 모두 흰 배경 대비가 본문 텍스트 기준(4.5:1)에 미달합니다. 그래서 `theme.js`에서 두 갈래로 나눠 씁니다.

| 용도 | 시안 | 주황 | 마젠타 | 녹색 | 적색 |
|---|---|---|---|---|---|
| 그래픽 (선, 도트, 칩 배경) | `#00b4e2` | `#fe6a03` | `#da3ab3` | `#08ce7d` | `#fe4338` |
| 대비율 | 2.43 | 2.89 | 4.01 | 2.07 | 3.46 |
| 텍스트 (대비 4.6 이상) | `#007e9e` | `#c35001` | `#cc26a4` | `#058450` | `#ea0e01` |

---

## 🗺️ 로드맵

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 프론트엔드 MVP, API 계약 | ✅ 완료 |
| 1 | FastAPI 골격 + 문장 분할 | 진행 예정 |
| 2 | 논증 요소 분류 + 적응적 사전학습 | 계획 |
| 3 | 관계 분류 + 논리 메커니즘 4축 | 계획 |
| 4 | 규칙 기반 오류 탐지 + 부족 전제 도출 | 계획 |
| 5 | 실서버 연동 및 배포 | 계획 |
| 6 | 시드 주석 구축, 도메인 외 평가 | 확장 |
| 7 | 학습 기반 오류 분류 (13종 이상) | 확장 |

### 알려진 제약

- **그래프 자동 레이아웃 미구현**: 현재 노드 좌표가 고정값입니다. 노드 수가 가변이 되면 dagre 도입이 필요합니다
- **학습 데이터 부재**: 논증 요소, 관계, 오류 세 층위를 동시에 주석한 한국어 자원이 없습니다. 이 프로젝트의 최대 리스크입니다
- **사용자 검증 미실시**: 2단계 분리 설계가 실제로 검토 행동을 유도하는지는 문헌 근거에 기반한 가설이며, A/B 실험이 후속 과제입니다

---

## 🤝 기여

### 브랜치 전략

```
main     ← 항상 배포 가능한 상태. Vercel 자동 배포
dev      ← 작업 통합 브랜치
feature/*  ← 기능별 작업 브랜치
```

1. `dev`에서 `feature/작업명` 브랜치 생성
2. 작업 후 커밋, push
3. `dev`로 Pull Request
4. 상호 확인 후 merge
5. `dev`가 안정되면 `main`으로 merge

### 규칙

- `src/mocks/analysis.json`을 수정하는 PR은 **반드시 상대방 확인 후 merge**합니다. 이 파일이 프론트엔드와 모델 사이의 계약이기 때문입니다
- 커밋 메시지는 `feat:`, `fix:`, `docs:`, `chore:` 접두어를 사용합니다

---

## 👥 팀

**Aletheia** · 이화여자대학교 인공지능대학 AI Innovation Challenge 2026

| 역할 | 담당 |
|---|---|
| 팀장 & 웹 개발 | 백재은 |
| AI 모델 | 주태인 |

---

## 📚 주요 참고문헌

설계 판단의 근거가 된 문헌입니다. 전체 목록은 결과보고서를 참고하세요.

- Jo, Y., Bang, S., Reed, C., & Hovy, E. (2021). Classifying Argumentative Relations Using Logical Mechanisms and Argumentation Schemes. *TACL*, 9. (논리 메커니즘 4축 분해의 근거)
- Buçinca, Z., Malaya, M. B., & Gajos, K. Z. (2021). To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI. *CSCW*. (검증 화면 2단계 분리의 근거)
- Stab, C., & Gurevych, I. (2017). Parsing Argumentation Structures in Persuasive Essays. *Computational Linguistics*, 43(3). (요소 식별 아키텍처의 기준점)
- Feger, M., Boland, K., & Dietze, S. (2025). Limited Generalizability in Argument Mining. *ACL*. (도메인 외 평가 도입의 근거)
- Park, S., et al. (2021). KLUE: Korean Language Understanding Evaluation. *NeurIPS D&B*. (한국어 백본)
- Zhai, Z., et al. (2025). RuozhiBench: Evaluating LLMs with Logical Fallacies and Misleading Premises. (LLM 성능 상한)

---

## 📄 라이선스

미정. 대회 종료 후 결정할 예정입니다.
