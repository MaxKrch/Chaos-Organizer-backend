const koaRouter = require('koa-router');
const fileRemoveRouter = new koaRouter();
const removeFile = require('../../../utils/files/removeFile')
const sendOutStatistic = require('../../../utils/account/sendOutStatistic');
const { sendEventToClients } = require('../../../api/SSE');

fileRemoveRouter.post('/user/file/remove', async ctx => {
	const response = await removeFile(ctx.request.body);
	if(response.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `fileRemoved`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
		sendOutStatistic(ctx.request.body.user)
	}
	ctx.response.body = JSON.stringify(response)
})

module.exports = fileRemoveRouter;