# OpenAI API 学习型全栈示例

这是一个给 `React + Node` 开发者准备的 OpenAI API 入门项目。

它的目标不是只给你一个能跑的 demo，而是让你通过“前端页面 + 后端接口 + 中文注释 + 官方文档链接”快速建立完整认知：

- 前端如何调用自己的 Node 服务
- Node 服务如何通过 `Egg.js` 安全地调用 OpenAI API
- 纯 LLM、Structured Outputs、Function Calling、MCP、Agents SDK、Streaming、Embeddings、RAG 分别解决什么问题
- 一个 AI 全栈项目应该怎么拆前后端职责

## 你会学到什么

这个项目包含 9 个核心示例：

1. 纯 LLM 问答：理解最简单的 prompt -> output，以及“不检索时”模型怎么工作。
2. 结构化输出：让模型稳定返回 JSON，适合工作流和后端接口。
3. 函数调用：让模型决定何时调用你自己的工具函数。
4. MCP 工具接入：理解如何通过 OpenAI Docs MCP server 给模型接入远程工具。
5. 多轮对话状态：用 `previous_response_id` 串起上下文。
6. Agents SDK 专家分流：理解 triage agent 如何把问题路由给 specialist agent。
7. 流式输出：适合聊天 UI、长内容逐步渲染。
8. 向量 Embeddings：理解 RAG / 语义检索的基础，只做“找资料”。
9. RAG 检索增强：把“先检索，再生成”完整串起来。

另外还附带 1 个独立页面：

- `Vercel AI SDK Chat`：使用 `@ai-sdk/react` 的 `useChat` 和 Egg 流式接口，做一个最小聊天页，适合理解“前端聊天状态 + 后端流式响应”。

## 项目结构

```text
.
├── app/
│   ├── controller/
│   │   └── api.js
│   ├── public/
│   │   └── (Vite build 输出)
│   ├── router.js
│   └── service/
│       └── openai.js
├── config/
│   └── config.default.js
├── docs/
│   └── openai-api-study-guide.md
├── web/
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   └── modules/
│       ├── lib/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── .env.example
├── package.json
└── vite.config.mjs
```

## 启动方式

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

然后把 `.env` 里的 `OPENAI_API_KEY` 改成你自己的 Key。

3. 启动开发环境

```bash
npm run dev
```

启动后：

- 前端页面默认在 `http://localhost:5173`
- Egg API 默认在 `http://localhost:7001`
- Vercel AI SDK 聊天页在 `http://localhost:5173/vercel-ai-chat`

## 推荐阅读顺序

如果你是从前端 / Node 全栈转 AI 全栈，我建议这样学：

1. 先看 [app/router.js](/Users/zengpiaorong/flat/openai/app/router.js) 怎么把接口挂出来
2. 再看 [app/controller/api.js](/Users/zengpiaorong/flat/openai/app/controller/api.js) 怎么保持 Controller 轻量
3. 然后看 [app/service/openai.js](/Users/zengpiaorong/flat/openai/app/service/openai.js) 里的 OpenAI 调用细节
4. 最后看 [web/src/App.jsx](/Users/zengpiaorong/flat/openai/web/src/App.jsx) 怎么组装页面
5. 页面模块拆分后，可以分别阅读：
   [TextGenerationSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/TextGenerationSection.jsx)
   [StructuredSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/StructuredSection.jsx)
   [FunctionCallingSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/FunctionCallingSection.jsx)
   [McpSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/McpSection.jsx)
   [ConversationSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/ConversationSection.jsx)
   [AgentsSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/AgentsSection.jsx)
   [StreamingSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/StreamingSection.jsx)
   [EmbeddingsSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/EmbeddingsSection.jsx)
   [RagSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/RagSection.jsx)

这样会更符合“先会调用，再会约束，再会接工具，再会做产品”的学习曲线。

如果你想专门学聊天产品的最小实现，可以直接看：

- 前端路由：`/vercel-ai-chat`
- [VercelAiChatPage.jsx](/Users/zengpiaorong/flat/openai/web/src/pages/VercelAiChatPage.jsx)
- [app/controller/api.js](/Users/zengpiaorong/flat/openai/app/controller/api.js)
- [app/service/openai.js](/Users/zengpiaorong/flat/openai/app/service/openai.js)

## 模型选择建议

下面这些建议基于我在 **2026-04-22** 查到的 OpenAI 官方文档：

