import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowRight, CheckCircle2, Pencil, RefreshCw, X,
  Bookmark, Trash2, ChevronRight, AlertCircle
} from "lucide-react";

/* ─────────────────────────────────────────────
   Aletheia MVP v2
   1) 분석(구조)과 검증(오류)을 별도 단계로 분리
   2) 분석 결과 저장(보관함) 지원: window.storage 사용, 실패 시 메모리 대체
   3) Knowledge Graph 가독성 개선: 노드 확대, 텍스트 줄바꿈, 폰트 통일
   4) 토스 톤: 단색 파랑, 흰 배경, 큰 타이포, 그라디언트 없음
   ───────────────────────────────────────────── */

const T = {
  blue: "#3182F6",
  blueDark: "#1B64DA",
  ink: "#191F28",
  sub: "#4E5968",
  faint: "#8B95A1",
  line: "#E5E8EB",
  bg: "#F9FAFB",
  fill: "#F2F4F6",
  red: "#F04452",
  orange: "#FF8A00",
  green: "#00A661",
};

const LOGO_SRC = "/logo.png";

const Wordmark = ({ height = 20 }) => (
  <img src={LOGO_SRC} alt="Aletheia" style={{ height, width: "auto", display: "block" }} />
);

const Footer = () => (
  <footer className="py-8 text-center text-[13px] border-t" style={{ color: T.faint, borderColor: T.line }}>
    Team Aletheia · 2026 AI Innovation Challenge
  </footer>
);

/* ── mock 데이터 (모델 완성 전 시뮬레이션) ── */
const SAMPLE_TEXT =
  "요즘 학생들의 AI 사용률이 크게 증가했다. 실제로 몇몇 학생은 과제를 전부 AI로 작성한다. 따라서 AI 사용은 학생의 사고력을 저하시킨다. 결국 우리는 AI를 전면 금지하거나, 교육을 포기하거나 둘 중 하나를 선택해야 한다.";

const MOCK_RESULT = {
  nodes: [
    { id: "E1", type: "Evidence", label: "근거 1", x: 160, y: 120, text: "학생들의 AI 사용률이 크게 증가했다." },
    { id: "E2", type: "Evidence", label: "근거 2", x: 160, y: 360, text: "몇몇 학생은 과제를 전부 AI로 작성한다." },
    { id: "C1", type: "Claim", label: "주장", x: 460, y: 240, text: "AI 사용은 학생의 사고력을 저하시킨다." },
    { id: "CC", type: "Conclusion", label: "결론", x: 760, y: 240, text: "AI를 전면 금지하거나 교육을 포기해야 한다." },
  ],
  edges: [
    { from: "E1", to: "C1", relation: "unsupported" },
    { from: "E2", to: "C1", relation: "weak" },
    { from: "C1", to: "CC", relation: "contradiction" },
  ],
  fallacies: [
    {
      id: "f1", name: "논리적 비약", severity: "high", edge: "근거 1 → 주장", nodeIds: ["E1", "C1"],
      why: "NLI 분석 결과 '사용률 증가'와 '사고력 저하' 사이의 추론 관계가 neutral(무관)로 분류됐어요. 사용량 데이터만으로는 인지 능력 변화의 인과를 뒷받침하기 어려워요.",
      fix: "사고력 변화를 직접 측정한 연구나 통계를 근거로 보강해 보세요.",
    },
    {
      id: "f2", name: "성급한 일반화", severity: "medium", edge: "근거 2 → 주장", nodeIds: ["E2", "C1"],
      why: "'몇몇 학생'이라는 제한된 표본에서 전체 학생에 대한 결론을 끌어내고 있어요. 표본의 크기와 대표성이 주장 범위에 비해 부족해요.",
      fix: "주장의 범위를 표본에 맞게 좁히거나 대표성 있는 데이터를 추가해 보세요.",
    },
    {
      id: "f3", name: "거짓 딜레마", severity: "high", edge: "주장 → 결론", nodeIds: ["C1", "CC"],
      why: "전면 금지와 교육 포기 외에도 부분 허용, 리터러시 교육, 가이드라인 같은 선택지가 있는데 양자택일로 결론을 강제하고 있어요.",
      fix: "제3의 대안을 검토 항목으로 추가해 결론의 전제를 다시 세워 보세요.",
    },
  ],
};

