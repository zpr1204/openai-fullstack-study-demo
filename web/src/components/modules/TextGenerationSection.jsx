import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function TextGenerationSection({ setError }) {
  const [textPrompt, setTextPrompt] = useState(
    "请用中文解释：纯 LLM 调用适合解决哪些问题？"
  );
  const [textResult, setTextResult] = useState(null);

  async function runTextExample() {
    setError("");
    const data = await requestJson("/api/examples/text", {
      method: "POST",
      body: JSON.stringify({ prompt: textPrompt })
    });
    setTextResult(data);
  }

  return (
    <SectionCard
      title="1. 纯 LLM 问答"
      subtitle="LLM Basics"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解最基本的 prompt -> response 流程",
        "这个示例不做检索，回答只依赖模型参数知识",
        "适合先把提示词、system / user 角色和返回结构学明白"
      ]}
    >
      <textarea value={textPrompt} onChange={(event) => setTextPrompt(event.target.value)} />
      <button onClick={runTextExample}>运行纯 LLM 示例</button>
      {textResult ? (
        <>
          <OutputPanel label="模型输出" value={textResult.outputText} />
          <OutputPanel label="知识边界" value={textResult.knowledgeBoundary} />
        </>
      ) : null}
    </SectionCard>
  );
}
