import React from "react";
import { ArrowRight } from "lucide-react";
import { T } from "../theme";
import { Footer } from "../components/common";

export function Landing({ onStart, onIntro }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-white">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <img
          src="/logo.png"
          alt="Aletheia"
          className="h-auto w-full"
          style={{ maxWidth: "min(88%, 780px)" }}
        />
        <p className="mt-9 text-lg font-bold leading-relaxed md:text-xl" style={{ color: T.sub }}>
          과정을 읽는 논리 검증 서비스
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-1.5 rounded-xl px-7 py-3.5 text-[16px] font-bold text-white transition-colors"
            style={{ background: T.blue }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.blueDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}
          >
            논리 검증 시작하기 <ArrowRight size={17} />
          </button>
          <button
            onClick={onIntro}
            className="rounded-xl px-7 py-3.5 text-[16px] font-bold transition-colors hover:bg-gray-100"
            style={{ background: T.fill, color: T.ink }}
          >
            Aletheia 이야기
          </button>
        </div>
      </main>
    </div>
  );
}

const PRINCIPLES = [
  ["드러내요", "문장 뒤에 가려진 주장과 근거의 구조를 그래프로 펼쳐서 보여줘요."],
  ["설명해요", "무엇이 오류인지 통보하는 대신, 왜 그렇게 판단했는지 이유까지 함께 제시해요."],
  ["맡겨요", "AI는 근거를 정리할 뿐이에요. 걷어낸 자리에서 무엇을 볼지는 사용자가 정해요."],
];

export function Intro({ onStart }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <style>{`
        @keyframes aletheia-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .aletheia-marquee { animation: aletheia-marquee 30s linear infinite; width: max-content; }
        @media (prefers-reduced-motion: reduce) { .aletheia-marquee { animation: none; } }
      `}</style>

      <div className="overflow-hidden border-b" style={{ borderColor: T.line, background: T.bg }}>
        <div
          className="aletheia-marquee whitespace-nowrap py-2.5 text-[13px] font-medium"
          style={{ color: T.faint }}
        >
          {[0, 1].map((k) => (
            <span key={k}>
              {Array.from({ length: 10 }).map((_, n) => (
                <span key={n} className="mx-7">
                  Aletheia를 소개합니다
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-6">
        <section className="pb-20 pt-24 text-center">
          <div className="text-[12px] font-bold tracking-[0.25em]" style={{ color: T.blue }}>
            OUR NAME
          </div>
          <div className="mt-8" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <span className="text-6xl tracking-tight md:text-7xl" style={{ color: T.ink }}>
              ἀλήθεια
            </span>
          </div>
          <div className="mt-4 text-[15px]" style={{ color: T.faint }}>
            알레테이아 [aletheia]
          </div>

          <div className="mt-10 inline-flex items-center gap-3 text-[15px] font-semibold">
            <span className="rounded-xl px-4 py-2" style={{ background: T.blueSoft, color: T.blue }}>
              ἀ 아니다
            </span>
            <span style={{ color: T.faint }}>+</span>
            <span className="rounded-xl px-4 py-2" style={{ background: T.fill, color: T.sub }}>
              λήθη 가려짐, 망각
            </span>
          </div>

          <p className="mt-10 text-[17px] leading-[1.8]" style={{ color: T.ink }}>
            고대 그리스어로 <b>'가려져 있지 않음'</b>이라는 뜻이에요.
            <br />
            그리스인들에게 진리란 새로 만들어내는 것이 아니라,
            <br className="hidden md:block" />
            덮여 있던 것을 걷어내는 일이었어요.
          </p>
        </section>

        <section className="border-t py-16" style={{ borderColor: T.line }}>
          <h2 className="text-2xl font-extrabold" style={{ color: T.ink }}>
            이름에 담은 약속
          </h2>
          <p className="mt-5 text-[16px] leading-[1.9]" style={{ color: T.sub }}>
            AI가 매끄러운 결론을 쏟아내는 시대에, 정작 그 결론이 어떤 근거 위에 서 있는지는 문장 뒤에
            가려져 있어요. Aletheia는 이름 그대로 그 가려진 자리를 걷어내요. 글을 주장과 근거의 구조로
            펼치고, 어디에서 논리가 끊기는지 이유와 함께 드러내요. 진리를 대신 선언하는 것이 아니라,
            스스로 볼 수 있게 만드는 것. 그것이 이 이름을 고른 이유예요.
          </p>
        </section>

        <section className="border-t py-16" style={{ borderColor: T.line }}>
          <h2 className="text-2xl font-extrabold" style={{ color: T.ink }}>
            세 가지 원칙
          </h2>
          <div className="mt-7 space-y-6">
            {PRINCIPLES.map(([k, d]) => (
              <div key={k} className="flex gap-5">
                <span className="w-16 flex-none text-[16px] font-bold" style={{ color: T.blue }}>
                  {k}
                </span>
                <p className="text-[15px] leading-relaxed" style={{ color: T.sub }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t py-24 text-center" style={{ borderColor: T.line }}>
          <img src="/logo.png" alt="Aletheia" className="mx-auto h-auto w-44" />
          <p className="mt-6 text-[16px]" style={{ color: T.sub }}>
            이제 가려진 논리를 직접 걷어내 보세요.
          </p>
          <button
            onClick={onStart}
            className="mt-8 inline-flex items-center gap-1.5 rounded-xl px-8 py-3.5 text-[16px] font-bold text-white transition-colors"
            style={{ background: T.blue }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.blueDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}
          >
            논리 검증 시작하기 <ArrowRight size={17} />
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
