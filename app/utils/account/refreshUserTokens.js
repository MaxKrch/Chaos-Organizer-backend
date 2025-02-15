const Auth = require('../../api/Auth'); 

const refreshUserTokens = async (data) => {
	return await Auth.refreshUserTokens(data)
}

module.exports = refreshUserTokens;