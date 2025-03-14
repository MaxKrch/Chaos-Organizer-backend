const File = require('../../api/File')
const { USER_FILE_TYPES } = require('../../data/VARIABLE')

const getNotesCount = async (user) => {
	const response = {
		success: false,
		error: null,
		notesCount: null,
	} 

	try {
		const notesCount = {
			files: {}
		}
		const userFilesObj = await File.getUserFilesLinks(user)
	
		if(!userFilesObj.success) {
			response.error = userFilesObj.error
			return response; 
		}
	
		const userFiles = userFilesObj.links
		USER_FILE_TYPES.forEach(item => notesCount.files[item.NAME] = 0)

		for(let key in userFiles) {
			notesCount.files[key] = userFiles[key].length;
		}		

		response.notesCount = notesCount;
		response.success = true;
		
		return response;

	} catch(err) {
		console.log(err);
		response.error = `Unknown error`;

		return response;
	}
}

module.exports = getNotesCount;