- OpenAI 官方 Models 页面目前写的是：如果你不确定选什么，先从 `gpt-5.4` 开始；如果你更关心延迟和成本，可以选 `gpt-5.4-mini` 或 `gpt-5.4-nano`。
- OpenAI 官方 Compare Models 页面显示：`gpt-5.4-mini` 支持 `Streaming`、`Function calling`、`Structured outputs` 和 `Image input`。
- Embeddings 方面，`text-embedding-3-small` 更便宜，适合入门；`text-embedding-3-large` 更强，适合效果优先的检索场景。

因此这个学习项目默认使用：

- 文本模型：`gpt-5.4-mini`
- 向量模型：`text-embedding-3-small`

## 关键知识点

### 1. 纯 LLM 和 RAG 的最直观区别是什么？

- 纯 LLM：直接把问题发给模型，回答主要依赖模型参数知识和当前提示词。
- RAG：先从你的知识库里找资料，再把资料和问题一起发给模型回答。

所以两者最大的差别，不是“是不是用了大模型”，而是“回答前有没有先查资料”。

### 2. 为什么后端调用 OpenAI，而不是前端直接调？

因为 API Key 不能暴露在浏览器里。  
前端应该请求你自己的 Egg 服务，再由服务端安全地调用 OpenAI。

### 3. 为什么优先学 Responses API？

官方已经把它作为新项目推荐的统一入口。  
它更适合多轮对话、结构化输出、工具调用、流式输出这些真实业务场景。

### 4. Function Calling 和 MCP 的区别是什么？

- Function Calling：工具定义在你自己的后端代码里，由你自己执行。
- MCP：工具定义在远程 MCP server 或 connector 里，由模型通过 MCP 协议接入。

如果你只是给模型接自己项目里的本地函数，先学 Function Calling 就够了。  
如果你要接第三方能力、远程工具系统、标准化工具协议，就应该补 MCP。

### 5. Function Calling 的本质是什么？

不是“模型直接执行函数”，而是：

1. 模型先告诉你它想调用哪个函数
2. 你在后端真正执行函数
3. 再把函数结果回传给模型
4. 模型基于这个结果继续生成自然语言回答

### 6. 这个项目里的 MCP demo 做了什么？

1. 通过 `tools` 参数注册一个 `type: "mcp"` 的远程工具
2. 指向 OpenAI 官方托管的 Docs MCP server
3. 让模型自动导入文档查询工具
4. 执行一次真实的 `mcp_call`
5. 前端把 `mcp_list_tools` 和 `mcp_call` 一起展示出来

这个示例很适合你理解：MCP 不只是概念，它在 Responses API 里就是一种特殊的工具接入方式。

### 7. Embeddings 的本质是什么？

把文本转成向量，然后用“距离 / 相似度”衡量文本之间是否接近。  
RAG 的第一步往往不是“问模型”，而是“先找相关资料”。

### 8. 这个项目里的 RAG demo 做了什么？

1. 准备一组本地知识片段
2. 把用户问题和知识片段一起做 embeddings
3. 按相似度找出最相关的 3 段内容
4. 把这 3 段内容拼进 prompt
5. 再调用模型生成最终回答

这是一套最小可理解、最适合入门的 RAG 实现。

### 9. Vercel AI SDK 聊天页值得看什么？

1. 前端用 `useChat` 管理消息状态
2. 输入框文本自己用 React `useState` 管理
3. `DefaultChatTransport` 指向你自己的 Egg 接口
4. 后端用 `streamText` 产生流式结果
5. 再通过 `pipeUIMessageStreamToResponse` 把消息流直接写回浏览器

这页特别适合你理解：聊天产品不只是“调一下模型”，而是前后端一起维护流式会话体验。

## 官方文档索引

- [Quickstart](https://platform.openai.com/docs/quickstart/overview/getting-started)
- [Models](https://developers.openai.com/api/docs/models)
- [Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript)
- [Function Calling](https://developers.openai.com/api/docs/guides/function-calling)
- [Docs MCP](https://platform.openai.com/docs/docs-mcp)
- [MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [Agents Quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart)
- [Streaming](https://platform.openai.com/docs/guides/streaming-responses)
- [Embeddings](https://developers.openai.com/api/docs/models/text-embedding-3-small)
- [Vercel AI SDK Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [Vercel AI SDK OpenAI Provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai)

## 下一步你可以怎么练

等你把这套代码跑起来后，我建议继续练 3 个方向：

1. 把函数调用接到你自己的数据库或搜索接口上
2. 把 MCP 示例换成你自己的远程 MCP server 或 GitHub MCP
3. 把当前 RAG 示例升级成“用户上传文档 + 自动切 chunk”的版本

这三步做完，你就已经不是“只会调 API”，而是开始进入 AI 全栈产品开发了。
