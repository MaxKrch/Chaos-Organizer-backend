const koaRouter = require('koa-router');
const notePinRouter = new koaRouter();
const Note = require('../../../api/Note');
const { sendEventToClients } = require('../../../api/SSE');

notePinRouter.post('/user/note/pin', async ctx => {
	const response = await Note.pinNote(ctx.request.body);
	if(response.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `notePinned`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
	}
	ctx.response.body = JSON.stringify(response)
})

module.exports = notePinRouter;