const REL = {
  support: { color: T.green, dash: "0", label: "지지" },
  weak: { color: T.orange, dash: "7 6", label: "약한 지지" },
  unsupported: { color: T.orange, dash: "7 6", label: "근거 부족" },
  contradiction: { color: T.red, dash: "0", label: "모순" },
};

const NODE = {
  Evidence: { chip: "#E8F3FF", chipText: T.blue },
  Claim: { chip: "#FFF3E0", chipText: "#D97706" },
  Reasoning: { chip: "#F3E8FF", chipText: "#9333EA" },
  Conclusion: { chip: "#E7F7EF", chipText: T.green },
};

/* ── 저장소: localStorage, 사용 불가 환경은 메모리 대체 ── */
const memStore = {};
const canUseLS = () => {
  try { const k = "__t"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; }
  catch (e) { return false; }
};

async function saveAnalysis(key, value) {
  const json = JSON.stringify(value);
  if (canUseLS()) { try { localStorage.setItem(key, json); return true; } catch (e) { /* fallthrough */ } }
  memStore[key] = json;
  return true;
}
async function listAnalyses() {
  let keys = Object.keys(memStore);
  if (canUseLS()) {
    keys = [...new Set([...keys, ...Object.keys(localStorage)])];
  }
  keys = keys.filter((k) => k.startsWith("aletheia-analyses:"));
  const items = [];
  for (const k of keys) {
    const raw = memStore[k] || (canUseLS() ? localStorage.getItem(k) : null);
    if (raw) { try { items.push({ key: k, ...JSON.parse(raw) }); } catch (e) { /* skip */ } }
  }
  return items.sort((a, b) => b.savedAt - a.savedAt);
}
async function deleteAnalysis(key) {
  delete memStore[key];
  if (canUseLS()) { try { localStorage.removeItem(key); } catch (e) { /* ok */ } }
}

/* ── 텍스트 줄바꿈(그래프용) ── */
function wrapText(text, per = 12, maxLines = 3) {
  const lines = [];
  for (let i = 0; i < text.length && lines.length < maxLines; i += per) {
    lines.push(text.slice(i, i + per));
  }
  if (text.length > per * maxLines) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, per - 1) + "…";
  }
  return lines;
}

