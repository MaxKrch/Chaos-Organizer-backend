const koaRouter = require('koa-router');
const noteCreateRouter = new koaRouter()
const saveCreatedNote = require('../../../utils/user/saveCreatedNote')
const { sendEventToClients } = require('../../../api/SSE')

noteCreateRouter.post('/user/note/create', async ctx => {
	const saveNoteResponse = await saveCreatedNote(ctx.request.body);
	if(saveNoteResponse.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `createdNote`,
			body: saveNoteResponse.data
		})
	}

	ctx.response.body = JSON.stringify(saveNoteResponse)
})

module.exports = noteCreateRouter;