import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function TextGenerationSection({ setError }) {
  const [textPrompt, setTextPrompt] = useState(
    "请用中文解释：为什么 Responses API 是现在的新项目首选？"
  );
  const [textResult, setTextResult] = useState("");

  async function runTextExample() {
    setError("");
    const data = await requestJson("/api/examples/text", {
      method: "POST",
      body: JSON.stringify({ prompt: textPrompt })
    });
    setTextResult(data.outputText);
  }

  return (
    <SectionCard
      title="1. 基础文本生成"
      subtitle="Responses API"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解最基本的 prompt -> response 流程",
        "学会为什么新项目优先选 Responses API",
        "感受 system + user 消息的基本结构"
      ]}
    >
      <textarea value={textPrompt} onChange={(event) => setTextPrompt(event.target.value)} />
      <button onClick={runTextExample}>运行文本生成</button>
      {textResult ? <OutputPanel label="模型输出" value={textResult} /> : null}
    </SectionCard>
  );
}
