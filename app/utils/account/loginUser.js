const Auth = require('../../api/Auth');

const loginUser = async (data) => {
	const responseLogin = {
		success: false,
		error: null,
		user: null,
		tokens: null,
	}	

	if(data.type !== `token` && data.type !== `password`) {
		responseLogin.error = `Incorrect data`;
		return responseLogin; 
	}

	try {
		const authenticationData = await Auth.authentication(data);

		if(!authenticationData.success) {
			responseLogin.error = authenticationData.error;
			return responseLogin;
		}

		responseLogin.user = {
			...authenticationData.user,
			remember: data.rememberUser,
		}
		responseLogin.tokens = authenticationData.tokens;
		responseLogin.success = true;

		return responseLogin;

	} catch (err) {
		console.log(err)
		responseLogin.error = `Unknown error`;

		return responseLogin;
	}
}

module.exports = loginUser