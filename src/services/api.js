import fixture from "../mocks/analysis.json";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) || "";

/* 서버 응답에는 노드 좌표가 없습니다. 화면 배치는 프론트가 계산합니다.
 * 노드 수가 가변이 되면 dagre 같은 자동 레이아웃으로 교체하세요. */
const LAYOUT = {
  E1: { x: 160, y: 120 },
  E2: { x: 160, y: 360 },
  C1: { x: 460, y: 240 },
  CC: { x: 760, y: 240 },
};

export function applyLayout(nodes) {
  const cols = { Evidence: 160, Claim: 460, Reasoning: 610, Conclusion: 760 };
  let seen = {};
  return nodes.map((n) => {
    if (LAYOUT[n.id]) return { ...n, ...LAYOUT[n.id] };
    const x = cols[n.type] ?? 460;
    seen[n.type] = (seen[n.type] || 0) + 1;
    return { ...n, x, y: 120 + (seen[n.type] - 1) * 160 };
  });
}

function mockAnalyze() {
  const data = JSON.parse(JSON.stringify(fixture));
  data.nodes = applyLayout(data.nodes);
  return new Promise((resolve) => setTimeout(() => resolve(data), 300));
}

/* 모델 서버가 준비되면 .env에 VITE_API_BASE만 지정하면 실서버로 전환됩니다.
 * 서버 오류 시에는 목업으로 폴백해 시연이 끊기지 않게 합니다. */
export async function analyzeText(text) {
  if (!API_BASE) return mockAnalyze();
  try {
    const res = await fetch(`${API_BASE}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`분석 실패: ${res.status}`);
    const data = await res.json();
    data.nodes = applyLayout(data.nodes);
    return data;
  } catch (err) {
    console.warn("추론 서버 응답 실패, 목업으로 대체합니다.", err);
    return mockAnalyze();
  }
}

export { fixture };
