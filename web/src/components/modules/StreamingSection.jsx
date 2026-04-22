import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";

export default function StreamingSection({ setError }) {
  const [streamPrompt, setStreamPrompt] = useState(
    "请分 5 点说明：流式输出为什么适合前端聊天页面。"
  );
  const [streamText, setStreamText] = useState("");
  const [streaming, setStreaming] = useState(false);

  function runStreamExample() {
    setError("");
    setStreaming(true);
    setStreamText("");

    const url = `/api/examples/stream?prompt=${encodeURIComponent(streamPrompt)}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener("chunk", (event) => {
      const payload = JSON.parse(event.data);
      setStreamText((current) => current + payload.delta);
    });

    eventSource.addEventListener("done", () => {
      setStreaming(false);
      eventSource.close();
    });

    eventSource.addEventListener("server-error", (event) => {
      const payload = event.data ? JSON.parse(event.data) : null;
      setError(payload?.message || "流式请求失败");
      setStreaming(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      setError("流式连接中断，请检查后端服务和 API Key。");
      setStreaming(false);
      eventSource.close();
    };
  }

  return (
    <SectionCard
      title="6. 流式输出"
      subtitle="Streaming"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解为什么聊天页面常用流式输出",
        "前端可以一边接收 token 一边渲染",
        "适合长回答、写作助手、聊天产品"
      ]}
    >
      <textarea value={streamPrompt} onChange={(event) => setStreamPrompt(event.target.value)} />
      <button onClick={runStreamExample} disabled={streaming}>
        {streaming ? "流式生成中..." : "开始流式输出"}
      </button>
      {streamText ? <OutputPanel label="流式结果" value={streamText} /> : null}
    </SectionCard>
  );
}
