const File = require('../../api/File');
const Note = require('../../api/Note');

const removeFile = async (data) => {
	const response = {
		success: false,
		error: null,
		data: null,
	}

	try {
		const isRemovedFile = await File.removeFile(data);

		if(!isRemovedFile.success) {
			response.error = `Server error`;
			return response;
		}

		if(data.file.note.id) {
			const isRemovedAttachmentFromNote = await Note.removeAttachmnetFromNote(data);

			if(!isRemovedAttachmentFromNote.success) {
				response.error = `Server error`;
				return response
			}
		}


		response.data = {
			removedFile: data.file
		}
		response.success = true;

		return response;

	} catch (err) {
		console.log(err);
		response.error = `Unknown error`;

		return response;
	}
}

module.exports = removeFile;