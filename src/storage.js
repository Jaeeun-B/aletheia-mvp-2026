/* 분석 결과 보관함
 * localStorage를 기본으로 쓰고, 사생활 보호 모드처럼 접근이 막힌 환경에서는
 * 세션 메모리로 대체해 저장 동작이 조용히 실패하지 않도록 합니다.
 * 실서버 연동 후에는 사용자 계정 기반 DB로 교체할 자리입니다.
 */

const KEY = "aletheia-archive";
let memory = null;

function available() {
  try {
    localStorage.setItem("__t", "1");
    localStorage.removeItem("__t");
    return true;
  } catch (e) {
    return false;
  }
}

export function listAnalyses() {
  if (!available()) return memory || [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function write(items) {
  if (!available()) {
    memory = items;
    return;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {
    memory = items;
  }
}

export function saveAnalysis(entry) {
  const items = listAnalyses();
  items.unshift({ savedAt: Date.now(), ...entry });
  write(items);
  return items;
}

export function deleteAnalysis(savedAt) {
  const items = listAnalyses().filter((it) => it.savedAt !== savedAt);
  write(items);
  return items;
}
