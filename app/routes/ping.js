const koaRouter = require('koa-router');

const pingRouter = new koaRouter();

pingRouter.get(`/ping`, async (ctx, next) => {
	ctx.response.status = 204
})

module.exports = pingRouter