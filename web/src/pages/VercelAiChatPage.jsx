import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Link } from "react-router-dom";

const samplePrompts = [
  "我会 React 和 Node，想转 AI 全栈，应该先学什么？",
  "请用中文解释 Vercel AI SDK 里的 useChat 做了什么。",
  "请给我一个前端工程师学习流式聊天 UI 的 3 步路线图。"
];

function renderMessageText(message) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export default function VercelAiChatPage() {
  // useChat 负责“消息状态 + 流式接收 + 请求生命周期”。
  // 但输入框文本本身，在 AI SDK 6 里推荐你自己用 React state 管。
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/vercel-ai/chat"
    })
  });
  const [input, setInput] = useState("请介绍一下 Vercel AI SDK 的 useChat 是做什么的。");

  function submitCurrentInput(event) {
    event.preventDefault();

    if (!input.trim() || status !== "ready") {
      return;
    }

    // sendMessage 会把当前输入转成一条 user message，
    // 然后交给后端接口，后端再开始把 AI 回复流式推回来。
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <main className="chat-page-shell">
      <header className="chat-page-header">
        <p className="eyebrow">Vercel AI SDK + React</p>
        <h1>简单聊天页学习示例</h1>
        <p className="hero-text">
          这个页面重点不是花哨 UI，而是帮你把 `useChat`、`DefaultChatTransport`、
          Egg 后端流式接口、以及 OpenAI 模型调用这条链路一次看明白。
        </p>
        <div className="hero-actions">
          <Link className="link-pill" to="/">
            返回学习总览
          </Link>
        </div>
      </header>

      <section className="chat-page-main">
        <aside className="chat-side">
          <article className="chat-tip-card">
            <p className="eyebrow">学习重点</p>
            <h2>这一页你要看什么</h2>
            <ul>
              <li>`useChat` 负责消息状态和流式过程，不再帮你管理 input state。</li>
              <li>`DefaultChatTransport` 负责把聊天请求发到你自己的后端接口。</li>
              <li>后端用 `streamText` 生成流，再把 UIMessage SSE 回推给前端。</li>
            </ul>
          </article>

          <article className="chat-tip-card">
            <p className="eyebrow">示例问题</p>
            <h2>点一下就能测试</h2>
            <div className="chat-sample-list">
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="ghost"
                  type="button"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </article>

          <article className="chat-tip-card">
            <p className="eyebrow">状态提示</p>
            <h2>当前请求状态</h2>
            <div className="status-chip">{status}</div>
            <p className="tiny">
              `ready` 表示可以继续发送，`submitted` / `streaming`
              表示后端正在处理或持续返回内容。
            </p>
          </article>
        </aside>

        <section className="chat-panel">
          <div>
            <p className="eyebrow">聊天线程</p>
            <h2>AI SDK Chat UI</h2>
          </div>

          <div className="chat-thread">
            {messages.length === 0 ? (
              <div className="chat-empty">
                这里还没有消息。你可以直接发送下面输入框里的默认问题，先观察一次完整的流式聊天过程。
              </div>
            ) : null}

            {messages.map((message) => (
              <article
                key={message.id}
                className={`chat-message ${message.role === "user" ? "user" : "assistant"}`}
              >
                <div className="chat-message-header">
                  <span className="chat-role">
                    {message.role === "user" ? "用户" : "AI"}
                  </span>
                </div>
                <div className="chat-parts">
                  <div className="chat-part">{renderMessageText(message) || "..."}</div>
                </div>
              </article>
            ))}
          </div>

          {error ? (
            <div className="error-banner">
              请求失败：{error.message || "后端流式接口返回了异常。"}
            </div>
          ) : null}

          <form className="composer-card" onSubmit={submitCurrentInput}>
            <label className="eyebrow" htmlFor="vercel-ai-chat-input">
              输入问题
            </label>
            <textarea
              id="vercel-ai-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={status !== "ready"}
              placeholder="请输入你想问 AI 的问题"
            />
            <div className="composer-actions">
              <button type="submit" disabled={status !== "ready" || !input.trim()}>
                {status === "ready" ? "发送消息" : "处理中..."}
              </button>
              <button
                className="ghost"
                type="button"
                disabled={status !== "submitted" && status !== "streaming"}
                onClick={() => stop()}
              >
                停止生成
              </button>
              <span className="tiny">
                这个停止按钮对应 `useChat` 返回的 `stop()`，用于中断当前流式响应。
              </span>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
