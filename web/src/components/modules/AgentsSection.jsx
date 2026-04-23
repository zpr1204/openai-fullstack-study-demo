import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function AgentsSection({ setError }) {
  const [question, setQuestion] = useState(
    "我已经会 React 和 Node，想转 AI 全栈，应该先学前端聊天 UI 还是先学后端 tools / agents？"
  );
  const [agentResult, setAgentResult] = useState(null);

  async function runAgentExample() {
    setError("");
    const data = await requestJson("/api/examples/agents", {
      method: "POST",
      body: JSON.stringify({ question })
    });
    setAgentResult(data);
  }

  return (
    <SectionCard
      title="6. Agents SDK 专家分流"
      subtitle="Agents Quickstart"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解 Agent SDK 和普通单次模型调用的差异",
        "学会 triage agent 把问题 handoff 给 specialist agent",
        "适合做多角色顾问、任务分流、复杂工作流入口"
      ]}
    >
      <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
      <button onClick={runAgentExample}>运行 Agents 示例</button>
      {agentResult ? (
        <>
          <OutputPanel label="最终回答" value={agentResult.outputText} />
          <OutputPanel label="被路由到的 Agent" value={agentResult.lastAgentName} />
        </>
      ) : null}
    </SectionCard>
  );
}
