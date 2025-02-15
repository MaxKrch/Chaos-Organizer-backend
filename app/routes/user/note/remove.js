const koaRouter = require('koa-router');
const noteRemoveRouter = new koaRouter()

noteRemoveRouter.delete('/user/note/remove', async ctx => {
	console.log('note remove router');
	ctx.response.body = 'note remove response'
})

module.exports = noteRemoveRouter;