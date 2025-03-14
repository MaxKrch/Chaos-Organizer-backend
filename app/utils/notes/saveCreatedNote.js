const Note = require('../../api/Note');
const File = require('../../api/File');
const uuid = require('uuid')

const saveCreatedNote = async (data) => {
	const response = {
		success: false,
		error: null,
		data: {
			note: null,
			createdId: null,
			messages: null,
		},
		tagsCreated: false,
		filesSaved: false,
	}

	try {		
		const { note, files } = data;	
		response.data.createdId = note.id;
		note.id = uuid.v4()

		const savedFilesObj = Object.keys(files).length > 0
			?	await File.saveFilesToServer(files, note.user, note.id)
			: {
					success: true, 
					messages: [],
					savedFiles: []
				}

		if(!savedFilesObj.success) {
			response.error = `Server error`;
			return response;
		}

		if(savedFilesObj.messages.length > 0) {
			response.data.messages = savedFilesObj.messages;
		}

		const savedNoteObj = await Note.saveCreatedNote({
			note, 
			filesLinks:	savedFilesObj.savedFiles
		})

		if(!savedNoteObj.success) {
			response.error = `Server error`;
			return response;
		}
	
		response.data.note = savedNoteObj.note
		response.success = true;

		return response;

	} catch(err) {
		console.log(err);
		response.error = `Unknown error`;

		return response;
	}
}

module.exports = saveCreatedNote;