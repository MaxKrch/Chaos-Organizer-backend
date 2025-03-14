const koaRouter = require('koa-router');
const noteRemoveRouter = new koaRouter();
const removeNote = require('../../../utils/notes/removeNote');
const sendOutStatistic = require('../../../utils/account/sendOutStatistic');
const { sendEventToClients } = require('../../../api/SSE');

noteRemoveRouter.post('/user/note/remove', async ctx => {

	const response = await removeNote(ctx.request.body);
	if(response.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `noteRemoved`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
		sendOutStatistic(ctx.request.body.user)
	}
	ctx.response.body = JSON.stringify(response);
})

module.exports = noteRemoveRouter;