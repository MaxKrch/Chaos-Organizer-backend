const fs = require('fs').promises;
const path = require('path');
const uuid = require('uuid');
const argon2 = require('argon2');
const { USER_FILE_TYPES, FILE_NAMES, PATHS } = require('../data/VARIABLE.js')

class Registration {
	static #USER_FILE_TYPES = USER_FILE_TYPES;
	static #FILE_NAMES = FILE_NAMES;
	static #PATHS = PATHS;
	static #listUsers = path.join(__dirname, `../${this.#PATHS.DB_DIRECTORY}/${this.#FILE_NAMES.USERS.LIST}`);
	static #storageUsers = path.join(__dirname, `../${this.#PATHS.STATIC_DIRECTORY}/${this.#PATHS.STORAGE_USERS_FILES}`);
	static #databaseUsers = path.join(__dirname, `../${this.#PATHS.DB_DIRECTORY}/${this.#PATHS.STORAGE_USERS_DATA}`);

	static async createAccount(data) {	
		const { email, password, phone = null } = data;
		const response = {
			success: false,
			error: null,
			user: null,
		}
	
		if(!email || !password) {
			response.error = `Incorrect data`
			return response;		
		}
	
		if(!await this.checkAvailableEmail(email)) {
			response.error = 'Email already use';
			return response;
		}
		
		const userId = uuid.v4();
 		const newStorageObj = await this.#createAccountStorage(userId);

 		if(!newStorageObj.success) {
 			response.error = newStorageObj.error;
 			return response;
 		}

 		const { storage, db } = newStorageObj;
 		const newUserObj = await this.#saveUserToDatabase({ userId, email, password, phone, storage, db });
 		
 		if(!newUserObj.success) {
 			response.error = newUserObj.error;
 			return response;
 		}
	
		response.user = {
			id: userId,
			email,
		};

		response.success = true;

		return response;	
	}

	static async #createAccountStorage(userId) {
		const response = {
			success: false,
			error: null,
			db: null,
		}

		try {
			const storageUser = `${this.#storageUsers}/${userId}`;
			const databaseUser = `${this.#databaseUsers}/${userId}`;

			await fs.mkdir(storageUser);
			await fs.mkdir(databaseUser);
			
			const filesLinks = {};

			this.#USER_FILE_TYPES.forEach(file => {
				const name = file.NAME;
				filesLinks[name] = []
			})
		
			const filesLinksJSON = JSON.stringify(filesLinks)

			await fs.writeFile(`${databaseUser}/${this.#FILE_NAMES.USER.FILES}`, filesLinksJSON);
			await fs.writeFile(`${databaseUser}/${this.#FILE_NAMES.USER.NOTES}`, '');
			await fs.writeFile(`${databaseUser}/${this.#FILE_NAMES.USER.TAGS}`, '');
			await fs.writeFile(`${databaseUser}/${this.#FILE_NAMES.USER.TOKENS}`, '');

			this.#USER_FILE_TYPES.forEach(async file => {
				const name = file.NAME;
				await fs.mkdir(`${storageUser}/${name}`);
				
				if(file.PREVIEW) {
					await fs.mkdir(`${storageUser}/${name}/preview`);
				}
			})			

			response.storage = storageUser;
			response.db = databaseUser; 
			response.success = true;

		}	catch(err) {
			response.error = 'Server error'

		} finally {
			return response;
		}
	}

	static async #saveUserToDatabase(user) {
		const response = {
			success: false,
			error: null,
			user: null,
		}

		try {
	 		const { userId, email, password, phone, storage, db } = user;
			const newUser = {
				id: userId,
				// _storage: storage,
				// _db: db,
				_password: await argon2.hash(password),
				email,
				phone,
			}
		
			const listUsersObj = await this.#loadListUsers();

			if(!listUsersObj.success) {
				response.error = userListObj.error;
				return response;
			}
		
			const userList = listUsersObj.data;

			userList.push(newUser);
				
			await this.#saveListUsers(userList);

			response.user = newUser;		
			response.success = true;
		
		}	catch (err) {
			response.error = 'Server error'

		} finally {
			return response;
		}
	}

	static async checkAvailableEmail(email) {
		const response = {
			success: false,
			error: null,
		}

		try {
			const userListObj = await this.#loadListUsers();

			if(!userListObj.success) {
				response.error = `Server error`;
				return response;
			}
		
			const isExistEmail = userListObj.data.findIndex(user => user.email === email);
	
			if(isExistEmail > -1) {
				response.error = `Email already use`;
				return response
			}

			response.success = true;
			
			return response;

		} catch(err) {
			response.error = `Server error`;
			
			return response;
		}
	}

	static async #loadListUsers() {
		const response = {
			success: false,
		}

		try {
			const userListJSON = await fs.readFile(this.#listUsers, 'utf8');
			const userList = userListJSON ? 
				JSON.parse(userListJSON) :
				[];
			
			response.data = userList;
			response.success = true;
	
		} catch (err) {
			response.error = `Ошибка чтения файла пользователей`

		} finally {
			return response;
		}
	}

	static async #saveListUsers(users) {
		const response = {
			success: false,
		}

		try {
			const userListJSON = JSON.stringify(users);
			await fs.writeFile(this.#listUsers, userListJSON);
			response.success = true;
		
		} catch (err) {
			response.error = `Ошибка сохранения файла пользователей`
		
		} finally {
			return response;
		}
	}
}

module.exports = Registration;