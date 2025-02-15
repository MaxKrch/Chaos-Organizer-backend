const Registration = require('../../api/Registration');
const Auth = require('../../api/Auth');
const loginUser = require('./loginUser');

const registerUser = async (data) => {
	const responseRegistration = {
		success: false,
		error: null,
		user: null,
		tokens: null,
	}	

	if(!data.email || !data.password) {
		responseRegistration.error = `Incorrect data`;
		return responseRegistration; 
	}

	try {
		const createdAccountData = await Registration.createAccount(data)

		if(!createdAccountData.success) {
			responseRegistration.error = createdAccountData.error;
			return responseRegistration;
		}

		return await loginUser({
			...data,
			type: `password`,
		})
	
	} catch (err) {
		console.log(err)
		responseRegistration.error = `Unknown error`

		return responseRegistration;
	} 
}

module.exports = registerUser