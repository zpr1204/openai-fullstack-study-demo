import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function StructuredSection({ setError }) {
  const [topic, setTopic] = useState("React 开发者转型 AI 全栈");
  const [structuredResult, setStructuredResult] = useState(null);

  async function runStructuredExample() {
    setError("");
    const data = await requestJson("/api/examples/structured", {
      method: "POST",
      body: JSON.stringify({ topic })
    });
    setStructuredResult(data.parsed);
  }

  return (
    <SectionCard
      title="2. 结构化 JSON 输出"
      subtitle="Structured Outputs"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解为什么生产环境更推荐 schema 约束",
        "学会 zod + openai/helpers/zod 的组合",
        "适合做表单抽取、工作流编排、稳定接口返回"
      ]}
    >
      <input value={topic} onChange={(event) => setTopic(event.target.value)} />
      <button onClick={runStructuredExample}>生成结构化学习计划</button>
      {structuredResult ? <OutputPanel label="结构化结果" value={structuredResult} /> : null}
    </SectionCard>
  );
}
