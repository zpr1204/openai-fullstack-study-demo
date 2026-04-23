import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function EmbeddingsSection({ setError }) {
  const [embeddingQuery, setEmbeddingQuery] = useState(
    "我想做一个基于知识库问答的 AI 应用"
  );
  const [embeddingResult, setEmbeddingResult] = useState(null);

  async function runEmbeddingExample() {
    setError("");
    const data = await requestJson("/api/examples/embeddings", {
      method: "POST",
      body: JSON.stringify({ query: embeddingQuery })
    });
    setEmbeddingResult(data);
  }

  return (
    <SectionCard
      title="8. 向量 Embeddings"
      subtitle="Semantic Search"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解 embedding 是文本的向量表示",
        "学会 query 与文档向量的相似度比较",
        "这里只做检索排序，它是 RAG 的底层基石，但还不是完整 RAG"
      ]}
    >
      <input
        value={embeddingQuery}
        onChange={(event) => setEmbeddingQuery(event.target.value)}
      />
      <button onClick={runEmbeddingExample}>运行向量检索</button>
      {embeddingResult ? <OutputPanel label="相似度排序" value={embeddingResult} /> : null}
    </SectionCard>
  );
}
