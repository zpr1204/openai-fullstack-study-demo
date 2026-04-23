'use strict';

const { randomUUID } = require('node:crypto');
const Service = require('egg').Service;
const OpenAI = require('openai');
const { zodTextFormat } = require('openai/helpers/zod');
const { z } = require('zod');

const conversationSessions = new Map();
const ragKnowledgeBase = [
  {
    id: 'rag-1',
    title: 'LLM 适合做开放式生成',
    content:
      '纯 LLM 调用不查外部资料，主要依赖模型已有知识和提示词，适合文案生成、头脑风暴、总结改写。',
  },
  {
    id: 'rag-2',
    title: 'RAG 先检索，再生成',
    content:
      'RAG 的核心流程通常是：用户提问 -> 向量化查询 -> 召回相关片段 -> 把片段拼进 prompt -> 让模型基于片段回答。',
  },
  {
    id: 'rag-3',
    title: 'Embeddings 是 RAG 的召回基础',
    content:
      'Embeddings 会把文本映射成向量，系统通过比较 query 向量和文档向量的相似度，找出最相关的知识片段。',
  },
  {
    id: 'rag-4',
    title: 'RAG 更强调答案有依据',
    content:
      'RAG 的价值不只是回答问题，而是让回答尽量建立在你自己的知识库、文档和业务资料上，减少凭空发挥。',
  },
  {
    id: 'rag-5',
    title: '真实项目中的 RAG 还会继续升级',
    content:
      '真实项目通常还会增加 chunking、metadata、rerank、引用展示和向量数据库，但最小 demo 先掌握召回加上下文拼接就够了。',
  },
];
const mcpDemoServer = {
  server_label: 'openai_docs',
  server_description: 'OpenAI 官方托管的文档 MCP server，可用于搜索和读取开发者文档。',
  server_url: 'https://developers.openai.com/mcp',
  require_approval: 'never',
};

const learningResourceMap = {
  llm: [
    'LLM 示例先帮助你理解最基本的 prompt -> response 流程。',
    '它不接工具、不做检索，适合先把模型调用链路跑通。',
  ],
  responses: [
    'Responses API 是新项目优先推荐的统一接口。',
    '适合多轮对话、工具调用、结构化输出、流式输出。',
  ],
  structured: [
    'Structured Outputs 适合把模型输出稳定地约束成 JSON。',
    '在 Node 项目里常配合 zod 一起用，类型体验很好。',
  ],
  embeddings: [
    'Embeddings 常用于搜索、召回、RAG、推荐系统。',
    '向量本身不是答案，它更像是文本的坐标。',
  ],
  functionCalling: [
    'Function Calling 适合让模型决定何时调用你自己的后端能力。',
    '核心是：模型提参数，你的服务执行函数，再把结果喂回模型。',
  ],
};

class OpenaiStudyService extends Service {
  get textModel() {
    return this.config.openaiStudy.textModel;
  }

  get agentModel() {
    return this.config.openaiStudy.agentModel;
  }

  get embeddingModel() {
    return this.config.openaiStudy.embeddingModel;
  }

