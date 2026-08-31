/* AI 파이프라인 단계별 목업 산출물
 * 출처: 주태인 작성 "Aletheia AI Model" 문서
 * 모든 수치는 시연용이며, 실제 모델 연동 시 서버 응답으로 대체됩니다.
 */

export const SAMPLE_TEXT =
  "학생들의 AI 사용률이 크게 증가했다. 몇몇 학생은 과제를 전부 AI로 작성한다. AI 사용은 학생의 사고력을 저하시킨다. 따라서 AI를 전면 금지하거나 교육을 포기하거나 둘 중 하나를 선택해야 한다.";

export const SEGMENTS = [
  { id: "S1", text: "학생들의 AI 사용률이 크게 증가했다." },
  { id: "S2", text: "몇몇 학생은 과제를 전부 AI로 작성한다." },
  { id: "S3", text: "AI 사용은 학생의 사고력을 저하시킨다." },
  { id: "S4", text: "따라서 AI를 전면 금지하거나 교육을 포기하거나 둘 중 하나를 선택해야 한다." },
];

// 노드 id -> 원본 문장 id 매핑
export const NODE_SEG = { E1: "S1", E2: "S2", C1: "S3", CC: "S4" };

export const COMPONENT_CONF = { E1: 0.94, E2: 0.88, C1: 0.91, CC: 0.86 };

export const BIO_TOKENS = [
  { t: "학생들의", tag: "B-EVIDENCE" },
  { t: "AI", tag: "I-EVIDENCE" },
  { t: "사용률이", tag: "I-EVIDENCE" },
  { t: "크게", tag: "I-EVIDENCE" },
  { t: "증가했다", tag: "I-EVIDENCE" },
  { t: ".", tag: "O" },
  { t: "AI", tag: "B-CLAIM" },
  { t: "사용은", tag: "I-CLAIM" },
  { t: "학생의", tag: "I-CLAIM" },
  { t: "사고력을", tag: "I-CLAIM" },
  { t: "저하시킨다", tag: "I-CLAIM" },
  { t: ".", tag: "O" },
  { t: "따라서", tag: "O" },
  { t: "AI를", tag: "B-CONCLUSION" },
  { t: "전면", tag: "I-CONCLUSION" },
  { t: "금지하거나", tag: "I-CONCLUSION" },
];

export const ENTITIES = [
  { text: "AI", type: "technology / concept" },
  { text: "학생", type: "person-group" },
  { text: "사고력", type: "cognitive concept" },
  { text: "AI 사용", type: "action / practice" },
  { text: "과제", type: "artifact" },
];

// NLI 원본 판정과 Aletheia 관계 매핑
export const RELATIONS = [
  { from: "S1", to: "S3", nli: "neutral", conf: 0.81, rel: "unsupported", label: "근거 부족" },
  { from: "S2", to: "S3", nli: "neutral", conf: 0.63, rel: "weak", label: "약한 지지" },
  { from: "S3", to: "S4", nli: "contradiction", conf: 0.88, rel: "contradiction", label: "모순" },
];

export const MAPPING_RULE = `entailment    → support
contradiction → contradiction
neutral       → weak (conf < 0.7) | unsupported (conf >= 0.7)`;

export const STAGES = [
  {
    idx: "1",
    name: "문장 및 논증 단위 분할",
    en: "Segmentation",
    desc: "입력 텍스트를 의미 단위로 자릅니다.",
    model: "KSS / rule-based",
  },
  {
    idx: "2",
    name: "논증 요소 식별",
    en: "Component Identification",
    desc: "각 단위를 Claim / Evidence / Reasoning / Conclusion으로 분류합니다.",
    model: "klue/roberta-base",
  },
  {
    idx: "3",
    name: "개체 추출",
    en: "Entity Extraction",
    desc: "Knowledge Graph 확장을 위한 선택 단계입니다.",
    model: "GLiNER medium-v2.1",
    optional: true,
  },
  {
    idx: "4",
    name: "논증 관계 분류",
    en: "Relation Classification",
    desc: "요소 쌍의 추론 관계를 NLI로 판정하고 Aletheia 관계로 매핑합니다.",
    model: "KLUE-RoBERTa + KLUE-NLI",
  },
  {
    idx: "5",
    name: "논리 오류 탐지",
    en: "Fallacy Detection",
    desc: "관계와 그래프 위치를 입력으로 오류 유형을 분류합니다.",
    model: "Fallacy Classifier",
  },
  {
    idx: "6",
    name: "근거 및 설명 생성",
    en: "Explanation Generation",
    desc: "왜 오류인지, 어떤 전제가 부족한지, 어떻게 고칠지 제시합니다.",
    model: "Template + LLM",
  },
  {
    idx: "7",
    name: "그래프 표현",
    en: "Graph Representation",
    desc: "프론트엔드가 받는 최종 응답 형태입니다.",
    model: "API Response",
  },
];
