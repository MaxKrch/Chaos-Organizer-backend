const koaRouter = require('koa-router');
const tagEditRouter = new koaRouter();
const editeTag = require('../../../utils/tags/editeTag');
const { sendEventToClients } = require('../../../api/SSE');

tagEditRouter.post('/user/tag/edit', async ctx => {
	const response = await editeTag(ctx.request.body);
	if(response.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `tagEdited`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
	}
	ctx.response.body = JSON.stringify(response);
})

module.exports = tagEditRouter;