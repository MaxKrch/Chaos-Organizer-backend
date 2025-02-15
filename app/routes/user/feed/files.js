const koaRouter = require('koa-router');
const feedFilesRouter = new koaRouter()

feedFilesRouter.post('/user/feed/files', async ctx => {
	console.log('files router');
	ctx.response.body = 'files response'
})

module.exports = feedFilesRouter;