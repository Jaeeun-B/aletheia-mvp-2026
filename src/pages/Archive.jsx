import React from "react";
import { Trash2 } from "lucide-react";
import { T } from "../theme";
import { Footer } from "../components/common";

export function Archive({ items, onLoad, onDelete }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-extrabold" style={{ color: T.ink }}>보관함</h1>
        <p className="mt-1.5 text-[15px]" style={{ color: T.sub }}>
          저장한 분석을 다시 열어볼 수 있어요.
        </p>

        <div className="mt-8 space-y-3">
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: T.line }}>
              <p className="text-[15px] font-semibold" style={{ color: T.ink }}>아직 저장한 분석이 없어요</p>
              <p className="mt-1 text-sm" style={{ color: T.sub }}>
                검증을 마친 뒤 결과 저장하기를 누르면 여기에 쌓여요.
              </p>
            </div>
          )}
          {items.map((it) => {
            const done = it.reviewed >= it.total;
            return (
              <div
                key={it.savedAt}
                className="flex items-start justify-between gap-4 rounded-2xl border p-5"
                style={{ borderColor: T.line }}
              >
                <button className="flex-1 text-left" onClick={() => onLoad(it)}>
                  <div className="text-[13px] font-medium" style={{ color: T.faint }}>
                    {new Date(it.savedAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: T.ink }}>
                    {it.text.length > 90 ? it.text.slice(0, 90) + "…" : it.text}
                  </p>
                  <div className="mt-2 text-[13px] font-semibold" style={{ color: done ? T.green : T.orange }}>
                    오류 {it.total}건 중 {it.reviewed}건 검토 완료
                  </div>
                </button>
                <button
                  onClick={() => onDelete(it.savedAt)}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-50"
                  aria-label="삭제"
                >
                  <Trash2 size={16} style={{ color: T.faint }} />
                </button>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
