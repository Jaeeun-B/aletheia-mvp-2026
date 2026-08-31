import React, { useState, useRef } from "react";
import { T, NODE_STYLE } from "../theme";
import { Footer } from "../components/common";
import {
  SAMPLE_TEXT, SEGMENTS, BIO_TOKENS, ENTITIES, RELATIONS,
  STAGES, NODE_SEG, COMPONENT_CONF, MAPPING_RULE,
} from "../mocks/pipeline";
import fixture from "../mocks/analysis.json";

/* ── 공통 소품 ── */
const IoLabel = ({ children, out }) => (
  <div
    className="mb-2 text-[11px] font-extrabold tracking-[0.14em]"
    style={{ color: out ? T.blue : T.faint }}
  >
    {children}
  </div>
);

const Mono = ({ children }) => (
  <pre
    className="m-0 overflow-x-auto rounded-[10px] border p-3.5 font-mono text-[12.5px] leading-[1.75]"
    style={{ background: "#F7F8FA", borderColor: T.line, whiteSpace: "pre" }}
  >
    {children}
  </pre>
);

const SegId = ({ children }) => (
  <span className="font-mono text-[12px] font-bold" style={{ color: T.blue }}>{children}</span>
);

const Table = ({ head, children }) => (
  <div className="overflow-hidden rounded-xl border" style={{ borderColor: T.line }}>
    <table className="w-full border-collapse bg-white text-[13.5px]">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th
              key={i}
              className={`whitespace-nowrap border-b px-3.5 py-2.5 text-[11.5px] font-bold tracking-wide ${
                h.num ? "text-right" : "text-left"
              }`}
              style={{ background: T.bg, color: T.faint, borderColor: T.line }}
            >
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

/* ── 단계별 산출물 ── */
function Stage1() {
  return (
    <>
      <IoLabel>INPUT</IoLabel>
      <Mono>{`"${SAMPLE_TEXT}"`}</Mono>
      <div className="mt-4">
        <IoLabel out>OUTPUT: 4 units</IoLabel>
        <div className="flex flex-col gap-2">
          {SEGMENTS.map((s) => (
            <div key={s.id} className="flex items-baseline gap-2.5 text-[14.5px] leading-relaxed">
              <span className="w-[26px] flex-none"><SegId>{s.id}</SegId></span>
              <span style={{ color: T.ink }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const TOK_STYLE = {
  EVIDENCE: { bg: T.blueSoft, fg: T.blue, bd: "#B6E4F2" },
  CLAIM: { bg: T.orangeSoft, fg: T.orange, bd: "#F5CFA8" },
  CONCLUSION: { bg: T.greenSoft, fg: T.green, bd: "#9FE6C6" },
  O: { bg: T.fill, fg: T.faint, bd: "transparent" },
};

function Stage2() {
  return (
    <>
      <IoLabel out>OUTPUT: Sentence-level classification</IoLabel>
      <Table head={[{ label: "UNIT" }, { label: "COMPONENT" }, { label: "CONFIDENCE", num: true }]}>
        {fixture.nodes.map((n) => (
          <tr key={n.id} className="transition-colors hover:bg-gray-50">
            <td className="border-b px-3.5 py-3" style={{ borderColor: T.line }}>
              <SegId>{NODE_SEG[n.id]}</SegId>
            </td>
            <td className="border-b px-3.5 py-3" style={{ borderColor: T.line }}>
              <span
                className="rounded-lg px-2.5 py-1 text-[13px] font-bold"
                style={{ background: NODE_STYLE[n.type].chip, color: NODE_STYLE[n.type].text }}
              >
                {n.type}
              </span>
            </td>
            <td
              className="border-b px-3.5 py-3 text-right font-mono text-[12px] tabular-nums"
              style={{ borderColor: T.line, color: T.sub }}
            >
              {COMPONENT_CONF[n.id].toFixed(2)}
            </td>
          </tr>
        ))}
      </Table>

      <div className="mt-5">
        <IoLabel out>OUTPUT: Token-level BIO tagging (일부)</IoLabel>
        <div className="flex flex-wrap gap-1.5">
          {BIO_TOKENS.map((tk, i) => {
            const kind = tk.tag === "O" ? "O" : tk.tag.slice(2);
            const st = TOK_STYLE[kind] || TOK_STYLE.O;
            return (
              <span
                key={i}
                className="rounded-md border px-[7px] py-[3px] text-[13px]"
                style={{ background: st.bg, color: st.fg, borderColor: st.bd }}
              >
                {tk.t}
                <span className="ml-1 text-[10px] font-bold opacity-75">{tk.tag}</span>
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Stage3() {
  return (
    <>
      <IoLabel out>OUTPUT: custom entity types</IoLabel>
      <div className="flex flex-wrap gap-2">
        {ENTITIES.map((e) => (
          <span
            key={e.text}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[13.5px]"
            style={{ borderColor: T.line, color: T.ink }}
          >
            {e.text}
            <span
              className="rounded-md px-1.5 py-0.5 text-[11px] font-bold"
              style={{ background: T.magentaSoft, color: T.magenta }}
            >
              {e.type}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-3.5 text-sm" style={{ color: T.sub }}>
        GLiNER는 label set이 고정되지 않아, 논증 분석에 필요한 semantic type을 직접 설계해 지정할 수 있습니다.
      </p>
    </>
  );
}

const NLI_STYLE = {
  entailment: { bg: T.greenSoft, fg: T.green },
  neutral: { bg: T.orangeSoft, fg: T.orange },
  contradiction: { bg: T.redSoft, fg: T.red },
};

function Stage4() {
  return (
    <>
      <IoLabel out>OUTPUT: NLI 판정 → Aletheia 관계 매핑</IoLabel>
      <Table
        head={[
          { label: "PAIR" }, { label: "NLI LABEL" },
          { label: "CONFIDENCE", num: true }, { label: "ALETHEIA RELATION" },
        ]}
      >
        {RELATIONS.map((r) => (
          <tr key={r.from + r.to} className="transition-colors hover:bg-gray-50">
            <td className="border-b px-3.5 py-3" style={{ borderColor: T.line }}>
              <SegId>{r.from}</SegId>
              <span className="mx-1.5" style={{ color: T.faint }}>→</span>
              <SegId>{r.to}</SegId>
            </td>
            <td className="border-b px-3.5 py-3" style={{ borderColor: T.line }}>
              <span
                className="rounded-md px-2 py-[3px] font-mono text-[12px] font-bold"
                style={{ background: NLI_STYLE[r.nli].bg, color: NLI_STYLE[r.nli].fg }}
              >
                {r.nli}
              </span>
            </td>
            <td className="border-b px-3.5 py-3 text-right" style={{ borderColor: T.line }}>
              <span className="inline-flex flex-col items-end gap-1">
                <span className="font-mono text-[12px] tabular-nums" style={{ color: T.sub }}>
                  {r.conf.toFixed(2)}
                </span>
                <span className="h-1 w-16 overflow-hidden rounded-full" style={{ background: T.line }}>
                  <i className="block h-full" style={{ width: `${r.conf * 100}%`, background: T.cCyan }} />
                </span>
              </span>
            </td>
            <td className="border-b px-3.5 py-3" style={{ borderColor: T.line }}>
              <b className="text-[13px]" style={{ color: T.ink }}>{r.rel}</b>
              <br />
              <span className="font-mono text-[12px]" style={{ color: T.sub }}>{r.label}</span>
            </td>
          </tr>
        ))}
      </Table>
      <div className="mt-4">
        <Mono>{MAPPING_RULE}</Mono>
      </div>
    </>
  );
}

function Stage5() {
  return (
    <>
      <IoLabel>INPUT</IoLabel>
      <Mono>Evidence + Claim + Relation + Entity + Graph position</Mono>
      <div className="mt-4">
        <IoLabel out>OUTPUT: {fixture.fallacies.length} fallacies</IoLabel>
        {fixture.fallacies.map((f) => (
          <div key={f.id} className="mb-2.5 rounded-xl border p-3.5" style={{ borderColor: T.line }}>
            <div className="flex flex-wrap items-center gap-2">
              <b style={{ color: T.ink }}>{f.name}</b>
              <span className="font-mono text-[12px]" style={{ color: T.sub }}>{f.en}</span>
              <span
                className="rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                style={{
                  background: f.severity === "high" ? T.redSoft : T.orangeSoft,
                  color: f.severity === "high" ? T.red : T.orange,
                }}
              >
                severity {f.severity}
              </span>
              <span className="font-mono text-[12px]" style={{ color: T.sub }}>{f.edge}</span>
            </div>
            <div
              className="mt-2.5 rounded-lg px-2.5 py-2 font-mono text-[12px]"
              style={{ background: T.bg, color: T.sub }}
            >
              {f.rule}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Stage6() {
  return (
    <>
      <IoLabel out>OUTPUT: 오류별 설명 3종</IoLabel>
      {fixture.fallacies.map((f) => (
        <div key={f.id} className="mb-2.5 rounded-xl border p-3.5" style={{ borderColor: T.line }}>
          <div className="flex flex-wrap items-center gap-2">
            <b style={{ color: T.ink }}>{f.name}</b>
            <span className="font-mono text-[12px]" style={{ color: T.sub }}>{f.edge}</span>
          </div>
          {[["왜 오류인지", f.why], ["부족한 전제", f.missing], ["수정 방향", f.fix]].map(([k, v]) => (
            <p key={k} className="mt-2.5 text-[14px] leading-relaxed" style={{ color: T.sub }}>
              <b style={{ color: T.blue }}>{k}</b> · {v}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

function Stage7() {
  const payload = {
    nodes: fixture.nodes,
    edges: fixture.edges,
    fallacies: fixture.fallacies.map((f) => ({
      id: f.id, name: f.name, severity: f.severity, edge: f.edge,
      nodeIds: f.nodeIds, why: f.why.slice(0, 34) + "...", fix: f.fix.slice(0, 26) + "...",
    })),
    meta: fixture.meta,
  };
  return (
    <>
      <IoLabel out>OUTPUT: POST /api/v1/analyze 응답</IoLabel>
      <Mono>{JSON.stringify(payload, null, 2)}</Mono>
      <p className="mt-3.5 text-sm" style={{ color: T.sub }}>
        이 JSON이 그대로 프론트엔드의 그래프와 오류 카드로 렌더링됩니다. 노드 좌표는 포함되지 않습니다.
      </p>
    </>
  );
}

const RENDERERS = [Stage1, Stage2, Stage3, Stage4, Stage5, Stage6, Stage7];

/* ── 페이지 ── */
export function Pipeline() {
  const [open, setOpen] = useState([true, false, false, false, false, false, false]);
  const refs = useRef([]);

  const allOpen = open.every(Boolean);
  const toggle = (i) => setOpen((p) => p.map((v, k) => (k === i ? !v : v)));
  const toggleAll = () => setOpen(open.map(() => !allOpen));
  const jump = (i) => {
    setOpen((p) => p.map((v, k) => (k === i ? true : v)));
    const el = refs.current[i];
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const STATS = [
    ["파이프라인 단계", "7", "단계"],
    ["사용 모델", "4", "종"],
    ["논증 요소", String(fixture.nodes.length), "개"],
    ["탐지 오류", String(fixture.fallacies.length), "건"],
    ["응답 지연", String(fixture.meta.latency_ms), "ms"],
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-12 md:px-8">
        <h1 className="text-4xl font-extrabold leading-[1.25] tracking-tight md:text-[44px]" style={{ color: T.ink }}>
          입력에서 그래프까지
          <br />
          7단계를 거쳐요
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed" style={{ color: T.sub }}>
          각 단계가 어떤 모델로 무엇을 만들어내는지 실제 산출물 형태로 보여드려요.
          <br />
          모든 값은 목업이며, 스키마는 프론트가 기대하는 형식과 동일합니다.
        </p>

        <div className="mt-7 flex flex-wrap overflow-hidden rounded-2xl border bg-white" style={{ borderColor: T.line }}>
          {STATS.map(([k, v, unit], i) => (
            <div
              key={k}
              className="min-w-[120px] flex-1 border-r px-5 py-4"
              style={{ borderColor: i === STATS.length - 1 ? "transparent" : T.line }}
            >
              <span className="block text-[12px] font-semibold" style={{ color: T.faint }}>{k}</span>
              <span className="mt-1 block text-[22px] font-extrabold tabular-nums tracking-tight" style={{ color: T.ink }}>
                {v}
                <small className="ml-[3px] text-[13px] font-semibold" style={{ color: T.sub }}>{unit}</small>
              </span>
            </div>
          ))}
        </div>

        <div
          className="sticky top-16 z-30 mt-6 flex items-center gap-3 border-b py-3"
          style={{ borderColor: T.line, background: "rgba(255,255,255,0.92)", backdropFilter: "saturate(180%) blur(8px)" }}
        >
          <div className="flex flex-1 gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {STAGES.map((s, i) => (
              <button
                key={s.idx}
                onClick={() => jump(i)}
                className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-all"
                style={{
                  background: open[i] ? T.blueSoft : "#fff",
                  borderColor: open[i] ? "transparent" : T.line,
                  color: open[i] ? T.blue : T.sub,
                }}
              >
                <i
                  className="flex h-4 w-4 items-center justify-center rounded-[5px] text-[10px] font-extrabold not-italic"
                  style={{ background: open[i] ? T.cCyan : T.fill, color: open[i] ? "#fff" : T.faint }}
                >
                  {s.idx}
                </i>
                {s.name}
              </button>
            ))}
          </div>
          <button
            onClick={toggleAll}
            className="flex-none rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ color: T.sub }}
          >
            {allOpen ? "전체 접기" : "전체 펼치기"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: T.line, background: T.bg }}>
          <div className="text-[11px] font-extrabold tracking-[0.16em]" style={{ color: T.faint }}>INPUT</div>
          <p className="mt-2.5 text-[15px] leading-[1.8]" style={{ color: T.ink }}>{SAMPLE_TEXT}</p>
        </div>

        <div className="pb-4">
          {STAGES.map((s, i) => {
            const Body = RENDERERS[i];
            return (
              <div
                key={s.idx}
                ref={(el) => (refs.current[i] = el)}
                className="mt-4 overflow-hidden rounded-2xl border bg-white"
                style={{ borderColor: open[i] ? "#D5DBE1" : T.line, scrollMarginTop: "132px" }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <span
                    className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[10px] text-[14px] font-extrabold"
                    style={{
                      background: s.optional ? T.fill : T.blueSoft,
                      color: s.optional ? T.faint : T.blue,
                    }}
                  >
                    {s.idx}
                  </span>
                  <span className="flex-1">
                    <b className="text-[16px]" style={{ color: T.ink }}>{s.name}</b>
                    <span className="ml-2 text-[13px] font-medium" style={{ color: T.faint }}>{s.en}</span>
                    {s.optional && (
                      <span
                        className="ml-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold"
                        style={{ background: T.fill, color: T.faint }}
                      >
                        선택 단계
                      </span>
                    )}
                    <p className="mt-[3px] text-[13.5px]" style={{ color: T.sub }}>{s.desc}</p>
                  </span>
                  <span
                    className="hidden flex-none whitespace-nowrap rounded-lg px-2.5 py-[5px] text-[12px] font-semibold md:inline"
                    style={{ background: T.fill, color: T.sub }}
                  >
                    {s.model}
                  </span>
                  <span
                    className="flex-none text-[13px]"
                    style={{ color: T.faint, transform: open[i] ? "rotate(90deg)" : "none", transition: "transform .2s" }}
                  >
                    ▸
                  </span>
                </button>
                {open[i] && (
                  <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: T.line }}>
                    <Body />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
