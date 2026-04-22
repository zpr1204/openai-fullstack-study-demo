'use strict';

require('dotenv').config();
const path = require('node:path');

module.exports = appInfo => {
  const config = exports = {};

  config.keys = `${appInfo.name}_20260422_openai_study`;

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.bodyParser = {
    jsonLimit: '2mb',
  };

  config.static = {
    prefix: '/',
    dir: path.join(appInfo.baseDir, 'app/public'),
  };

  config.cluster = {
    listen: {
      port: Number(process.env.PORT || 7001),
      hostname: '127.0.0.1',
    },
  };

  config.openaiStudy = {
    textModel: process.env.OPENAI_TEXT_MODEL || 'gpt-5.4-mini',
    agentModel: process.env.OPENAI_AGENT_MODEL || 'gpt-5.4-mini',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  };

  config.middleware = [];

  return config;
};
