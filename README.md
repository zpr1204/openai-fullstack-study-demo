# OpenAI API 学习型全栈示例

这是一个给 `React + Node` 开发者准备的 OpenAI API 入门项目。

它的目标不是只给你一个能跑的 demo，而是让你通过“前端页面 + 后端接口 + 中文注释 + 官方文档链接”快速建立完整认知：

- 前端如何调用自己的 Node 服务
- Node 服务如何通过 `Egg.js` 安全地调用 OpenAI API
- Responses API、Structured Outputs、Function Calling、Agents SDK、Streaming、Embeddings 分别解决什么问题
- 一个 AI 全栈项目应该怎么拆前后端职责

## 你会学到什么

这个项目包含 7 个核心示例：

1. 基础文本生成：理解最简单的 prompt -> output。
2. 结构化输出：让模型稳定返回 JSON，适合工作流和后端接口。
3. 函数调用：让模型决定何时调用你自己的工具函数。
4. 多轮对话状态：用 `previous_response_id` 串起上下文。
5. Agents SDK 专家分流：理解 triage agent 如何把问题路由给 specialist agent。
6. 流式输出：适合聊天 UI、长内容逐步渲染。
7. 向量 Embeddings：理解 RAG / 语义检索的基础。

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
   [ConversationSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/ConversationSection.jsx)
   [AgentsSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/AgentsSection.jsx)
   [StreamingSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/StreamingSection.jsx)
   [EmbeddingsSection.jsx](/Users/zengpiaorong/flat/openai/web/src/components/modules/EmbeddingsSection.jsx)

这样会更符合“先会调用，再会约束，再会接工具，再会做产品”的学习曲线。

## 模型选择建议

下面这些建议基于我在 **2026-04-22** 查到的 OpenAI 官方文档：

- OpenAI 官方 Models 页面目前写的是：如果你不确定选什么，先从 `gpt-5.4` 开始；如果你更关心延迟和成本，可以选 `gpt-5.4-mini` 或 `gpt-5.4-nano`。
- OpenAI 官方 Compare Models 页面显示：`gpt-5.4-mini` 支持 `Streaming`、`Function calling`、`Structured outputs` 和 `Image input`。
- Embeddings 方面，`text-embedding-3-small` 更便宜，适合入门；`text-embedding-3-large` 更强，适合效果优先的检索场景。

因此这个学习项目默认使用：

- 文本模型：`gpt-5.4-mini`
- 向量模型：`text-embedding-3-small`

## 关键知识点

### 1. 为什么后端调用 OpenAI，而不是前端直接调？

因为 API Key 不能暴露在浏览器里。  
前端应该请求你自己的 Egg 服务，再由服务端安全地调用 OpenAI。

### 2. 为什么优先学 Responses API？

官方已经把它作为新项目推荐的统一入口。  
它更适合多轮对话、结构化输出、工具调用、流式输出这些真实业务场景。

### 3. Function Calling 的本质是什么？

不是“模型直接执行函数”，而是：

1. 模型先告诉你它想调用哪个函数
2. 你在后端真正执行函数
3. 再把函数结果回传给模型
4. 模型基于这个结果继续生成自然语言回答

### 4. Embeddings 的本质是什么？

把文本转成向量，然后用“距离 / 相似度”衡量文本之间是否接近。  
RAG 的第一步往往不是“问模型”，而是“先找相关资料”。

## 官方文档索引

- [Quickstart](https://platform.openai.com/docs/quickstart/overview/getting-started)
- [Models](https://developers.openai.com/api/docs/models)
- [Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs?lang=javascript)
- [Function Calling](https://developers.openai.com/api/docs/guides/function-calling)
- [Agents Quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart)
- [Streaming](https://platform.openai.com/docs/guides/streaming-responses)
- [Embeddings](https://developers.openai.com/api/docs/models/text-embedding-3-small)

## 下一步你可以怎么练

等你把这套代码跑起来后，我建议继续练 3 个方向：

1. 把函数调用接到你自己的数据库或搜索接口上
2. 把 embeddings 示例升级成一个最小 RAG
3. 把流式输出接成真正的聊天窗口，并加入历史会话管理

这三步做完，你就已经不是“只会调 API”，而是开始进入 AI 全栈产品开发了。
