import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function RagSection({ setError }) {
  const [question, setQuestion] = useState(
    "RAG 和直接让 LLM 回答，到底差别在哪里？"
  );
  const [ragResult, setRagResult] = useState(null);

  async function runRagExample() {
    setError("");
    const data = await requestJson("/api/examples/rag", {
      method: "POST",
      body: JSON.stringify({ question })
    });
    setRagResult(data);
  }

  return (
    <SectionCard
      title="9. RAG 检索增强"
      subtitle="Embeddings + Responses API"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "先做向量检索，再把命中的知识片段交给大模型回答",
        "这是知识库问答、企业文档助手最常见的最小实现",
        "当前 demo 用的是本地内存知识片段，方便先理解流程"
      ]}
    >
      <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
      <button onClick={runRagExample}>运行 RAG 示例</button>
      <p className="tiny">你会同时看到最终回答和命中的知识片段，方便理解检索增强到底增强了什么。</p>
      {ragResult ? (
        <>
          <OutputPanel label="RAG 回答" value={ragResult.outputText} />
          <OutputPanel label="召回片段" value={ragResult.retrievedChunks} />
          <OutputPanel label="执行流程" value={ragResult.workflow} />
        </>
      ) : null}
    </SectionCard>
  );
}
