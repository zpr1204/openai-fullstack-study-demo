'use strict';

const path = require('node:path');
const fs = require('node:fs/promises');
const Controller = require('egg').Controller;

class PageController extends Controller {
  async index() {
    const indexPath = path.join(this.app.baseDir, 'app/public/index.html');

    try {
      this.ctx.type = 'html';
      this.ctx.body = await fs.readFile(indexPath, 'utf8');
    } catch {
      this.ctx.status = 503;
      this.ctx.body = '前端静态资源还没有构建，请先执行 npm run build。';
    }
  }
}

module.exports = PageController;
