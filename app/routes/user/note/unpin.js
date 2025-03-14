const koaRouter = require('koa-router');
const noteUnpinRouter = new koaRouter();
const Note = require('../../../api/Note');
const { sendEventToClients } = require('../../../api/SSE');

noteUnpinRouter.post('/user/note/unpin', async ctx => {
	const response = await Note.unpinNote(ctx.request.body);
	if(response.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `noteUnpinned`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
	}
	ctx.response.body = JSON.stringify(response)
})

module.exports = noteUnpinRouter;