import { Link } from "react-router-dom";

function getSummaryText(health) {
  if (!health) {
    return "正在检查本地服务状态...";
  }

  if (!health.apiKeyConfigured) {
    return "服务已启动，但还没配置 OPENAI_API_KEY。你可以先看代码和页面结构，填完 Key 后再测试。";
  }

  return `当前默认文本模型是 ${health.textModel}，默认向量模型是 ${health.embeddingModel}。`;
}

export default function HeroSection({ health }) {
  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">OpenAI API 学习型项目</p>
        <h1>面向 React + Node 开发者的 AI 全栈入门样板</h1>
        <p className="hero-text">
          这个页面不是单纯的 demo，而是一份可运行的学习地图。现在后端已经切到
          Egg.js，你可以一边点按钮测试接口，一边对照 Controller / Service 的分层理解每个知识点。
        </p>
        <div className="hero-actions">
          <Link className="link-pill" to="/vercel-ai-chat">
            打开 Vercel AI SDK 聊天页
          </Link>
        </div>
      </div>
      <aside className="hero-panel">
        <div className="status-pill">
          {health?.apiKeyConfigured ? "API Key 已配置" : "等待配置 API Key"}
        </div>
        <p>{getSummaryText(health)}</p>
        <p className="tiny">
          依据 OpenAI 官方 Models 页面，当前优先推荐从 GPT-5.4 系列开始；本项目默认用
          `gpt-5.4-mini`，更适合入门时兼顾成本和速度。
        </p>
      </aside>
    </header>
  );
}
