const koaRouter = require('koa-router');
const feedNotesRouter = new koaRouter();
const getRequestedNotes = require('../../../utils/notes/getRequestedNotes');

feedNotesRouter.post(/^\/user\/feed\/[notes|liveloading].*/, async ctx => {
	const response = await getRequestedNotes(ctx.request.body);
	const responseJSON = JSON.stringify(response)
	ctx.response.body = responseJSON;
})

module.exports = feedNotesRouter;