import React, { useState, useEffect, useCallback } from "react";
import { Nav } from "./components/common";
import { Landing, Intro } from "./pages/Landing";
import { VerifyInput, Loading, Result } from "./pages/Verify";
import { Pipeline } from "./pages/Pipeline";
import { Archive } from "./pages/Archive";
import { analyzeText, applyLayout } from "./services/api";
import { listAnalyses, saveAnalysis, deleteAnalysis } from "./storage";

export default function App() {
  const [section, setSection] = useState("home"); // home | intro | verify | pipeline | archive
  const [stage, setStage] = useState("input");    // 검증 탭 내부: input | loading | result
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [initial, setInitial] = useState({});
  const [animDone, setAnimDone] = useState(false);
  const [items, setItems] = useState([]);

  const refresh = useCallback(() => setItems(listAnalyses()), []);
  useEffect(() => { refresh(); }, [refresh]);

  /* 로딩 애니메이션과 서버 응답 중 늦은 쪽을 기다렸다가 결과로 넘어갑니다.
     실서버 응답이 애니메이션보다 오래 걸려도 화면이 멈추지 않습니다. */
  useEffect(() => {
    if (stage === "loading" && animDone && analysis) setStage("result");
  }, [stage, animDone, analysis]);

  const navigate = (sec) => {
    setSection(sec);
    window.scrollTo(0, 0);
  };

  const startAnalysis = async (t) => {
    setText(t);
    setInitial({});
    setAnalysis(null);
    setAnimDone(false);
    setStage("loading");
    const data = await analyzeText(t);
    setAnalysis(data);
  };

  const handleSave = (entry) => {
    saveAnalysis(entry);
    refresh();
  };

  /* 저장된 항목은 원본 분석을 다시 받아 수정 내용만 덮어 복원합니다. */
  const loadSaved = async (item) => {
    const fresh = await analyzeText(item.text);
    const nodes = applyLayout(
      fresh.nodes.map((n) =>
        item.editedNodes && item.editedNodes[n.id] ? { ...n, text: item.editedNodes[n.id] } : n
      )
    );
    setAnalysis({ ...fresh, nodes });
    setText(item.text);
    setInitial({ resolved: item.resolved || [], editedIds: item.editedIds || [] });
    setAnimDone(true);
    setStage("result");
    setSection("verify");
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <Nav section={section} onNavigate={navigate} savedCount={items.length} />

      {section === "home" && (
        <Landing onStart={() => navigate("verify")} onIntro={() => navigate("intro")} />
      )}
      {section === "intro" && <Intro onStart={() => navigate("verify")} />}

      {section === "verify" && stage === "input" && <VerifyInput onAnalyze={startAnalysis} />}
      {section === "verify" && stage === "loading" && <Loading onDone={() => setAnimDone(true)} />}
      {section === "verify" && stage === "result" && analysis && (
        <Result
          key={text + JSON.stringify(initial)}
          text={text}
          analysis={analysis}
          initial={initial}
          onReset={() => setStage("input")}
          onSave={handleSave}
        />
      )}

      {section === "pipeline" && <Pipeline />}

      {section === "archive" && (
        <Archive
          items={items}
          onLoad={loadSaved}
          onDelete={(savedAt) => { deleteAnalysis(savedAt); refresh(); }}
        />
      )}
    </div>
  );
}
