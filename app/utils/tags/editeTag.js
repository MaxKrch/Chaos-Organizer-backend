const Note = require('../../api/Note');

const editeTag = async(data) => {
	const response = {
		success: false,
		error: null,
		data: null,
	}

	try {
		const isEditedTag = await Note.editeTag(data);

		if(!isEditedTag.success) {
			console.log(isEditedTag.error);
			response.error = `Server error`;

			return response;
		}

		response.data = {
			editedTag: isEditedTag.editedTag,
		}
		response.success = true;

		return response

	} catch (err) {
		console.log(err)
		response.error = `Server error`;

		return response;
	}
}

module.exports = editeTag;