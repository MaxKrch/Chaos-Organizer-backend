const koaRouter = require('koa-router');
const noteAddToFavoritesRouter = new koaRouter();
const Note = require('../../../api/Note');
const { sendEventToClients } = require('../../../api/SSE');

noteAddToFavoritesRouter.post('/user/note/addtofavorites', async ctx => {
	const response = await Note.addNoteToFavorites(ctx.request.body);
	if(response.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `noteAddedToFavorites`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
	}
	ctx.response.body = JSON.stringify(response)
})

module.exports = noteAddToFavoritesRouter;