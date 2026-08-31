/* Aletheia 디자인 토큰
 *
 * 브랜드 원색(c-*)은 그래픽 요소(그래프 선, 도트, 칩 배경, 노드 테두리)에만 사용합니다.
 * 흰 배경 위 텍스트와 흰 글자를 얹는 버튼에는 대비 4.6 이상을 확보한 어두운 변형을 씁니다.
 * (원색 5종은 모두 흰 배경 대비 2.0~4.0으로 본문 텍스트 기준 4.5에 미달합니다)
 */

export const T = {
  // 브랜드 원색
  cCyan: "#00b4e2",
  cOrange: "#fe6a03",
  cMagenta: "#da3ab3",
  cGreen: "#08ce7d",
  cRed: "#fe4338",

  // 텍스트 및 버튼용 변형
  blue: "#007e9e",
  blueDark: "#00637c",
  blueSoft: "#E4F6FC",
  orange: "#c35001",
  orangeSoft: "#FFF0E4",
  magenta: "#cc26a4",
  magentaSoft: "#FBEAF6",
  green: "#058450",
  greenSoft: "#E4FAF1",
  red: "#ea0e01",
  redSoft: "#FFEAE8",

  // 뉴트럴
  ink: "#191F28",
  sub: "#4E5968",
  faint: "#8B95A1",
  line: "#E5E8EB",
  bg: "#F9FAFB",
  fill: "#F2F4F6",
};

// 논증 요소별 칩 색상
export const NODE_STYLE = {
  Evidence: { chip: T.blueSoft, text: T.blue },
  Claim: { chip: T.orangeSoft, text: T.orange },
  Reasoning: { chip: T.magentaSoft, text: T.magenta },
  Conclusion: { chip: T.greenSoft, text: T.green },
};

// 추론 관계별 스타일 (color = 선, ink = 라벨 텍스트)
export const REL_STYLE = {
  support: { color: T.cGreen, ink: T.green, dash: "0", label: "지지" },
  weak: { color: T.cOrange, ink: T.orange, dash: "7 6", label: "약한 지지" },
  unsupported: { color: T.cOrange, ink: T.orange, dash: "7 6", label: "근거 부족" },
  contradiction: { color: T.cRed, ink: T.red, dash: "0", label: "모순" },
};
