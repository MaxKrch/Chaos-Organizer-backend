const Registration = require('../../api/Registration');

const chekingAvailableEmail = async (data) => {
	response = {
		success: false,
		error: null
	}

	try {
		const isAvailableEmail = await Registration.checkAvailableEmail(data.email)
		console.log(isAvailableEmail)
		if(!isAvailableEmail.success) {
			response.error = isAvailableEmail.error;
			return response;
		}
		response.success = true;

		return response

	} catch (err) {
		response.error = `Server error`

		return response
	}
} 

module.exports = chekingAvailableEmail;