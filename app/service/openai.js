'use strict';

const { randomUUID } = require('node:crypto');
const Service = require('egg').Service;
const OpenAI = require('openai');
const { zodTextFormat } = require('openai/helpers/zod');
const { z } = require('zod');

const conversationSessions = new Map();

const learningResourceMap = {
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
    console.log(8888, response)
    return response.output_text || '模型没有返回可直接显示的文本。';
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
          content: '你是一名耐心的 AI 全栈导师，回答要中文、清晰、结构化。',
        },
        {
          role: 'user',
          content:
            prompt || '请用中文解释：为什么 OpenAI 的 Responses API 适合新项目入门？',
        },
      ],
    });

    return {
      example: 'text',
      framework: 'Egg.js',
      model: this.textModel,
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
      topMatch: ranking[0],
      ranking,
    };
  }
}

module.exports = OpenaiStudyService;
