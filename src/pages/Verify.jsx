import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight, CheckCircle2, RefreshCw, Pencil, X, AlertCircle, ChevronRight, Bookmark } from "lucide-react";
import { T, NODE_STYLE } from "../theme";
import { Footer, Graph } from "../components/common";
import { SAMPLE_TEXT } from "../mocks/pipeline";

export function VerifyInput({ onAnalyze }) {
  const [text, setText] = useState("");
  const ready = text.trim().length >= 20;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <main className="mx-auto max-w-2xl px-6 pt-12">
        <h1 className="text-4xl font-extrabold leading-[1.25] tracking-tight md:text-[44px]" style={{ color: T.ink }}>
          결론보다 과정을
          <br />
          먼저 보여드려요
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed" style={{ color: T.sub }}>
          글 속의 주장과 근거를 그래프로 펼쳐서 어디에서 논리가 끊기는지 알려드려요.
          <br />
          마지막 판단은 언제나 사용자의 몫이에요.
        </p>

        <div className="mt-12 overflow-hidden rounded-2xl border" style={{ borderColor: T.line }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="리포트, 기사, AI가 만든 글을 붙여넣어 주세요. 20자 이상이면 분석할 수 있어요."
            className="h-40 w-full resize-none p-5 text-[15px] leading-relaxed outline-none"
            style={{ color: T.ink }}
          />
          <div
            className="flex items-center justify-between border-t px-5 py-3"
            style={{ borderColor: T.line, background: T.bg }}
          >
            <button
              onClick={() => setText(SAMPLE_TEXT)}
              className="rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white"
              style={{ color: T.blue }}
            >
              예시 문단으로 채우기
            </button>
            <button
              disabled={!ready}
              onClick={() => onAnalyze(text)}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[15px] font-bold text-white transition-colors"
              style={{ background: ready ? T.blue : "#C9D0DA", cursor: ready ? "pointer" : "not-allowed" }}
            >
              분석 시작하기 <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-20 pb-4">
          <h2 className="mb-6 text-lg font-bold" style={{ color: T.ink }}>
            이런 순서로 진행돼요
          </h2>
          <ol className="space-y-5">
            {[
              ["구조 분석", "문장을 주장, 근거, 결론 단위로 나누고 추론 관계를 그래프로 그려요."],
              ["논리 검증", "관계마다 오류를 찾아 이유와 함께 설명해 드려요. 동의하지 않으면 직접 고칠 수 있어요."],
              ["결과 저장", "검토를 마친 분석은 보관함에 저장해 두고 언제든 다시 열어볼 수 있어요."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold"
                  style={{ background: T.fill, color: T.sub }}
                >
                  {i + 1}
                </span>
                <div>
                  <div className="text-[15px] font-bold" style={{ color: T.ink }}>{t}</div>
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

const STEPS = [
  "문장을 명제 단위로 나누는 중",
  "논증 요소를 분류하는 중",
  "문장 사이 추론 관계 분석 중",
  "논리 오류 후보 식별 중",
  "그래프 구성 중",
];

export function Loading({ onDone }) {
  const [step, setStep] = useState(0);

  /* onDone은 부모에서 매 렌더마다 새로 만들어질 수 있습니다.
     의존성에 그대로 넣으면 부모가 리렌더될 때마다 타이머가 초기화돼
     단계가 영영 진행되지 않으므로, ref에 담아 effect는 step에만 의존시킵니다. */
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (step < STEPS.length) {
      const t = setTimeout(() => setStep((s) => s + 1), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => doneRef.current && doneRef.current(), 350);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white">
      <div className="w-full max-w-sm px-8">
        <div className="mb-8 text-center text-lg font-bold" style={{ color: T.ink }}>
          글을 분석하고 있어요
        </div>
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="flex items-center gap-3 text-[15px] transition-opacity duration-300"
              style={{ opacity: i <= step ? 1 : 0.3 }}
            >
              {i < step ? (
                <CheckCircle2 size={18} style={{ color: T.green }} />
              ) : i === step ? (
                <RefreshCw size={18} className="animate-spin" style={{ color: T.blue }} />
              ) : (
                <span className="inline-block h-[18px] w-[18px] rounded-full border-2" style={{ borderColor: T.line }} />
              )}
              <span style={{ color: i <= step ? T.ink : T.faint, fontWeight: i === step ? 600 : 400 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Result({ text, analysis, initial, onReset, onSave }) {
  const [tab, setTab] = useState("structure");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [nodes, setNodes] = useState(analysis.nodes);
  const [resolved, setResolved] = useState(initial.resolved || []);
  const [editedIds, setEditedIds] = useState(initial.editedIds || []);
  const [toast, setToast] = useState("");

  const fallacies = analysis.fallacies;
  const openCount = fallacies.filter((f) => !resolved.includes(f.id)).length;

  const showToast = useCallback((m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const selectNode = (id) => {
    const f =
      fallacies.find((x) => x.nodeIds.includes(id) && !resolved.includes(x.id)) ||
      fallacies.find((x) => x.nodeIds.includes(id));
    setSelected(f || null);
  };

  const startEdit = (id) => {
    const n = nodes.find((x) => x.id === id);
    setEditing(n);
    setDraft(n.text);
  };

  const saveEdit = () => {
    setNodes((prev) => prev.map((n) => (n.id === editing.id ? { ...n, text: draft } : n)));
    setEditedIds((p) => [...new Set([...p, editing.id])]);
    if (selected) setResolved((p) => [...new Set([...p, selected.id])]);
    setEditing(null);
    setSelected(null);
    showToast("수정을 반영했어요");
  };

  const handleSave = () => {
    const editedNodes = {};
    nodes.forEach((n) => {
      if (editedIds.includes(n.id)) editedNodes[n.id] = n.text;
    });
    onSave({ text, resolved, editedIds, editedNodes, total: fallacies.length, reviewed: resolved.length });
    showToast("보관함에 저장했어요");
  };

  const TabBtn = ({ id, num, label }) => (
    <button
      onClick={() => setTab(id)}
      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-bold transition-colors"
      style={{
        background: tab === id ? "#fff" : "transparent",
        color: tab === id ? T.ink : T.faint,
        boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[12px] font-bold"
        style={{ background: tab === id ? T.cCyan : T.line, color: tab === id ? "#fff" : T.faint }}
      >
        {num}
      </span>
      {label}
    </button>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ background: T.bg }}>
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex gap-1 rounded-2xl p-1" style={{ background: T.fill }}>
            <TabBtn id="structure" num="1" label="구조 분석" />
            <TabBtn id="verify" num="2" label="논리 검증" />
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white"
            style={{ color: T.sub }}
          >
            <RefreshCw size={15} /> 새 분석
          </button>
        </div>

        {tab === "structure" && (
          <div className="space-y-5">
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: T.line }}>
              <h2 className="text-lg font-bold" style={{ color: T.ink }}>
                글을 {nodes.length}개의 명제로 나눴어요
              </h2>
              <p className="mt-1 text-sm" style={{ color: T.sub }}>
                각 명제의 역할과 문장 사이의 추론 관계예요. 오류 판단은 다음 단계에서 진행돼요.
              </p>
              <div className="mt-5 space-y-3">
                {nodes.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-xl p-3.5" style={{ background: T.bg }}>
                    <span
                      className="flex-none rounded-lg px-2.5 py-1 text-[13px] font-bold"
                      style={{ background: NODE_STYLE[n.type].chip, color: NODE_STYLE[n.type].text }}
                    >
                      {n.label}
                    </span>
                    <p className="pt-0.5 text-[15px] leading-relaxed" style={{ color: T.ink }}>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: T.line }}>
              <h2 className="mb-4 text-lg font-bold" style={{ color: T.ink }}>논증 구조 그래프</h2>
              <Graph nodes={nodes} edges={analysis.edges} mode="structure" editedIds={editedIds} />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTab("verify")}
                className="inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-[15px] font-bold text-white transition-colors"
                style={{ background: T.blue }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.blueDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}
              >
                논리 검증하기 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {tab === "verify" && (
          <div className="space-y-5">
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: T.line }}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: T.ink }}>
                    {openCount > 0 ? `논리 오류 ${openCount}건을 확인해 주세요` : "모든 오류를 검토했어요"}
                  </h2>
                  <p className="mt-0.5 text-sm" style={{ color: T.sub }}>
                    노드나 아래 카드를 누르면 판단 근거를 볼 수 있어요.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[13px] font-medium" style={{ color: T.sub }}>
                  <span className="flex items-center gap-1.5">
                    <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: T.cOrange }} />
                    비약, 근거 부족
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: T.cRed }} />
                    모순
                  </span>
                </div>
              </div>
              <Graph
                nodes={nodes}
                edges={analysis.edges}
                mode="verify"
                selected={selected}
                onSelectNode={selectNode}
                editedIds={editedIds}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {fallacies.map((f) => {
                const done = resolved.includes(f.id);
                const active = selected && selected.id === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelected(active ? null : f)}
                    className="rounded-2xl border bg-white p-5 text-left transition-all"
                    style={{ borderColor: active ? T.cCyan : T.line, opacity: done ? 0.55 : 1 }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-2 text-[15px] font-bold"
                        style={{ color: T.ink, textDecoration: done ? "line-through" : "none" }}
                      >
                        {done ? (
                          <CheckCircle2 size={16} style={{ color: T.green }} />
                        ) : (
                          <AlertCircle size={16} style={{ color: f.severity === "high" ? T.red : T.orange }} />
                        )}
                        {f.name}
                      </span>
                      <ChevronRight
                        size={16}
                        style={{ color: T.faint, transform: active ? "rotate(90deg)" : "none", transition: "transform .2s" }}
                      />
                    </div>
                    <div className="mt-2 text-[13px] font-semibold" style={{ color: T.sub }}>{f.edge}</div>
                    {done && <div className="mt-1 text-[13px] font-semibold" style={{ color: T.green }}>수정 반영</div>}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="rounded-2xl border bg-white p-6" style={{ borderColor: T.line }}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[17px] font-bold" style={{ color: T.ink }}>
                    {selected.name} · {selected.edge}
                  </h3>
                  <button onClick={() => setSelected(null)}>
                    <X size={18} style={{ color: T.faint }} />
                  </button>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="mb-1.5 text-[13px] font-bold" style={{ color: T.blue }}>왜 오류로 판단했나요</div>
                    <p className="text-[15px] leading-relaxed" style={{ color: T.ink }}>{selected.why}</p>
                  </div>
                  <div>
                    <div className="mb-1.5 text-[13px] font-bold" style={{ color: T.blue }}>이렇게 고쳐볼 수 있어요</div>
                    <p className="text-[15px] leading-relaxed" style={{ color: T.sub }}>{selected.fix}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selected.nodeIds.map((id) => {
                        const n = nodes.find((x) => x.id === id);
                        if (!n) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => startEdit(id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-gray-50"
                            style={{ borderColor: T.line, color: T.ink }}
                          >
                            <Pencil size={13} style={{ color: T.blue }} /> {n.label} 직접 수정
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-[15px] font-bold text-white transition-colors"
                style={{ background: T.blue }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.blueDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}
              >
                <Bookmark size={16} /> 결과 저장하기
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white">
        <Footer />
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(25,31,40,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-bold" style={{ color: T.ink }}>{editing.label} 수정하기</h3>
              <button onClick={() => setEditing(null)}>
                <X size={18} style={{ color: T.faint }} />
              </button>
            </div>
            <p className="mb-3 text-sm leading-relaxed" style={{ color: T.sub }}>
              분석에 동의하지 않거나 문장을 다듬고 싶다면 여기서 직접 고쳐 주세요.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-28 w-full resize-none rounded-xl border p-3.5 text-[15px] leading-relaxed outline-none"
              style={{ borderColor: T.line, color: T.ink }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ background: T.fill, color: T.sub }}
              >
                취소
              </button>
              <button
                onClick={saveEdit}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{ background: T.blue }}
              >
                저장하고 반영하기
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
          style={{ background: T.ink }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
