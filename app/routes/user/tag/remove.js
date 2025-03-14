const koaRouter = require('koa-router');
const tagRemoveRouter = new koaRouter();
const editeTag = require('../../../utils/tags/removeTag');
const { sendEventToClients } = require('../../../api/SSE');

tagRemoveRouter.post('/user/tag/remove', async ctx => {
	const response = await editeTag(ctx.request.body);
	if(response.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `tagRemoved`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
	}
	ctx.response.body = JSON.stringify(response);
})

module.exports = tagRemoveRouter;