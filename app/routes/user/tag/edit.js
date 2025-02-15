const koaRouter = require('koa-router');
const tagEditRouter = new koaRouter()

tagEditRouter.put('/user/tag/edit', async ctx => {
	console.log('tag edit router');
	ctx.response.body = 'tag edit response'
})

module.exports = tagEditRouter;