const path = require('path')
const uuid = require('uuid')
const fs = require('fs')
const { USER_FILE_TYPES, FILE_NAMES, PATHS } = require('../data/VARIABLE.js')

class File {
	static #USER_FILE_TYPES = USER_FILE_TYPES; 
	static #PATHS = PATHS;
	static #FILE_NAMES = FILE_NAMES;

	static async saveFilesToServer(files, user) {
		const response = {
			success: false,
			error: null,
			messages: [],
			savedFiles: null,
		}

		if(!files) {
			response.error = `Файлы не получены`;
			return response;
		}

		try {
			const tempListUploadedFiles = []
			const linksSavedFilesObj = await this.#loadListLinksUser(user)

			if(!linksSavedFilesObj.success) {
				response.error = linksSavedFilesObj.error;
				return response;
			}
	
			const linksUserFiles = linksSavedFilesObj.links;
			const countAvailableForSaveFiles = this.#getCountAvailableForSaveFiles(linksUserFiles);

			for(let key in files) {
				const file = files[key];	
				const tempFileName = file.newFilename;
				const name = file.originalFilename;
				
				const type = this.#getMimeTypeFile(file.mimetype);
				const ext = this.#getExtensionFile(name, type);

				if(countAvailableForSaveFiles[type] < 1) {
					response.messages.push(`Файл ${name} не загружен - превышен лимит файлов`)
					continue;
				}
		
				const isAvailableSizingFile = this.#chekingFileSize(type, file.size)

				if(!isAvailableSizingFile) {
					response.messages.push(`Файл ${name} не загружен - превышен размер файла`)
					continue;
				}

				const id = uuid.v4();
				const publicFilePath = this.#createFileLink(user, id, type, ext);
				const relativeFilePath = this.#createFilePath(user, id, type, ext);
				const isUploadedFile = await this.#uploadFileToServer(file, relativeFilePath);

				if(!isUploadedFile.success) {
					response.messages.push(`Файл ${name} не был загружен на сервер`)
					continue;
				}

				const fileObj = {
					id,
					_path: relativeFilePath,
					link: publicFilePath,
					name,
				}

				const fileTempObj = {
					file: fileObj,
					tempName: tempFileName,
					type,
				}

				linksUserFiles[type].push(fileObj);
			 	tempListUploadedFiles.push(fileTempObj);
			}

			const isUpdatedLinksUser = await this.#saveListLinksUser(user, linksUserFiles)

			if(!isUpdatedLinksUser.success) {
				tempListUploadedFiles.forEach(async item => {
					await this.#deleteFileFromServer(item.file._path);
				})
			}

			response.savedFiles = tempListUploadedFiles;
			response.success = true;

		} catch(err) {
			response.error = 'Ошибка загрузки файлов на сервер'
		
		} finally {
			return response
		}
	} 

	static async getFilesFromServer(user, type, lastId) {
		const response = {
			success: false,
			error: null,
			links: []
		}

		try {
// 			const linksUserFilesObj = await 
// 			протестить вариант с видео и аудио
// //загрузить файлы, найии по индексу, взять пред 10, 
		} catch (err) {
			response.error = `Ошибка получения файлов с сервера`
		} finally {
			return response;
		}
	}

	static async removeFileFromServer(user, type, id) {
		const response = {
			success: false,
			error: null,
		}

		try {
			const linksUserFilesObj = await this.#loadListLinksUser(user);

			if(!linksUserFilesObj.success) {
				response.error = linksUserFilesObj.error;
				return response
			}

			const linksUserFiles = linksUserFilesObj.links;
			const linksUserFilesCurrentType = linksUserFiles[type];
			const targetFile = linksUserFilesCurrentType.find(file => file.id === id);
			const indexTargetFile = linksUserFilesCurrentType.indexOf(targetFile);
			const isRemovedFile = await this.#deleteFileFromServer(targetFile._path);

			if(!isRemovedFile.success) {
				response.error = isRemovedFile.error;
				return response;
			}

			linksUserFilesCurrentType.splice(indexTargetFile, 1);

			const isUpdatedLinksUser = await this.#saveListLinksUser(user, linksUserFiles);

			if(!isUpdatedLinksUser.success) {
				response.error = isUpdatedLinksUser.error;
				return response; 
			}

			response.success = true;

		} catch (err) {
			response.error = `Файл не был удален с сервера`
		
		} finally {
			return response;
		}
	}

	static #getCountAvailableForSaveFiles(arrayLinks) {
		const response = {
			success: false,
			error: null,
		}

		const countAvailableForSaveFiles = {}
		for(let item of this.#USER_FILE_TYPES) {
			const name = item.NAME;
			countAvailableForSaveFiles[name] = item.MAX_COUNT - arrayLinks[name].length || 0;
		}

