const Note = require('../../api/Note');
const File = require('../../api/File');

const getRequestedNotes = async (data) => {
	const response = {
		success: false,
		error: null,
		data: null,
	}

	try {
		const notesObj = data.section === `files`
			? await File.getFileNotesFromServer(data)
			: await Note.getNotesFromServer(data) 

		if(!notesObj.success) {
			console.log(notesObj.error);
			response.error = `Server error`;
	
			return response;
		}

		response.data = {
			notes: notesObj.notes
		}
		response.success = true;

		return response;		

	} catch (err) {
		console.log(err)
		response.error = `Unknown error`;

		return response;
	}
}

module.exports = getRequestedNotes