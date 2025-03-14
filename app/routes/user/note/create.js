const koaRouter = require('koa-router');
const noteCreateRouter = new koaRouter();
const saveCreatedNote = require('../../../utils/notes/saveCreatedNote');
const sendOutStatistic = require('../../../utils/account/sendOutStatistic');
const { sendEventToClients } = require('../../../api/SSE');

noteCreateRouter.post('/user/note/create', async ctx => {
	const saveNoteResponse = await saveCreatedNote({
		note: ctx.request.body, 
		files: ctx.request.files
	});

	ctx.response.body = JSON.stringify(saveNoteResponse)	
	
	if(saveNoteResponse.success) {
		sendEventToClients({
			user: ctx.request.body.user,
			event: `noteCreated`,
			body: {
				note:	saveNoteResponse.data.note,
				createdId: saveNoteResponse.data.createdId
			}
		})
		sendOutStatistic(ctx.request.body.user)
	}
})

module.exports = noteCreateRouter;