const koaRouter = require('koa-router');
const feedTagRouter = new koaRouter()

feedTagRouter.get('/user/feed/tag', async ctx => {
	console.log('tag router');
	ctx.response.body = 'tag response'
})

module.exports = feedTagRouter;