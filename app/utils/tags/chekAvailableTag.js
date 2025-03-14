const Note = require('../../api/Note')

const chekAvailableTag = async (data) => {
	const response = {
		success: false,
		error: null,
		available: false, 
	}

	try {
		const userTagsObj = await Note.getUserTags(data.user);

		if(!userTagsObj.success) {
			response.error = `Server error`;
			return response
		}

		if(userTagsObj.tags.findIndex(tag => tag.title === data.tag.title) < 0) {
			response.available = true; 
		}

		response.success = true;
		return response;

	} catch(err) {
		console.log(err);
		response.error = `Unknown error`

		return response;
	}
}

module.exports = chekAvailableTag;