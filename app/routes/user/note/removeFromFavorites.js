const koaRouter = require('koa-router');
const noteRemoveFromFavoritesRouter = new koaRouter();
const Note = require('../../../api/Note');
const { sendEventToClients } = require('../../../api/SSE');

noteRemoveFromFavoritesRouter.post('/user/note/removefromfavorites', async ctx => {
	const response = await Note.removeNoteFromFavorites(ctx.request.body);
	if(response.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `noteRemovedFromFavorites`,
			body: response.data,
			exclude: ctx.request.body.clientId,
		})
	}
	ctx.response.body = JSON.stringify(response)
})

module.exports = noteRemoveFromFavoritesRouter;