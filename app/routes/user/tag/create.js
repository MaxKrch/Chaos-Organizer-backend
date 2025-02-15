const koaRouter = require('koa-router');
const tagCreateRouter = new koaRouter()

tagCreateRouter.post('/user/tag/create', async ctx => {
	console.log('tag create router');
	ctx.response.body = 'tag create response'
})

module.exports = tagCreateRouter;