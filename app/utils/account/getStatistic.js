const Note = require('../../api/Note');
const getNotesCount = require('../notes/getNotesCount');

const getStatistic = async (user) => {
	const response = {
		success: false,
		error: null,
		data: null,
	}

	try {
		const tagsObj = await	Note.getUserTags(user);
		if(!tagsObj.success) {
			response.error = `Server error`;
			return response
		}

		const notesCountObj = await	getNotesCount(user);
		if(!notesCountObj.success) {
			response.error = `Server error`;
			return response
		}
	
		response.data = {
			tags: tagsObj.tags,
			notesCount: notesCountObj.notesCount
		}
		response.success = true;

		return response;
		
	} catch(err) {
		console.log(err)
		response.error = `Unknown error`;

		return response;
	}
}

module.exports = getStatistic;