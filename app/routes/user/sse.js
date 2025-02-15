const koaRouter = require('koa-router');
const { connectNewClient } = require('../../api/SSE');
const sseRouter = new koaRouter();

sseRouter.get('/user/sse', async (ctx) => {
  connectNewClient(ctx)
 
  ctx.respond = false; 
});

module.exports = sseRouter;