  get client() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('缺少 OPENAI_API_KEY，请先复制 .env.example 为 .env 并填入你的 OpenAI Key。');
    }

    if (!this.app.openaiClient) {
      this.app.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    return this.app.openaiClient;
  }

  pickTextOutput(response) {
    return response.output_text || '模型没有返回可直接显示的文本。';
  }

  async withTimeout(taskPromise, timeoutMs, message) {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(message));
      }, timeoutMs);
    });

    try {
      return await Promise.race([ taskPromise, timeoutPromise ]);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let aLength = 0;
    let bLength = 0;

    for (let index = 0; index < a.length; index += 1) {
      dotProduct += a[index] * b[index];
      aLength += a[index] * a[index];
      bLength += b[index] * b[index];
    }

    return dotProduct / (Math.sqrt(aLength) * Math.sqrt(bLength));
  }

  async getLearningResources(topic) {
    const normalized = String(topic || '').toLowerCase();

    if (normalized.includes('llm') || normalized.includes('大模型')) {
      return learningResourceMap.llm;
    }

    if (normalized.includes('json') || normalized.includes('结构')) {
      return learningResourceMap.structured;
    }

    if (normalized.includes('向量') || normalized.includes('embedding')) {
      return learningResourceMap.embeddings;
    }

    if (normalized.includes('函数') || normalized.includes('tool')) {
      return learningResourceMap.functionCalling;
    }

    return learningResourceMap.responses;
  }

  async createText(prompt) {
    const response = await this.client.responses.create({
      model: this.textModel,
      reasoning: { effort: 'high' },
      input: [
        {
          role: 'system',
          content:
            '你是一名耐心的 AI 全栈导师。请用中文回答，并明确说明这是一段纯 LLM 回答，不依赖外部检索。',
        },
        {
          role: 'user',
          content:
            prompt || '请用中文解释：纯 LLM 调用适合解决哪些问题？',
        },
      ],
    });

    return {
      example: 'llm',
      framework: 'Egg.js',
      model: this.textModel,
      pattern: 'pure-llm',
      knowledgeBoundary: '只依赖模型已有知识和当前提示词，不做外部知识检索。',
      outputText: this.pickTextOutput(response),
      responseId: response.id,
    };
  }

  async createStructured(topic) {
    const StudyPlanSchema = z.object({
      topic: z.string(),
      foundation: z.array(z.string()),
      backend: z.array(z.string()),
      frontend: z.array(z.string()),
      practiceProject: z.string(),
    });

    const response = await this.client.responses.parse({
      model: this.textModel,
      reasoning: { effort: 'high' },
      input: [
        {
          role: 'system',
          content: '你是一名 AI 全栈学习规划师。请只返回适合初学者的中文学习计划。',
        },
        {
          role: 'user',
          content: `请围绕“${topic || 'React 开发者转型 AI 全栈'}”生成一份 4 个字段以上的学习计划。`,
        },
      ],
      text: {
        format: zodTextFormat(StudyPlanSchema, 'study_plan'),
      },
    });

    return {
      example: 'structured',
      framework: 'Egg.js',
      model: this.textModel,
      parsed: response.output_parsed,
    };
  }

  async createFunctionCalling(question) {
    const tools = [
      {
        type: 'function',
        name: 'get_learning_resources',
        description: '根据 AI 学习主题返回一组本地教学提示，适合在学习助手场景中使用。',
        parameters: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: '用户想学习的主题，例如 structured outputs、embeddings。',
            },
          },
          required: [ 'topic' ],
          additionalProperties: false,
        },
        strict: true,
      },
    ];

    const input = [
      {
        role: 'user',
        content: question || '我想学结构化输出和 embeddings，请帮我给出学习建议。',
      },
    ];

    let response = await this.client.responses.create({
      model: this.textModel,
      reasoning: { effort: 'high' },
      tools,
      input,
    });

    input.push(...response.output);

    const toolCalls = [];

    for (const item of response.output) {
      if (item.type !== 'function_call') continue;

      const args = JSON.parse(item.arguments);
      const output = await this.getLearningResources(args.topic);

      toolCalls.push({
        name: item.name,
        arguments: args,
        output,
      });

      input.push({
        type: 'function_call_output',
        call_id: item.call_id,
        output: JSON.stringify(output, null, 2),
      });
    }

    response = await this.client.responses.create({
      model: this.textModel,
      reasoning: { effort: 'high' },
      tools,
      instructions: '请基于工具结果，用中文给出一段真正有帮助的学习建议。',
      input,
    });

    return {
      example: 'function-calling',
      framework: 'Egg.js',
      model: this.textModel,
      toolCalls,
      outputText: this.pickTextOutput(response),
    };
  }

  async createMcpExample(question) {
    const currentQuestion =
      question ||
      '请先用 MCP 工具查一下 Responses API 是什么，再用中文总结给一名前端开发者听。';
    const fallbackPayload = {
      example: 'mcp',
      framework: 'Egg.js',
      model: this.textModel,
      question: currentQuestion,
      mcpServer: mcpDemoServer,
      importedTools: [],
      mcpCalls: [],
      approvalRequests: [],
      learningPoints: [
        'MCP 通过远程 server 给模型接入额外工具能力。',
        '本例使用的是 OpenAI 官方托管的 Docs MCP server。',
        '敏感写操作在生产环境里通常应该配合 require_approval 使用。',
      ],
      workflow: [
        'Responses API 先尝试读取远程 MCP server 的工具列表',
        '模型根据问题决定是否调用 MCP 工具',
        '若远程工具成功返回，就会在 output 里看到 mcp_call',
      ],
    };

    // 这个示例演示的是“通过 Responses API 连接远程 MCP server”。
    // 它和本地 function calling 的差别在于：
    // 1. function calling 的工具由你自己后端定义并执行
    // 2. MCP 的工具来自远程 MCP server，由 OpenAI 在响应过程中接入
    try {
      const response = await this.withTimeout(
        this.client.responses.create({
          model: this.textModel,
          reasoning: { effort: 'low' },
          tools: [
            {
              type: 'mcp',
              ...mcpDemoServer,
            },
          ],
          input: [
            {
              role: 'system',
              content:
                '你是一名 AI 全栈导师。请优先使用 MCP server 中的文档工具查询资料，再用中文输出 3 部分：1. 查询结果总结 2. MCP 工具是怎么被调用的 3. 这个知识点和本地 function calling 的区别。',
            },
            {
              role: 'user',
              content: currentQuestion,
            },
          ],
        }),
        25000,
        'MCP 示例请求超时了。通常是远程 MCP server 暂时无响应，或者当前网络链路较慢，请稍后重试。'
      );

      const importedTools =
        response.output
          .filter(item => item.type === 'mcp_list_tools')
          .flatMap(item =>
            (item.tools || []).map(tool => ({
              name: tool.name,
              description: tool.description || '无描述',
              inputSchema: tool.input_schema || null,
            }))
          ) || [];

      const mcpCalls = response.output
        .filter(item => item.type === 'mcp_call')
        .map(item => ({
          name: item.name,
          arguments: item.arguments,
          output: item.output,
          status: item.status,
          serverLabel: item.server_label,
          error: item.error || null,
        }));

      const approvalRequests = response.output
        .filter(item => item.type === 'mcp_approval_request')
        .map(item => ({
          id: item.id,
          name: item.name,
          arguments: item.arguments,
          serverLabel: item.server_label,
        }));

      return {
        ...fallbackPayload,
        importedTools,
        mcpCalls,
        approvalRequests,
        outputText: this.pickTextOutput(response),
        responseId: response.id,
        status: 'ok',
      };
    } catch (error) {
      return {
        ...fallbackPayload,
        outputText:
          '这次没有拿到远程 MCP server 的实际返回，但你仍然可以通过这个模块学习 MCP 的接入方式、请求结构，以及它和本地 function calling 的区别。',
        responseId: null,
        serverError: error.message,
        status: 'degraded',
      };
    }
  }

  async createConversation({ message, sessionId, reset }) {
    const currentSessionId = sessionId || randomUUID();
    const previousResponseId = reset ? null : conversationSessions.get(currentSessionId);

    const response = await this.client.responses.create({
      model: this.textModel,
      reasoning: { effort: 'high' },
      previous_response_id: previousResponseId || undefined,
      input: [
        {
          role: 'user',
          content: message || '请记住：我现在是 React 全栈转 AI 全栈。',
        },
      ],
    });

    conversationSessions.set(currentSessionId, response.id);

    return {
      example: 'conversation',
      framework: 'Egg.js',
      model: this.textModel,
      sessionId: currentSessionId,
      previousResponseId,
      currentResponseId: response.id,
      outputText: this.pickTextOutput(response),
    };
  }

  async createAgentExample(question) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('缺少 OPENAI_API_KEY，请先复制 .env.example 为 .env 并填入你的 OpenAI Key。');
    }

    // 基于 OpenAI Agents Quickstart 的 handoffs 示例，演示 router agent 如何分流到专家 agent。
    // 官方文档（2026-04-22 检索）：
    // https://developers.openai.com/api/docs/guides/agents/quickstart
    const { Agent, run } = await import('@openai/agents');

    const frontendCoach = new Agent({
      name: 'Frontend coach',
      instructions:
        '你是前端 AI 产品导师，擅长 React、聊天 UI、流式输出、状态管理和交互设计。请用中文回答。',
      model: this.agentModel,
    });

    const backendCoach = new Agent({
      name: 'Backend coach',
      instructions:
        '你是后端 AI 工程导师，擅长 Node、Egg、OpenAI SDK、工具调用、接口设计和服务部署。请用中文回答。',
      model: this.agentModel,
    });

    const aiCoach = new Agent({
      name: 'AI workflow coach',
      instructions:
        '你是 AI 工作流导师，擅长 Agents SDK、RAG、评测、multi-agent orchestration 和 prompt design。请用中文回答。',
      model: this.agentModel,
    });

    const triageAgent = Agent.create({
      name: 'AI full-stack triage',
      instructions:
        '将用户问题路由给最合适的专家 agent。如果问题同时涉及多个方向，优先选择最核心的那个专家，并直接给出能落地的中文建议。',
      handoffs: [frontendCoach, backendCoach, aiCoach],
      model: this.agentModel,
    });

    const inputQuestion =
      question || '我已经会 React 和 Node，想转 AI 全栈，应该先学前端聊天 UI 还是先学后端 tools / agents？';

    const result = await run(triageAgent, inputQuestion);

    return {
      example: 'agents',
      framework: 'Egg.js',
      sdk: '@openai/agents',
      model: this.agentModel,
      question: inputQuestion,
      outputText: result.finalOutput,
      lastAgentName: result.lastAgent?.name || 'AI full-stack triage',
    };
  }

  createTextStream(prompt, handlers = {}) {
    return this.client.responses
      .stream({
        model: this.textModel,
        reasoning: { effort: 'high' },
        input: [
          {
            role: 'user',
            content:
              prompt || '请用中文分 5 点解释：前端工程师为什么应该学习流式输出。',
          },
        ],
      })
      .on('response.output_text.delta', event => {
        handlers.onDelta?.(event.delta);
      })
      .on('response.completed', () => {
        handlers.onDone?.();
      })
      .on('response.error', event => {
        handlers.onError?.(event.error?.message || 'stream error');
      });
  }

  async createEmbeddings(query) {
    const currentQuery = query || '我想做一个基于文档问答的 AI 应用';
    const documents = [
      'Responses API 适合多轮对话、工具调用和结构化输出。',
      'Embeddings 可以把文本映射为向量，常用于检索和 RAG。',
      '流式输出适合聊天 UI，让用户更早看到生成内容。',
      'Function Calling 可以让模型接入你自己的数据库、搜索服务和业务系统。',
    ];

    const embeddingResponse = await this.client.embeddings.create({
      model: this.embeddingModel,
      input: [ currentQuery, ...documents ],
    });

    const [ queryEmbedding, ...docEmbeddings ] = embeddingResponse.data.map(item => item.embedding);

    const ranking = documents
      .map((content, index) => ({
        content,
        score: this.cosineSimilarity(queryEmbedding, docEmbeddings[index]),
      }))
      .sort((a, b) => b.score - a.score);

    return {
      example: 'embeddings',
      framework: 'Egg.js',
      model: this.embeddingModel,
      query: currentQuery,
      explanation: '这里只做语义检索排序，还没有把命中的文档交给大模型生成最终答案。',
      topMatch: ranking[0],
      ranking,
    };
  }

  async createRagExample(question) {
    const currentQuestion = question || 'RAG 和直接让 LLM 回答，到底差别在哪里？';
    const documents = ragKnowledgeBase.map(item => `${item.title}\n${item.content}`);

    // 第一步：把用户问题和本地知识片段一起转成向量。
    // 这样我们就能用“向量相似度”判断哪个知识片段更相关。
    const embeddingResponse = await this.client.embeddings.create({
      model: this.embeddingModel,
      input: [ currentQuestion, ...documents ],
    });

    const [ queryEmbedding, ...docEmbeddings ] = embeddingResponse.data.map(item => item.embedding);

    // 第二步：根据余弦相似度做一个最小召回。
    // 真实项目常常会召回更多片段，再做重排；这里先保留最容易理解的版本。
    const retrievedChunks = ragKnowledgeBase
      .map((item, index) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        score: this.cosineSimilarity(queryEmbedding, docEmbeddings[index]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const contextBlock = retrievedChunks
      .map(
        (item, index) =>
          `片段 ${index + 1} | ${item.title}\n相似度：${item.score.toFixed(4)}\n内容：${item.content}`
      )
      .join('\n\n');

    // 第三步：把召回结果拼回 prompt，让大模型“带着资料”回答。
    // 这就是最小 RAG demo 的关键差异：回答不再只依赖模型参数知识。
    const response = await this.client.responses.create({
      model: this.textModel,
      reasoning: { effort: 'high' },
      input: [
        {
          role: 'system',
          content:
            '你是一名 RAG 学习导师。请优先依据提供的知识片段作答，用中文输出 3 部分：1. 直接回答 2. 命中的依据 3. 这个 demo 想表达的知识点。',
        },
        {
          role: 'user',
          content: `用户问题：${currentQuestion}\n\n可参考知识片段：\n${contextBlock}`,
        },
      ],
    });

    return {
      example: 'rag',
      framework: 'Egg.js',
      textModel: this.textModel,
      embeddingModel: this.embeddingModel,
      question: currentQuestion,
      workflow: [
        '用户问题先做 embedding',
        '对本地知识片段做相似度排序',
        '取最相关的 3 个片段拼进 prompt',
        '再调用大模型生成最终答案',
      ],
      retrievedChunks,
      outputText: this.pickTextOutput(response),
    };
  }
}

module.exports = OpenaiStudyService;