/* ═════════ Knowledge Graph ═════════ */
function Graph({ data, mode, selected, onSelectNode, editedIds }) {
  const W = 200, H = 96;
  const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 920 480" className="w-full h-auto select-none">
      <defs>
        {Object.entries(REL).map(([k, s]) => (
          <marker key={k} id={`ar-${k}`} viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={mode === "verify" ? s.color : T.faint} />
          </marker>
        ))}
      </defs>

      {data.edges.map((e) => {
        const a = byId[e.from], b = byId[e.to];
        const s = REL[e.relation];
        const color = mode === "verify" ? s.color : T.faint;
        const x1 = a.x + W / 2, y1 = a.y, x2 = b.x - W / 2, y2 = b.y;
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const isSel = selected && selected.nodeIds.includes(e.from) && selected.nodeIds.includes(e.to);
        const dim = mode === "verify" && selected && !isSel;
        return (
          <g key={e.from + e.to} opacity={dim ? 0.25 : 1} style={{ transition: "opacity .2s" }}>
            <path d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              fill="none" stroke={color} strokeWidth={isSel ? 3 : 2}
              strokeDasharray={mode === "verify" ? s.dash : "0"}
              markerEnd={`url(#ar-${e.relation})`} />
            <rect x={mx - 32} y={my - 30} width="64" height="19" rx="9.5"
              fill="#fff" stroke={color} strokeWidth="1" opacity="0.95" />
            <text x={mx} y={my - 16.5} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
              {mode === "verify" ? s.label : "추론 관계"}
            </text>
          </g>
        );
      })}

      {data.nodes.map((n) => {
        const st = NODE[n.type];
        const isSel = selected && selected.nodeIds.includes(n.id);
        const dim = mode === "verify" && selected && !isSel;
        const lines = wrapText(n.text, 12, 3);
        return (
          <g key={n.id} transform={`translate(${n.x - W / 2}, ${n.y - H / 2})`}
            onClick={() => mode === "verify" && onSelectNode(n.id)}
            style={{ cursor: mode === "verify" ? "pointer" : "default" }}
            opacity={dim ? 0.3 : 1}>
            <rect width={W} height={H} rx="16" fill="#fff"
              stroke={isSel ? T.blue : T.line} strokeWidth={isSel ? 2.5 : 1.5} />
            <rect x="14" y="12" width={n.label.length * 13 + 22} height="24" rx="12" fill={st.chip} />
            <text x="25" y="29" fontSize="13" fontWeight="700" fill={st.chipText}>{n.label}</text>
            {editedIds.includes(n.id) && (
              <text x={n.label.length * 13 + 44} y="29" fontSize="12" fontWeight="600" fill={T.green}>수정됨</text>
            )}
            {lines.map((line, i) => (
              <text key={i} x="15" y={54 + i * 18} fontSize="13.5" fill={T.ink}>{line}</text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ═════════ 브랜드 인트로 ═════════ */
const PRINCIPLES = [
  ["드러내요", "문장 뒤에 가려진 주장과 근거의 구조를 그래프로 펼쳐서 보여줘요."],
  ["설명해요", "무엇이 오류인지 통보하는 대신, 왜 그렇게 판단했는지 이유까지 함께 제시해요."],
  ["맡겨요", "AI는 근거를 정리할 뿐이에요. 걷어낸 자리에서 무엇을 볼지는 사용자가 정해요."],
];

function Intro({ onStart }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <style>{`
        @keyframes aletheia-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .aletheia-marquee { animation: aletheia-marquee 30s linear infinite; width: max-content; }
        @media (prefers-reduced-motion: reduce) { .aletheia-marquee { animation: none; } }
      `}</style>

      {/* 소개 마르퀴 */}
      <div className="overflow-hidden border-b" style={{ borderColor: T.line, background: T.bg }}>
        <div className="aletheia-marquee whitespace-nowrap py-2.5 text-[13px] font-medium" style={{ color: T.faint }}>
          {[0, 1].map((k) => (
            <span key={k}>
              {Array.from({ length: 10 }).map((_, n) => (
                <span key={n} className="mx-7">Aletheia를 소개합니다</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6">
        {/* 어원 */}
        <section className="pt-24 pb-20 text-center">
          <div className="text-[12px] font-bold tracking-[0.25em]" style={{ color: T.blue }}>OUR NAME</div>
          <div className="mt-8" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <span className="text-6xl md:text-7xl tracking-tight" style={{ color: T.ink }}>ἀλήθεια</span>
          </div>
          <div className="mt-4 text-[15px]" style={{ color: T.faint }}>알레테이아 [aletheia]</div>

          <div className="mt-10 inline-flex items-center gap-3 text-[15px] font-semibold">
            <span className="rounded-xl px-4 py-2" style={{ background: "#E8F3FF", color: T.blue }}>ἀ 아니다</span>
            <span style={{ color: T.faint }}>+</span>
            <span className="rounded-xl px-4 py-2" style={{ background: T.fill, color: T.sub }}>λήθη 가려짐, 망각</span>
          </div>

          <p className="mt-10 text-[17px] leading-[1.8]" style={{ color: T.ink }}>
            고대 그리스어로 <b>'가려져 있지 않음'</b>이라는 뜻이에요.<br />
            그리스인들에게 진리란 새로 만들어내는 것이 아니라,<br className="hidden md:block" />
            덮여 있던 것을 걷어내는 일이었어요.
          </p>
        </section>

        {/* 이름에 담은 약속 */}
        <section className="py-16 border-t" style={{ borderColor: T.line }}>
          <h2 className="text-2xl font-extrabold" style={{ color: T.ink }}>이름에 담은 약속</h2>
          <p className="mt-5 text-[16px] leading-[1.9]" style={{ color: T.sub }}>
            AI가 매끄러운 결론을 쏟아내는 시대에, 정작 그 결론이 어떤 근거 위에 서 있는지는
            문장 뒤에 가려져 있어요. Aletheia는 이름 그대로 그 가려진 자리를 걷어내요.
            글을 주장과 근거의 구조로 펼치고, 어디에서 논리가 끊기는지 이유와 함께 드러내요.
            진리를 대신 선언하는 것이 아니라, 스스로 볼 수 있게 만드는 것. 그것이 이 이름을 고른 이유예요.
          </p>
        </section>

        {/* 세 가지 원칙 */}
        <section className="py-16 border-t" style={{ borderColor: T.line }}>
          <h2 className="text-2xl font-extrabold" style={{ color: T.ink }}>세 가지 원칙</h2>
          <div className="mt-7 space-y-6">
            {PRINCIPLES.map(([t, d]) => (
              <div key={t} className="flex gap-5">
                <span className="flex-none w-16 font-bold text-[16px]" style={{ color: T.blue }}>{t}</span>
                <p className="text-[15px] leading-relaxed" style={{ color: T.sub }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center border-t" style={{ borderColor: T.line }}>
          <img src={LOGO_SRC} alt="Aletheia" className="w-44 h-auto mx-auto" />
          <p className="mt-6 text-[16px]" style={{ color: T.sub }}>이제 가려진 논리를 직접 걷어내 보세요.</p>
          <button onClick={onStart}
            className="mt-8 inline-flex items-center gap-1.5 rounded-xl px-8 py-3.5 text-[16px] font-bold text-white transition-colors"
            style={{ background: T.blue }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.blueDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}>
            논리 검증 시작하기 <ArrowRight size={17} />
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ═════════ 홈 ═════════ */
function VerifyInput({ onAnalyze }) {
  const [text, setText] = useState("");
  const ready = text.trim().length >= 20;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-28">
        <h1 className="text-4xl md:text-[44px] font-extrabold leading-[1.25] tracking-tight" style={{ color: T.ink }}>
          결론보다 과정을<br />먼저 보여드려요
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed" style={{ color: T.sub }}>
          글 속의 주장과 근거를 그래프로 펼쳐서 어디에서 논리가 끊기는지 알려드려요.<br />
          마지막 판단은 언제나 사용자의 몫이에요.
        </p>

        <div className="mt-12 rounded-2xl border overflow-hidden" style={{ borderColor: T.line }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="리포트, 기사, AI가 만든 글을 붙여넣어 주세요. 20자 이상이면 분석할 수 있어요."
            className="w-full h-40 p-5 text-[15px] leading-relaxed resize-none outline-none"
            style={{ color: T.ink }}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: T.line, background: T.bg }}>
            <button onClick={() => setText(SAMPLE_TEXT)}
              className="text-sm font-semibold rounded-lg px-3 py-2 transition-colors hover:bg-white"
              style={{ color: T.blue }}>
              예시 문단으로 채우기
            </button>
            <button disabled={!ready} onClick={() => onAnalyze(text)}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[15px] font-bold text-white transition-colors"
              style={{ background: ready ? T.blue : "#C9D0DA", cursor: ready ? "pointer" : "not-allowed" }}
              onMouseEnter={(e) => { if (ready) e.currentTarget.style.background = T.blueDark; }}
              onMouseLeave={(e) => { if (ready) e.currentTarget.style.background = T.blue; }}>
              분석 시작하기 <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-lg font-bold mb-6" style={{ color: T.ink }}>이런 순서로 진행돼요</h2>
          <ol className="space-y-5">
            {[
              ["구조 분석", "문장을 주장, 근거, 결론 단위로 나누고 추론 관계를 그래프로 그려요."],
              ["논리 검증", "관계마다 오류를 찾아 이유와 함께 설명해 드려요. 동의하지 않으면 직접 고칠 수 있어요."],
              ["결과 저장", "검토를 마친 분석은 보관함에 저장해 두고 언제든 다시 열어볼 수 있어요."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold"
                  style={{ background: T.fill, color: T.sub }}>{i + 1}</span>
                <div>
                  <div className="font-bold text-[15px]" style={{ color: T.ink }}>{t}</div>
                  <div className="mt-0.5 text-[14px] leading-relaxed" style={{ color: T.sub }}>{d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const TABS = [
  ["home", "홈"],
  ["intro", "소개"],
  ["verify", "검증"],
  ["archive", "보관함"],
];

function GlobalNav({ section, onNavigate, savedCount }) {
  return (
    <nav className="flex items-center justify-between px-5 md:px-10 h-16 border-b bg-white sticky top-0 z-40"
      style={{ borderColor: T.line }}>
      <button onClick={() => onNavigate("home")} aria-label="홈으로">
        <Wordmark />
      </button>
      <div className="flex items-center gap-0.5 md:gap-1.5">
        {TABS.map(([id, label]) => {
          const active = section === id;
          return (
            <button key={id} onClick={() => onNavigate(id)}
              className="rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              style={{
                color: active ? T.blue : T.sub,
                background: active ? "#E8F3FF" : "transparent",
              }}>
              {label}{id === "archive" && savedCount > 0 ? ` ${savedCount}` : ""}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ═════════ 진입점 ═════════ */
function Landing({ onStart, onIntro }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <img src={LOGO_SRC} alt="Aletheia" className="h-auto w-full"
          style={{ maxWidth: "min(88%, 780px)" }} />
        <p className="mt-9 text-lg md:text-xl leading-relaxed" style={{ color: T.sub }}>
          과정을 읽는 논리 검증 서비스
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button onClick={onStart}
            className="inline-flex items-center gap-1.5 rounded-xl px-7 py-3.5 text-[16px] font-bold text-white transition-colors"
            style={{ background: T.blue }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.blueDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}>
            논리 검증 시작하기 <ArrowRight size={17} />
          </button>
          <button onClick={onIntro}
            className="rounded-xl px-7 py-3.5 text-[16px] font-bold transition-colors hover:bg-gray-100"
            style={{ background: T.fill, color: T.ink }}>
            Aletheia 이야기
          </button>
        </div>
      </main>
    </div>
  );
}

/* ═════════ 로딩 ═════════ */
const STEPS = ["문장을 명제 단위로 나누는 중", "문장 사이 추론 관계 분석 중", "논리 오류 후보 식별 중", "그래프 구성 중"];

function Loading({ onDone }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step < STEPS.length) {
      const t = setTimeout(() => setStep(step + 1), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(onDone, 400);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white">
      <div className="w-full max-w-sm px-8">
        <div className="text-lg font-bold mb-8 text-center" style={{ color: T.ink }}>글을 분석하고 있어요</div>
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3 text-[15px] transition-opacity duration-300"
              style={{ opacity: i <= step ? 1 : 0.3 }}>
              {i < step ? <CheckCircle2 size={18} style={{ color: T.green }} />
                : i === step ? <RefreshCw size={18} className="animate-spin" style={{ color: T.blue }} />
                : <span className="w-[18px] h-[18px] rounded-full border-2 inline-block" style={{ borderColor: T.line }} />}
              <span style={{ color: i <= step ? T.ink : T.faint, fontWeight: i === step ? 600 : 400 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═════════ 결과: 분석 / 검증 분리 ═════════ */
function Result({ text, analysis, initial, onReset, onSaved }) {
  const [tab, setTab] = useState("structure"); // structure | verify
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [editedIds, setEditedIds] = useState(initial.editedIds || []);
  const [resolved, setResolved] = useState(initial.resolved || []);
  const [nodes, setNodes] = useState(analysis.nodes);
  const [toast, setToast] = useState("");

  const data = { ...analysis, nodes };
  const openCount = data.fallacies.filter((f) => !resolved.includes(f.id)).length;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const selectNode = (id) => {
    const f = data.fallacies.find((x) => x.nodeIds.includes(id) && !resolved.includes(x.id))
      || data.fallacies.find((x) => x.nodeIds.includes(id));
    setSelected(f || null);
  };

  const startEdit = (id) => {
    const n = nodes.find((x) => x.id === id);
    setEditing(n); setDraft(n.text);
  };
  const saveEdit = () => {
    setNodes((prev) => prev.map((n) => (n.id === editing.id ? { ...n, text: draft } : n)));
    setEditedIds((p) => [...new Set([...p, editing.id])]);
    if (selected) setResolved((p) => [...new Set([...p, selected.id])]);
    setEditing(null); setSelected(null);
    showToast("수정을 반영했어요");
  };

  const handleSave = async () => {
    const key = `aletheia-analyses:${Date.now()}`;
    const editedNodes = {};
    nodes.forEach((n) => { if (editedIds.includes(n.id)) editedNodes[n.id] = n.text; });
    await saveAnalysis(key, {
      savedAt: Date.now(), text,
      resolved, editedIds, editedNodes,
      fallacyTotal: data.fallacies.length,
      fallacyOpen: openCount,
    });
    onSaved();
    showToast("보관함에 저장했어요");
  };

  const TabBtn = ({ id, num, label }) => (
    <button onClick={() => setTab(id)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-bold transition-colors"
      style={{ background: tab === id ? "#fff" : "transparent", color: tab === id ? T.ink : T.faint,
        boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
      <span className="w-5 h-5 rounded-full text-[12px] flex items-center justify-center font-bold"
        style={{ background: tab === id ? T.blue : T.line, color: tab === id ? "#fff" : T.faint }}>{num}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ background: T.bg }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {/* 단계 전환 */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex gap-1 p-1 rounded-2xl" style={{ background: T.fill }}>
            <TabBtn id="structure" num="1" label="구조 분석" />
            <TabBtn id="verify" num="2" label="논리 검증" />
          </div>
          <button onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ color: T.sub }}>
            <RefreshCw size={15} /> 새 분석
          </button>
        </div>

        {tab === "structure" && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: T.line }}>
              <h2 className="text-lg font-bold" style={{ color: T.ink }}>글을 4개의 명제로 나눴어요</h2>
              <p className="mt-1 text-sm" style={{ color: T.sub }}>각 명제의 역할과 문장 사이의 추론 관계예요. 오류 판단은 다음 단계에서 진행돼요.</p>
              <div className="mt-5 space-y-3">
                {nodes.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-xl p-3.5" style={{ background: T.bg }}>
                    <span className="flex-none rounded-lg px-2.5 py-1 text-[13px] font-bold"
                      style={{ background: NODE[n.type].chip, color: NODE[n.type].chipText }}>{n.label}</span>
                    <p className="text-[15px] leading-relaxed pt-0.5" style={{ color: T.ink }}>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: T.line }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: T.ink }}>논증 구조 그래프</h2>
              <Graph data={data} mode="structure" selected={null} onSelectNode={() => {}} editedIds={editedIds} />
            </div>

            <div className="flex justify-end">
              <button onClick={() => setTab("verify")}
                className="inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-[15px] font-bold text-white transition-colors"
                style={{ background: T.blue }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.blueDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}>
                논리 검증하기 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {tab === "verify" && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-white border p-6" style={{ borderColor: T.line }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: T.ink }}>
                    {openCount > 0 ? `논리 오류 ${openCount}건을 확인해 주세요` : "모든 오류를 검토했어요"}
                  </h2>
                  <p className="mt-0.5 text-sm" style={{ color: T.sub }}>노드나 아래 카드를 누르면 판단 근거를 볼 수 있어요.</p>
                </div>
                <div className="flex items-center gap-4 text-[13px] font-medium" style={{ color: T.sub }}>
                  <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: T.orange }} /> 비약, 근거 부족</span>
                  <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: T.red }} /> 모순</span>
                </div>
              </div>
              <Graph data={data} mode="verify" selected={selected} onSelectNode={selectNode} editedIds={editedIds} />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {data.fallacies.map((f) => {
                const done = resolved.includes(f.id);
                const active = selected && selected.id === f.id;
                return (
                  <button key={f.id} onClick={() => setSelected(active ? null : f)}
                    className="text-left rounded-2xl bg-white border p-5 transition-all"
                    style={{ borderColor: active ? T.blue : T.line, opacity: done ? 0.55 : 1 }}>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 font-bold text-[15px]"
                        style={{ color: T.ink, textDecoration: done ? "line-through" : "none" }}>
                        {done ? <CheckCircle2 size={16} style={{ color: T.green }} />
                          : <AlertCircle size={16} style={{ color: f.severity === "high" ? T.red : T.orange }} />}
                        {f.name}
                      </span>
                      <ChevronRight size={16} style={{ color: T.faint, transform: active ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
                    </div>
                    <div className="mt-2 text-[13px] font-semibold" style={{ color: T.sub }}>{f.edge}</div>
                    {done && <div className="mt-1 text-[13px] font-semibold" style={{ color: T.green }}>수정 반영</div>}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="rounded-2xl bg-white border p-6" style={{ borderColor: T.line }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[17px]" style={{ color: T.ink }}>{selected.name} · {selected.edge}</h3>
                  <button onClick={() => setSelected(null)}><X size={18} style={{ color: T.faint }} /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[13px] font-bold mb-1.5" style={{ color: T.blue }}>왜 오류로 판단했나요</div>
                    <p className="text-[15px] leading-relaxed" style={{ color: T.ink }}>{selected.why}</p>
                  </div>
                  <div>
                    <div className="text-[13px] font-bold mb-1.5" style={{ color: T.blue }}>이렇게 고쳐볼 수 있어요</div>
                    <p className="text-[15px] leading-relaxed" style={{ color: T.sub }}>{selected.fix}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected.nodeIds.map((id) => {
                        const n = nodes.find((x) => x.id === id);
                        return (
                          <button key={id} onClick={() => startEdit(id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-gray-50"
                            style={{ borderColor: T.line, color: T.ink }}>
                            <Pencil size={13} style={{ color: T.blue }} /> {n.label} 직접 수정
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-[15px] font-bold text-white transition-colors"
                style={{ background: T.blue }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.blueDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}>
                <Bookmark size={16} /> 결과 저장하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 노드 수정 모달 */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(25,31,40,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[17px]" style={{ color: T.ink }}>{editing.label} 수정하기</h3>
              <button onClick={() => setEditing(null)}><X size={18} style={{ color: T.faint }} /></button>
            </div>
            <p className="text-sm mb-3 leading-relaxed" style={{ color: T.sub }}>
              분석에 동의하지 않거나 문장을 다듬고 싶다면 여기서 직접 고쳐 주세요.
            </p>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
              className="w-full h-28 rounded-xl border p-3.5 text-[15px] leading-relaxed outline-none"
              style={{ borderColor: T.line, color: T.ink }} />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: T.fill, color: T.sub }}>취소</button>
              <button onClick={saveEdit}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: T.blue }}>
                저장하고 반영하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white mt-6"><Footer /></div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-3 text-sm font-semibold text-white"
          style={{ background: T.ink }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ═════════ 보관함 ═════════ */
function Archive({ onLoad }) {
  const [items, setItems] = useState(null);

  const refresh = useCallback(async () => setItems(await listAnalyses()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const remove = async (key) => { await deleteAnalysis(key); refresh(); };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col">
      <main className="max-w-2xl mx-auto px-6 py-12 w-full flex-1">
        <h1 className="text-2xl font-extrabold" style={{ color: T.ink }}>보관함</h1>
        <p className="mt-1.5 text-[15px]" style={{ color: T.sub }}>저장한 분석을 다시 열어볼 수 있어요.</p>

        <div className="mt-8 space-y-3">
          {items === null && <p className="text-sm" style={{ color: T.faint }}>불러오는 중이에요</p>}
          {items && items.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: T.line }}>
              <p className="text-[15px] font-semibold" style={{ color: T.ink }}>아직 저장한 분석이 없어요</p>
              <p className="mt-1 text-sm" style={{ color: T.sub }}>검증을 마친 뒤 결과 저장하기를 누르면 여기에 쌓여요.</p>
            </div>
          )}
          {items && items.map((it) => (
            <div key={it.key} className="rounded-2xl border p-5 flex items-start justify-between gap-4" style={{ borderColor: T.line }}>
              <button className="text-left flex-1" onClick={() => onLoad(it)}>
                <div className="text-[13px] font-medium" style={{ color: T.faint }}>
                  {new Date(it.savedAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}
                </div>
                <p className="mt-1.5 text-[15px] leading-relaxed line-clamp-2" style={{ color: T.ink }}>{it.text}</p>
                <div className="mt-2 text-[13px] font-semibold" style={{ color: it.fallacyOpen > 0 ? T.orange : T.green }}>
                  오류 {it.fallacyTotal}건 중 {it.fallacyTotal - it.fallacyOpen}건 검토 완료
                </div>
              </button>
              <button onClick={() => remove(it.key)} className="p-2 rounded-lg transition-colors hover:bg-gray-50">
                <Trash2 size={16} style={{ color: T.faint }} />
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ═════════ Root ═════════ */
export default function AletheiaMVP() {
  const [section, setSection] = useState("home"); // home | intro | verify | archive
  const [stage, setStage] = useState("input");    // 검증 탭 내부: input | loading | result
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [initial, setInitial] = useState({});
  const [savedCount, setSavedCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const items = await listAnalyses();
    setSavedCount(items.length);
  }, []);
  useEffect(() => { refreshCount(); }, [refreshCount]);

  const startAnalysis = (t) => {
    setText(t);
    setAnalysis(JSON.parse(JSON.stringify(MOCK_RESULT)));
    setInitial({});
    setStage("loading");
  };

  const loadSaved = (item) => {
    const a = JSON.parse(JSON.stringify(MOCK_RESULT));
    a.nodes = a.nodes.map((n) => (item.editedNodes && item.editedNodes[n.id] ? { ...n, text: item.editedNodes[n.id] } : n));
    setText(item.text);
    setAnalysis(a);
    setInitial({ resolved: item.resolved || [], editedIds: item.editedIds || [] });
    setStage("result");
    setSection("verify");
  };

  const goVerify = () => setSection("verify");

  return (
    <div style={{ fontFamily: `"Pretendard", -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif` }}>
      <GlobalNav section={section} onNavigate={setSection} savedCount={savedCount} />

      {section === "home" && <Landing onStart={goVerify} onIntro={() => setSection("intro")} />}
      {section === "intro" && <Intro onStart={goVerify} />}

      {section === "verify" && stage === "input" && <VerifyInput onAnalyze={startAnalysis} />}
      {section === "verify" && stage === "loading" && <Loading onDone={() => setStage("result")} />}
      {section === "verify" && stage === "result" && analysis && (
        <Result key={text + JSON.stringify(initial)} text={text} analysis={analysis} initial={initial}
          onReset={() => setStage("input")} onSaved={refreshCount} />
      )}

      {section === "archive" && <Archive onLoad={loadSaved} />}
    </div>
  );
}

export { GlobalNav, Landing, Intro, VerifyInput, Loading, Result, Archive, Graph };
