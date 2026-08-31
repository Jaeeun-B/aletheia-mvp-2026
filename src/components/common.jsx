import React from "react";
import { T, NODE_STYLE, REL_STYLE } from "../theme";

export const TABS = [
  ["home", "홈"],
  ["intro", "소개"],
  ["verify", "검증"],
  ["pipeline", "파이프라인"],
  ["archive", "보관함"],
];

export function Nav({ section, onNavigate, savedCount }) {
  return (
    <nav
      className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-5 md:px-10"
      style={{ borderColor: T.line }}
    >
      <button onClick={() => onNavigate("home")} aria-label="홈으로">
        <img src="/logo.png" alt="Aletheia" className="block h-5 w-auto" />
      </button>
      <div className="flex items-center gap-0.5 md:gap-1.5">
        {TABS.map(([id, label]) => {
          const active = section === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              style={{
                color: active ? T.blue : T.sub,
                background: active ? T.blueSoft : "transparent",
              }}
            >
              {label}
              {id === "archive" && savedCount > 0 ? ` ${savedCount}` : ""}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer
      className="mt-14 border-t py-8 text-center text-[13px]"
      style={{ color: T.faint, borderColor: T.line }}
    >
      Team Aletheia · 2026 AI Innovation Challenge
    </footer>
  );
}

/* 그래프 노드 안에서 긴 문장을 줄바꿈합니다 (SVG는 자동 줄바꿈이 없습니다) */
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

/* mode: "structure"는 관계를 중립 회색으로, "verify"는 오류 색상으로 렌더합니다 */
export function Graph({ nodes, edges, mode, selected, onSelectNode, editedIds = [] }) {
  const W = 200;
  const H = 96;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const isVerify = mode === "verify";

  return (
    <svg viewBox="0 0 920 480" className="block h-auto w-full select-none">
      <defs>
        {Object.entries(REL_STYLE).map(([k, s]) => (
          <marker
            key={k}
            id={`ar-${mode}-${k}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={isVerify ? s.color : T.faint} />
          </marker>
        ))}
      </defs>

      {edges.map((e) => {
        const a = byId[e.from];
        const b = byId[e.to];
        if (!a || !b) return null;
        const s = REL_STYLE[e.relation] || REL_STYLE.weak;
        const color = isVerify ? s.color : T.faint;
        const ink = isVerify ? s.ink : "#6B7684";
        const x1 = a.x + W / 2;
        const y1 = a.y;
        const x2 = b.x - W / 2;
        const y2 = b.y;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const isSel =
          selected && selected.nodeIds.includes(e.from) && selected.nodeIds.includes(e.to);
        const dim = isVerify && selected && !isSel;
        return (
          <g key={`${e.from}-${e.to}`} opacity={dim ? 0.25 : 1} style={{ transition: "opacity .2s" }}>
            <path
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth={isSel ? 3 : 2}
              strokeDasharray={isVerify ? s.dash : "0"}
              markerEnd={`url(#ar-${mode}-${e.relation})`}
            />
            <rect
              x={mx - 32}
              y={my - 30}
              width="64"
              height="19"
              rx="9.5"
              fill="#fff"
              stroke={color}
              strokeWidth="1"
              opacity="0.95"
            />
            <text x={mx} y={my - 16.5} textAnchor="middle" fontSize="11" fontWeight="700" fill={ink}>
              {isVerify ? s.label : "추론 관계"}
            </text>
          </g>
        );
      })}

      {nodes.map((n) => {
        const st = NODE_STYLE[n.type] || NODE_STYLE.Claim;
        const isSel = selected && selected.nodeIds.includes(n.id);
        const dim = isVerify && selected && !isSel;
        const lines = wrapText(n.text);
        const chipW = n.label.length * 13 + 22;
        return (
          <g
            key={n.id}
            transform={`translate(${n.x - W / 2}, ${n.y - H / 2})`}
            opacity={dim ? 0.3 : 1}
            onClick={() => isVerify && onSelectNode && onSelectNode(n.id)}
            style={{ cursor: isVerify ? "pointer" : "default" }}
          >
            <rect
              width={W}
              height={H}
              rx="16"
              fill="#fff"
              stroke={isSel ? T.cCyan : T.line}
              strokeWidth={isSel ? 2.5 : 1.5}
            />
            <rect x="14" y="12" width={chipW} height="24" rx="12" fill={st.chip} />
            <text x="25" y="29" fontSize="13" fontWeight="700" fill={st.text}>
              {n.label}
            </text>
            {editedIds.includes(n.id) && (
              <text x={chipW + 44} y="29" fontSize="12" fontWeight="600" fill={T.green}>
                수정됨
              </text>
            )}
            {lines.map((line, i) => (
              <text key={i} x="15" y={54 + i * 18} fontSize="13.5" fill={T.ink}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
