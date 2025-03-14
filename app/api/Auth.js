const fs = require('fs').promises;
const path = require('path');
const uuid = require('uuid');
const argon2 = require('argon2');
const getHeadersHash = require('../helpers/getHeadersHash');
const { FILE_NAMES, PATHS, TOKEN_SECRET_KEY } = require('../data/VARIABLE.js');

const jwt = require('jsonwebtoken')

class Auth {
	static #PATHS = PATHS;
	static #TOKEN_SECRET_KEY = TOKEN_SECRET_KEY;
	static #FILE_NAMES = FILE_NAMES;
	static #listUsers = path.join(__dirname, `../${this.#PATHS.DB_DIRECTORY}/${this.#FILE_NAMES.USERS.LIST}`);	
	static #userDatabase = path.join(__dirname, `../${this.#PATHS.DB_DIRECTORY}/${this.#PATHS.STORAGE_USERS_DATA}`);
	static #userRefreshTokens = this.#FILE_NAMES.USER.TOKENS

	static async authentication(data) {
		const response = data.type === `token` 
			?	await this.#authenticationWithToken(data) 
			:	await this.#authenticationWithPassword(data)

		return response;
	}

	static async #authenticationWithPassword(data) {
		const response = {
			success: false,
			error: null,
			tokens: null,
			user: null,
		}
		const { email, password, fingerPrint, hash } = data;

		if(!email || !password) {
			response.error = `Incorrect data`;
			return response;
		}

		if(!hash) {
			response.error = `Server error`;
			return response;
		}

		const userObject = await this.#getUserByEmail(email);

		if(!userObject.success) {
			response.error = userObject.error;
			return response;
		}

		const user = userObject.user;

		const isCorrectPasswordObj = await this.#chekingPassword(user, password);

		if(!isCorrectPasswordObj.success) {
			response.error = isCorrectPasswordObj.error;
			return response;
		}

