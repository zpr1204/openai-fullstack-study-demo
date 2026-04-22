import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function FunctionCallingSection({ setError }) {
  const [question, setQuestion] = useState(
    "我准备做一个 AI 学习产品，想知道 structured outputs 和 embeddings 该怎么学。"
  );
  const [functionResult, setFunctionResult] = useState(null);

  async function runFunctionExample() {
    setError("");
    const data = await requestJson("/api/examples/function-calling", {
      method: "POST",
      body: JSON.stringify({ question })
    });
    setFunctionResult(data);
  }

  return (
    <SectionCard
      title="3. 函数调用"
      subtitle="Function Calling"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解模型不是直接执行函数，而是先生成 tool call",
        "后端负责真正调用业务逻辑，再把结果喂回模型",
        "这是 AI 接数据库、搜索、业务系统的基础能力"
      ]}
    >
      <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
      <button onClick={runFunctionExample}>运行函数调用</button>
      {functionResult ? <OutputPanel label="工具调用结果" value={functionResult} /> : null}
    </SectionCard>
  );
}
