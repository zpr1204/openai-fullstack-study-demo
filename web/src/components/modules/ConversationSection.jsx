import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function ConversationSection({ setError }) {
  const [sessionId, setSessionId] = useState("");
  const [conversationMessage, setConversationMessage] = useState(
    "请记住：我是 React + Node 开发者，目标是转 AI 全栈。"
  );
  const [conversationResult, setConversationResult] = useState(null);

  async function runConversationExample(reset = false) {
    setError("");
    const data = await requestJson("/api/examples/conversation", {
      method: "POST",
      body: JSON.stringify({
        message: conversationMessage,
        sessionId,
        reset
      })
    });

    setSessionId(data.sessionId);
    setConversationResult(data);
  }

  return (
    <SectionCard
      title="4. 多轮对话状态"
      subtitle="Conversation State"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解 previous_response_id 的作用",
        "让服务端不用每次手动拼全部历史消息",
        "适合聊天产品、Copilot、AI 助手场景"
      ]}
    >
      <textarea
        value={conversationMessage}
        onChange={(event) => setConversationMessage(event.target.value)}
      />
      <div className="button-row">
        <button onClick={() => runConversationExample(false)}>继续当前会话</button>
        <button className="ghost" onClick={() => runConversationExample(true)}>
          新开一轮会话
        </button>
      </div>
      <p className="tiny">当前 sessionId: {sessionId || "还没生成"}</p>
      {conversationResult ? <OutputPanel label="会话结果" value={conversationResult} /> : null}
    </SectionCard>
  );
}
