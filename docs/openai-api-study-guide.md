# OpenAI API 中文学习指南

这份文档是配合项目代码一起看的，建议你一边看页面，一边对照 `app/controller/api.js` 和 `app/service/openai.js`。

## 一、AI 全栈项目的最小分层

对于 `React + Node` 技术栈，做 OpenAI 项目时可以先理解成三层：

1. React 前端：负责界面、表单、聊天消息、流式渲染。
2. Egg 后端：负责鉴权、提示词拼装、OpenAI SDK 调用、业务逻辑。
3. OpenAI API：负责生成、推理、结构化输出、向量化、工具决策。

最重要的安全原则：

- `OPENAI_API_KEY` 只应该放在后端环境变量里。
- 浏览器不能直接暴露私钥。

## 二、最值得先学的 7 个能力

### 1. 文本生成

文件位置：`app/service/openai.js` 的 `createText`

你要理解的是：

- `model` 决定能力、价格、延迟
- `system` 消息通常负责角色和输出风格
- `user` 消息通常负责真正需求
- 返回值里最常直接使用的是 `response.output_text`

### 2. 结构化输出

文件位置：`app/service/openai.js` 的 `createStructured`

为什么重要：

- 真实业务经常不需要“文学回答”，而需要稳定 JSON
- 前端和后端更容易消费结构化数据
- 适合表单抽取、工单分类、流程编排、内容审核结果返回

### 3. 函数调用

文件位置：`app/service/openai.js` 的 `createFunctionCalling`

标准流程：

1. 先定义 `tools`
2. 把 `tools` 发给模型
3. 模型返回 `function_call`
4. 后端执行真正函数
5. 用 `function_call_output` 把结果传回模型
6. 再拿最终自然语言结果

### 4. 会话状态

文件位置：`app/service/openai.js` 的 `createConversation`

你需要重点理解：

- 没有状态时，每次请求都像单发 RPC
- 用 `previous_response_id` 可以把多轮上下文串起来
- 这对聊天助手、AI Copilot、工作流追问很关键

### 5. Agents SDK

文件位置：`app/service/openai.js` 的 `createAgentExample`

为什么值得单独学：

- 它不是简单“多调几次模型”，而是把工作流拆成多个角色
- 可以用 triage agent 把问题路由给 specialist agent
- 适合做复杂顾问系统、任务分流、多角色协作入口

### 6. 流式输出

文件位置：`app/controller/api.js` 的 `stream` + `app/service/openai.js` 的 `createTextStream`

为什么前端最该学：

- 用户不用干等整段回答生成完
- 可以逐步渲染，提高交互体验
- 聊天产品几乎都会用到

### 7. Embeddings

文件位置：`app/service/openai.js` 的 `createEmbeddings`

你需要知道：

- embedding 不是答案，而是向量表示
- 它最常用于“先找相关内容，再让大模型回答”
- 所以它是 RAG、知识库问答、搜索增强的地基

## 三、学 OpenAI 的建议顺序

如果你现在是 React + Node 开发者，建议按这个顺序学：

1. `Responses API`
2. `Structured Outputs`
3. `Function Calling`
4. `Agents SDK`
5. `Streaming`
6. `Embeddings`
7. 再往上做 RAG / 更复杂的工作流

原因很简单：

- 前 4 个更接近日常产品功能和工程组织
- Embeddings 会带你进入检索和知识库
- 最后你再做更复杂的工作流，会更知道“工具、上下文、状态、handoff”分别在解决什么

## 四、官方文档中的重点结论

基于 **2026-04-22** 检索到的官方文档：

- Models 页面建议：如果不确定从哪个模型开始，先看 `gpt-5.4`；如果更看重成本和速度，可以用 `gpt-5.4-mini` 或 `gpt-5.4-nano`。
- Compare Models 页面显示：`gpt-5.4-mini` 支持 `Streaming`、`Function calling`、`Structured outputs` 和 `Image input`。
- Embeddings 模型里：`text-embedding-3-small` 更便宜，适合入门和大多数原型；`text-embedding-3-large` 更强，适合效果优先。

## 五、建议你接下来做的 3 个升级练习

### 练习 1：做一个最小聊天页

- 把文本生成和流式输出合并成一个聊天对话框
- 给每条消息加 role
- 让前端能看到“用户消息”和“AI 消息”

### 练习 2：做一个最小知识库问答

- 用户上传几段文本
- 后端把文本做 embeddings
- 用户提问时先做相似度召回
- 再把召回结果拼进 prompt 调用模型

### 练习 3：把函数调用接到真实业务

- 可以接 Notion、数据库、商品系统、订单系统、CMS
- 这样你就会真正体会到 AI 和业务系统集成的方式

## 六、对转型 AI 全栈的一个现实建议

你不需要一开始就学“特别大的 Agent 框架”。

对你这种 `React + Node` 背景来说，最划算的路线通常是：

1. 先把 OpenAI 基础调用吃透
2. 再把流式 UI、结构化 JSON、函数调用做好
3. 然后补 embeddings / RAG
4. 最后再进入 Agent、自动化、多工具编排

因为企业真正需要的人，往往不是“只会喊 Agent 概念”的人，而是能把 AI 稳定接进已有产品的人。