		const createdTokensObj = await this.#generateUserTokens({
			user: {
				id: user.id,
				email: user.email,
			},
			hash,
			fingerPrint,
		})

		if(!createdTokensObj.success) {
			response.error = `Authentication error`;
			return response;
		}

		response.user = {
			id: user.id,
			email: user.email,
			auth: true,
		}
			
		response.tokens = createdTokensObj.tokens;
		response.success = true;

		return response;
	}

	static async #authenticationWithToken(data) {
		return await this.refreshUserTokens(data)
	}

	static async authorization(header) {
		const response = {
			success: false,
			user: null,
			error: null,
		}

		try {
			const hash = getHeadersHash(header);
			const authString = header.authorization;  
			const authArray = authString.split(' ');
		
			if(authArray[0] !== 'Bearer') {
				response.error = `Authorization error`;
				return response;
			}

			const token = authArray[1];
			const verifiedTokenData = await this.#verifyAccessToken({
				hash,
				token,
			})

			if(!verifiedTokenData.success || !verifiedTokenData.user) {
				response.error = `Authorization error`;
				return response
			}

			response.user =	verifiedTokenData.user;
			response.success = true;

			return response;

		} catch (err) {
			console.log(err)
			response.error = `Unknown error`
			
			return response			
		} 
	}

	static async refreshUserTokens(data) {
		const response = {
			success: false,
			error: null,
			tokens: {
				access: null,
				refresh: null,
			}
		}

		try {
			const verifiedTokenData = await this.#verifyRefreshToken(data)

			if(verifiedTokenData.targetToken) {
				await this.#removeFefreshTokenByTokenData({
					token: verifiedTokenData.targetToken,
					listTokens: verifiedTokenData.listTokens,
					user: verifiedTokenData.decodedToken.user.id
				})
			}

			if(!verifiedTokenData.success) {
				response.error = `Refreshing tokens error`;
				return response;
			}

			const userObj = await this.#getUserById(verifiedTokenData.decodedToken.user.id)

			if(!userObj.success) {
				response.error = `Refreshing tokens error`
				
				return response
			}

			const createdTokensObj = await this.#generateUserTokens({
				user: userObj.user,
				hash: data.hash,
				fingerPrint: data.fingerPrint,
				listTokens: verifiedTokenData.listTokens
			})

			if(!createdTokensObj.success) {
				response.error = `Refreshing tokens error`;
				return response;
			}

			response.user = {
				id: userObj.user.id,
				email: userObj.user.email,
				auth: true,
			}

			response.tokens = createdTokensObj.tokens;
			response.success = true;

			return response;

		} catch(err) {
			console.log(err);
			response.error = `Refreshing tokens error`;

			return response;			
		}
	}

	static async #chekingPassword(user, password) {
		const response = {
			success: false,
			error: null,
		}

		try {
			const isCorrectPassword = await argon2.verify(user._password, password);

			if(isCorrectPassword) {
				response.success = true;
				return response;
			} 
			response.error = `Authentication error`;
				
			return	response;	

		} catch(err) {
			response.error = `Unknown error`

			return response;
		} 
	}

	static async #addRefreshTokenToList(data) {
		const response = {
			success: false,
			error: null,			
		}

		try {
			const { user, tokenObj } = data;
			let listTokens = data.listTokens;

			if(!listTokens) {
				const listTokensObj = await this.#loadRefreshTokensUser(user);	

				if(!listTokensObj.success) {
					response.error = listTokensObj.error;
					return response;
				}		

				listTokens = listTokensObj.tokens;
			}

			if(listTokens.length > 4) {
				const countTokenfForRemove = listTokens.length - 4;
		
				for(let i = 0; i < countTokenfForRemove; i += 1) {
					listTokens.shift()
				}
			}

			listTokens.push(tokenObj)
			const refreshTokensSaved = await	this.#saveListRefreshTokens(user, listTokens)

			if(!refreshTokensSaved.success) {
				response.error = refreshTokensSaved.error;
				return response;
			}

			response.success = true;
			return response;
		} catch (err) {
			console.log(err);
			response.error = `Refresh token error`

			return response;
		}
	}

	static async #generateUserTokens(data) {
		const response = {
			success: false,
			error: null,
			tokens: null
		}

		try {
			const accessTokenObj = this.#generateAccessToken({
				user: data.user, 
				hash: data.hash,
			});

			if(!accessTokenObj.success) {
				response.error = `Creating tokens error`;
				return response;
			}

			const refreshTokenObj = this.#generateRefreshToken({
				user: data.user, 
				fingerPrint: data.fingerPrint, 
				hash: data.hash,
			});

			if(!refreshTokenObj.success) {
				response.error = `Creating tokens error`;
				return response;	
			}

			const isSavedRefreshToken = await this.#addRefreshTokenToList({
				user: data.user.id,
				listTokens: data.listTokens,
				tokenObj: refreshTokenObj.tokenObj
			})

			if(!isSavedRefreshToken.success) {
				response.error = `Creating tokens error`
				return response;
			}

			response.tokens = {
				access: accessTokenObj.token,
				refresh: refreshTokenObj.tokenObj.token,
			}
			response.success = true;
			return response;

		} catch(err) {
			console.log(err);
			response.error = `Creating tokens error`;

			return response;
		}
	}
	
	static #generateAccessToken(data) {
		const response = {
			success: false,
			token: null,
		}

		try {
			const tokenData = {
				user: {
					id: data.user.id,
					email: data.user.email,
				},
				hash: data.hash
			}
			const expiration = '15m';

			response.token = jwt.sign(tokenData, this.#TOKEN_SECRET_KEY, { expiresIn: expiration });

			if(!response.token) {
				throw(`Token not created`)
			}

			response.success = true;
			
			return response;

		} catch(err) {
			console.log(err);
			response.error = `Creating token error`;

			return response;
		}
	}

	static #generateRefreshToken(data) {
		const response = {
			success: false,
			error: null,
			tokenObj: {
				id: uuid.v4(),
				token: null,
				fingerPrint: data.fingerPrint,
				hash: data.hash,
			}
		}

		try {
			const tokenData = {
				id: response.tokenObj.id,
				user: {
					id: data.user.id
				},
				hash: data.hash
			};
		
			const expiration = '60d';

			response.tokenObj.token = jwt.sign(tokenData, data.fingerPrint, { expiresIn: expiration });

			if(!response.tokenObj.token) {
				response.error = `Token not created`;
				return response;
			}

			response.success = true;
		
			return response;
		
		} catch(err) {
			console.log(err);
			response.error = `Creating token error`;

			return response
		}
	}

	static async #getUserByEmail(email) {
		const response = {
			success: false,
			error: null,
			user: null,
		}

		try {
			const listUsersJSON = await fs.readFile(this.#listUsers, 'utf8');

			if(!listUsersJSON) {
				response.error = `Server error`;
				return response;
			}
		
			const listUsers = JSON.parse(listUsersJSON);
			const activeUser = listUsers.find(user => user.email === email);
	
			if(!activeUser) {			
				response.error = `Authentication error`;
				return response
			}
			
			response.user = activeUser;
			response.success = true;

			return response;

		} catch (err) {
			response.error = `Unknown error`
			
			return response;
		} 
	}

	static async #getUserById(id) {
		const response = {
			success: false,
			error: null,
			user: null,
		}

		try {
			const listUsersJSON = await fs.readFile(this.#listUsers, 'utf8');

			if(!listUsersJSON) {
				response.error = `Server error`;
				return response;
			}
		
			const listUsers = JSON.parse(listUsersJSON);
			const activeUser = listUsers.find(user => user.id === id);
	
			if(!activeUser) {			
				response.error = `Authentication error`;
				return response
			}
			
			response.user = activeUser;
			response.success = true;

			return response;

		} catch (err) {
			response.error = `Unknown error`
			
			return response;
		} 
	}

	static async #loadRefreshTokensUser(user) {
		const response = {
			success: false,
			error: null,
			tokens: null
		}
	
		try {
			const linkOnRefreshTokens = `${this.#userDatabase}/${user}/${this.#userRefreshTokens}`	
			const listTokensJSON = await fs.readFile(linkOnRefreshTokens, 'utf8');
			const listTokens = listTokensJSON 
				?	JSON.parse(listTokensJSON)
				: []
			
			response.tokens = listTokens;
			response.success = true;	

		} catch (err) {
			response.error = `Server error`

		} finally {
			return response;
		}
	}

	static async #saveListRefreshTokens(user, tokens) {
		const response = {
			success: false,
			error: null,
		} 

		try {
			const tokensJSON = JSON.stringify(tokens);
			const linkOnRefreshTokens = `${this.#userDatabase}/${user}/${this.#userRefreshTokens}`;

			await fs.writeFile(linkOnRefreshTokens, tokensJSON);
			response.success = true;			
		
		} catch(err) {
			response.error = `Server error`;

		} finally {
			return response;
		}
	}
	
	static async #verifyAccessToken(data) {	
		const response = {
			success: false,
			error: null,
			user: null,
		}

		try {
			const { token, hash } = data
			const verifiedToken = jwt.verify(token, this.#TOKEN_SECRET_KEY);

			if(verifiedToken.exp * 1000 < Date.now()) {
				throw(`Token expired`);
			}

			if(verifiedToken.hash !== hash) {
				throw(`Incorrect hash`);
			}

			response.user = verifiedToken.user.id;
			response.success = true;

			return response;
			
		} catch(err) {
			console.log(err)
			response.error = `Authorization error`;

			return response
		} 
	}

	static async #verifyRefreshToken(data) {
		const verificationData = {
			success: false,
			error: null,
			listTokens: null,
			targetToken: null,
			decodedToken: null,
		}

		try {
			verificationData.decodedToken = jwt.decode(data.refreshToken);  

			if((verificationData.decodedToken.exp * 1000)	< Date.now()) {
				throw(`Token expired`)
			}
 
			if(data.hash !== verificationData.decodedToken.hash) {
				throw(`Incorrect hash`)
			}		

			const userRefreshTokensObj = await this.#loadRefreshTokensUser(verificationData.decodedToken.user.id);

			if(!userRefreshTokensObj.success) {
				throw(userRefreshTokensObj.error)
			}

			verificationData.listTokens = userRefreshTokensObj.tokens;
			verificationData.targetToken = verificationData.listTokens.find(item => item.id === verificationData.decodedToken.id)

			if(!verificationData.targetToken) {
				throw(`Token not found`)
			}

			verificationData.decodedToken = jwt.verify(data.refreshToken, verificationData.targetToken.fingerPrint);

			if(data.hash !== verificationData.targetToken.hash)  {
					throw(`Incorrect hash`)
			}

			verificationData.success = true;
			
			return verificationData;
		} catch (err) {
			console.log(err);
			verificationData.error = `Authentication error`;
			
			return verificationData;
		} 
	}
	
	static async #removeFefreshTokenByTokenData(data) {
		const response = {
			success: false,
			error: null,
		}

		try {
			const { token, listTokens, user } = data;
			const indexTargetToken = listTokens.indexOf(token);

			if(indexTargetToken < 0) {
				console.log(`Token not found`)
			}

			if(indexTargetToken > -1) {
				listTokens.splice(indexTargetToken, 1);
				await this.#saveListRefreshTokens(user, listTokens);
			}

			response.success = true;

			return response;

		} catch(err) {
			console.log(err);
			response.error = `Token not removed`;

			return response
		}
	}

	static async #removeFefreshToken(token) {
		const response = {
			success: false,
			error: null,
		}

		try {
			const decodedToken = jwt.decode(token);

			const refreshTokensObj = await this.#loadRefreshTokensUser(decodedToken.user.id);
	
			if(!refreshTokensObj.success) {
				response.error = refreshTokensObj.error;
				return response;
			}

			const userTokens = refreshTokensObj.tokens;
			const indexTargetToken = userTokens.findIndex(item => item.id === decodedToken.id);

			if(indexTargetToken < 0) {
				console.log(`Token not found`)
			}

			if(indexTargetToken > -1) {
				userTokens.splice(indexTargetToken, 1);

				const isUpdatedTokens = await this.#saveListRefreshTokens(decodedToken.user.id, userTokens);

				if(!isUpdatedTokens.success) {
					response.error = isUpdatedTokens.error;
					return response;
				}			
			}	

			response.user = decodedToken.user.id;
			response.success = true;

			return response;

		}	catch (err) {
			console.log(err)
			response.error = `Token not removed`

			return response;
		}
	}

	static async deAuthenticationUser(data) {
		const response = {
			success: false,
			error: null,
		} 

		try {
			const isDeAuthUser = await this.#removeFefreshToken(data.refreshToken);

			if(!isDeAuthUser.success) {
				console.log(isDeAuthUser.error)
				response.error = `deAuthentication error`;

				return response
			}
			response.success = true;

			return response

		} catch(err) {
			console.log(err)
			response.error = `deAuthentication error`;

			return response
		}
	}
}

module.exports = Auth;