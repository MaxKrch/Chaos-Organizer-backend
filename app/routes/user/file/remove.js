const koaRouter = require('koa-router');
const fileRemoveRouter = new koaRouter()

fileRemoveRouter.delete('/user/file/remove', async ctx => {
	console.log('remove file router');
	ctx.response.body = 'remove file response'
})

module.exports = fileRemoveRouter;