		return countAvailableForSaveFiles;
	}

	static #createFilePath(user, id, type, ext) {
		const newFilePath = `${this.#PATHS.STORAGE_USERS_FILES}/${user}/${type}/${id}.${ext}`;

		const relativeFilePath = `../${this.#PATHS.STATIC_DIRECTORY}/${newFilePath}`

		return relativeFilePath;
	}

	static #createFileLink(user, id, type, ext) {
		const fileLink = `/${this.#PATHS.STORAGE_USERS_FILES}/${user}/${type}/${id}.${ext}`;

		return fileLink;
	}


	static #getMimeTypeFile(mimetype) {
		const typeFileArray = mimetype.split('/')
		const typeFromFile = typeFileArray[0];
				
		const isExistType = this.#USER_FILE_TYPES.findIndex(item => item.NAME === typeFromFile);

		const type = (isExistType >= 0) ? 
			typeFromFile :
			'other';	

		return type;
	}

	static #getExtensionFile(name, type) {
		const arrayFromName = name.split('.');
		const ext = arrayFromName[arrayFromName.length - 1] || type;

		return ext;
	}


	static #chekingFileSize(type, size) {
		const currentFileType = this.#USER_FILE_TYPES.find(item => item.NAME === type);
		
		const maxSize = currentFileType.MAX_SIZE * 1024 * 1024;
		
		const isChek = (maxSize > size) ? true : false;

		return isChek;
	}


	static async #loadListLinksUser(user) {
		const response = {
			success: false,
			error: null,
			links: null,
		}

		try {		
			const fullPath = this.#createFullPathUserLinks(user);	

			const linksJSON = await new Promise((res, rej) => {	
				fs.readFile(fullPath, 'utf8', (err, data) => {
					try {	
						if(err) {
							rej(err)
						}
						res(data)

					} catch (err) {
						rej(err)
					}
				})
			})

			const links = JSON.parse(linksJSON);
		
			response.links = links;
			response.success = true;
		
		} catch(err) {
			response.error = 'Ошибка загрузки файла ссылок'
		
		} finally {
			return response;
		}
	}

	static async #saveListLinksUser(user, links) {
		const response = {
			success: false,
			error: null
		}

		if(!links) {
			response.error = 'Ошибка в списке ссылок';
			return response
		}

		try {
			const fullPath = this.#createFullPathUserLinks(user);
		
			await new Promise((resolve, reject) => {
				try {
					const linksJSON = JSON.stringify(links);

					fs.writeFile(fullPath, linksJSON, err => {
						if(err) {
							reject(err)
						}
						resolve()
					})

				} catch(err) {
					reject(err)
				}
			})

			response.success = true;
		
		} catch(err) {
			response.error = 'Ошибка сохранения файла ссылок'
		
		} finally {
			return response;
		}
	}

	static #createFullPathUserLinks(user) {
		const fullPath = path.join(__dirname, `../${this.#PATHS.DB_DIRECTORY}/${this.#PATHS.STORAGE_USERS_DATA}/${user}/${this.#FILE_NAMES.USER.LINKS}`);

		return fullPath;
	}

	static async #uploadFileToServer(file, relativePath) {
		const response = {
			success: false,
			error: null,
		}

		try {
			await new Promise((resolve, reject) => {
 				const newPath = path.join(__dirname, relativePath);
	     	const byError = err => reject(err)
     
	     	const readStream = fs.createReadStream(file.filepath);
    		const writeStream = fs.createWriteStream(newPath);

	    	readStream.on('error', byError);
  	  	writeStream.on('error', byError);

 		   	readStream.on('close', () => {
      		fs.unlink(file.filepath, byError);
   		   	resolve(newPath);
    		});

    		readStream.pipe(writeStream);
  		});

			response.success = true;

		} catch (err) {
			response.error = `Ошибка записи файла`

		} finally {
			return response;
		}		
	}

	static async #deleteFileFromServer(relativePath) {
		const response = {
			success: false,
			error: null,
		}

		try {
			await new Promise((resolve, reject) => {
				const fullPath = path.join(__dirname, relativePath);

				fs.unlink(fullPath, err => reject(err));
				resolve(fullPath)
			})

			response.success = true;

		} catch (err) {
			response.error = `Файл не был удален с сервера`
	
		} finally {
			return response;
		}

	}
}


module.exports = File;







// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(ffmpegPath);
// const path = require('path')



// fileRemoveRouter.post('/file', async ctx => {


// const name = 'File[0]'
//   const file = ctx.request.files[name];
//   const filepath = file.originName;

//   // imagine the file is saved to the server at this point
//   const link = path.join(__dirname, `./video.mp4`)
//   ffmpeg({
//     source: link,
//   }).takeScreenshots({
//     filename: "example.jpg",
//     timemarks: [2],
//     folder: "./",
//   });

//   ctx.response.body = 'ok'

// });
