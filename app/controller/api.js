'use strict';

const Controller = require('egg').Controller;

class ApiController extends Controller {
  async health() {
    const { ctx, config } = this;
    ctx.body = {
      apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
      textModel: config.openaiStudy.textModel,
      embeddingModel: config.openaiStudy.embeddingModel,
      framework: 'Egg.js',
      message: 'Egg 服务已启动。如果还没填 Key，前端会提示你先配置。',
    };
  }

  async text() {
    const { ctx, service } = this;

    try {
      ctx.body = await service.openai.createText(ctx.request.body?.prompt);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async structured() {
    const { ctx, service } = this;

    try {
      ctx.body = await service.openai.createStructured(ctx.request.body?.topic);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async functionCalling() {
    const { ctx, service } = this;

    try {
      ctx.body = await service.openai.createFunctionCalling(ctx.request.body?.question);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async mcp() {
    const { ctx, service } = this;

    try {
      ctx.body = await service.openai.createMcpExample(ctx.request.body?.question);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async vercelAiChat() {
    const { ctx, service } = this;

    try {
      const result = await service.openai.createVercelAiChatStream(ctx.request.body?.messages);

      // 交给 AI SDK 把 UIMessage SSE 流直接写回浏览器。
      // 这正是 useChat 默认期望的响应格式。
      ctx.respond = false;
      result.pipeUIMessageStreamToResponse(ctx.res);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async conversation() {
    const { ctx, service } = this;

    try {
      ctx.body = await service.openai.createConversation({
        message: ctx.request.body?.message,
        sessionId: ctx.request.body?.sessionId,
        reset: Boolean(ctx.request.body?.reset),
      });
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async agentExample() {
    const { ctx, service } = this;

    try {
      ctx.body = await service.openai.createAgentExample(ctx.request.body?.question);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async stream() {
    const { ctx, service } = this;

    try {
      const prompt = ctx.query.prompt;

      ctx.respond = false;

      const res = ctx.res;
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      });

      const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      const stream = service.openai.createTextStream(prompt, {
        onDelta(delta) {
          sendEvent('chunk', { delta });
        },
        onDone() {
          sendEvent('done', { message: 'stream completed' });
          res.end();
        },
        onError(message) {
          sendEvent('server-error', { message });
          res.end();
        },
      });

      ctx.req.on('close', () => {
        stream.abort();
      });

      await stream.finalResponse();
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async embeddings() {
    const { ctx, service } = this;

    try {
      ctx.body = await service.openai.createEmbeddings(ctx.request.body?.query);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }

  async rag() {
    const { ctx, service } = this;

    try {
      ctx.body = await service.openai.createRagExample(ctx.request.body?.question);
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }
}

module.exports = ApiController;
