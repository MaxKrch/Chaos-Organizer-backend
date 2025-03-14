const Note = require('../../api/Note');
const File = require('../../api/File');

const removeNote = async (data) => {
	const response = {
		success: false,
		error: null,
		data: null
	}

	const dataForResponse = {}

	try {
		if(data.note.removeAttachment) {
			const isRemovedFiles = await File.removeNoteAttachment(data);
			
			if(!isRemovedFiles.success) {
				response.error = `Server error`;
				return response;
			}
		}

		const isRemovedNote = await Note.removeNote(data);

		if(!isRemovedNote.success) {
			response.error = `Server error`;
			return response;
		}

		response.data = {
			removedNote: data.note
		}
		response.success = true;

		return response;

	} catch(err) {
		console.log(err);
		response.error = `Unknown error`;

		return response;
	}
}

module.exports = removeNote;