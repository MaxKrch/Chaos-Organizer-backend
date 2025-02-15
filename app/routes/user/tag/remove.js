const koaRouter = require('koa-router');
const tagRemoveRouter = new koaRouter()

tagRemoveRouter.delete('/user/tag/remove', async ctx => {
	console.log('tag remove router');
	ctx.response.body = 'tag remove response'
})

module.exports = tagRemoveRouter;