const Auth = require('../../api/Auth');

const authorizeUser = async (header) => {
	const response = {
		success: false,
		error: null,
		user: null,
	}

	try {
		const responseAuthorization = await Auth.authorization(header)

		if(!responseAuthorization.success) {
			response.error = responseAuthorization.error;

			return response;
		}

		response.user = responseAuthorization.user;
		response.success = true
		
		return response;

	} catch(err) {
		console.log(err)
		response.error = `Server error`

		return response;
	}
}

module.exports = authorizeUser;