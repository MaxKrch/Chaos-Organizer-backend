const koaRouter = require('koa-router');
const feedPinnedNoteRouter = new koaRouter();
const Note = require('../../../api/Note');

feedPinnedNoteRouter.post('/user/feed/pinnednote', async ctx => {
	const response = await Note.getPinnedNote(ctx.request.body);
	ctx.response.body = JSON.stringify(response)
})

module.exports = feedPinnedNoteRouter;