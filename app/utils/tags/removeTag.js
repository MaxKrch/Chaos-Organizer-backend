const Note = require('../../api/Note');

const removeTag = async(data) => {
	const response = {
		success: false,
		error: null,
		data: null,
	}

	try {
		const isRemovedTag = await Note.removeTag(data);

		if(!isRemovedTag.success) {
			console.log(isRemovedTag.error);
			response.error = `Server error`;

			return response;
		}

		response.data = {
			removedTag: isRemovedTag.removedTag
		}
		response.success = true;

		return response

	} catch (err) {
		console.log(err)
		response.error = `Server error`;

		return response;
	}
}

module.exports = removeTag;