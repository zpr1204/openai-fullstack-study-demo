'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.redirect('/', '/index.html');

  router.get('/api/health', controller.api.health);
  router.post('/api/examples/text', controller.api.text);
  router.post('/api/examples/structured', controller.api.structured);
  router.post('/api/examples/function-calling', controller.api.functionCalling);
  router.post('/api/examples/conversation', controller.api.conversation);
  router.post('/api/examples/agents', controller.api.agentExample);
  router.get('/api/examples/stream', controller.api.stream);
  router.post('/api/examples/embeddings', controller.api.embeddings);
};
