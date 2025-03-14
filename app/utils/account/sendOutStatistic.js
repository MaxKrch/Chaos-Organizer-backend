const Note = require('../../api/Note');
const getNotesCount = require('../notes/getNotesCount');
const { sendEventToClients } = require('../../api/SSE');

const sendOutStatistic = async (user) => {
	const tagsObj = await Note.getUserTags(user);
	const notesCountObj = await getNotesCount(user);

	if(tagsObj.success && notesCountObj.success) {
		sendEventToClients({
			user: user,
			event: `synchStatistic`,
			body: {
				notesCount:	notesCountObj.notesCount,
				tags: tagsObj.tags,
			}
		})
	}
}

	module.exports = sendOutStatistic;