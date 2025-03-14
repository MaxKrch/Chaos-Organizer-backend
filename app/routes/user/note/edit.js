const koaRouter = require('koa-router');
const noteEditRouter = new koaRouter();
const sendOutStatistic = require('../../../utils/account/sendOutStatistic');
const Note = require('../../../api/Note');
const { sendEventToClients } = require('../../../api/SSE');

noteEditRouter.post('/user/note/edit', async ctx => {
	const response = await Note.saveEditedNote(ctx.request.body);
	if(response.success && response.noteSaved) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `noteEdited`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
		sendOutStatistic(ctx.request.body.user)
	}
	const responseForSend = {
		success: response.success,
		error: response.error,
	}

	responseForSend.data = response.noteSaved
		? null
		: response.data

	ctx.response.body = JSON.stringify(responseForSend)
})

module.exports = noteEditRouter;