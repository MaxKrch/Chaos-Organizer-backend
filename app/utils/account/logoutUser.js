const Auth = require('../../api/Auth');

const logoutUser = async (data) => {
	const response = {
		success: false,
		error: null,
	}

	try {
		const deAutheticationResponse = await Auth.deAuthenticationUser(data)

		if(!deAutheticationResponse.success) {
			response.error = deAutheticationResponse.error;
			return response;
		}
		response.success = true;

		return response;
		
	} catch(err) {
		console.log(err);
		response.error = `DeAuthentication error`;

		return response;
	}
}

module.exports = logoutUser;