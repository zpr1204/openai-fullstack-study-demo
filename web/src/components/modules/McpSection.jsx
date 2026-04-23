import { useState } from "react";
import OutputPanel from "../common/OutputPanel.jsx";
import SectionCard from "../common/SectionCard.jsx";
import { requestJson } from "../../lib/api.js";

export default function McpSection({ setError }) {
  const [question, setQuestion] = useState(
    "请先用 MCP 工具查一下 Responses API 是什么，再用中文总结给一名前端开发者听。"
  );
  const [mcpResult, setMcpResult] = useState(null);

  async function runMcpExample() {
    setError("");
    const data = await requestJson("/api/examples/mcp", {
      method: "POST",
      body: JSON.stringify({ question })
    });
    setMcpResult(data);
  }

  return (
    <SectionCard
      title="4. MCP 工具接入"
      subtitle="Remote MCP Server"
      path="app/controller/api.js + app/service/openai.js"
      points={[
        "理解 MCP 是如何把远程工具能力接进 Responses API 的",
        "这个示例讲的是 API 里的远程 MCP server，不是编辑器里的 Docs MCP",
        "这里接的是 OpenAI 官方 Docs MCP server，适合先学读文档型 MCP"
      ]}
    >
      <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
      <button onClick={runMcpExample}>运行 MCP 示例</button>
      <p className="tiny">
        当前示例使用 OpenAI 官方托管的 Docs MCP server，会返回 `mcp_list_tools`
        和 `mcp_call` 的学习信息。
      </p>
      {mcpResult ? (
        <>
          <OutputPanel label="模型最终回答" value={mcpResult.outputText} />
          <OutputPanel label="当前状态" value={mcpResult.status} />
          <OutputPanel label="MCP 服务器配置" value={mcpResult.mcpServer} />
          <OutputPanel label="导入到模型的工具" value={mcpResult.importedTools} />
          <OutputPanel label="实际 MCP 调用记录" value={mcpResult.mcpCalls} />
          {mcpResult.serverError ? (
            <OutputPanel label="远程调用提示" value={mcpResult.serverError} />
          ) : null}
          <OutputPanel label="执行流程" value={mcpResult.workflow} />
          <OutputPanel label="学习重点" value={mcpResult.learningPoints} />
        </>
      ) : null}
    </SectionCard>
  );
}
