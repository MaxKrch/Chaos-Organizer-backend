const koaRouter = require('koa-router');
const noteEditRouter = new koaRouter()

noteEditRouter.put('/user/note/edit', async ctx => {
	console.log('note edit router');
	ctx.response.body = 'note edit response'
})

module.exports = noteEditRouter;