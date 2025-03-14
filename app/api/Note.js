const path = require('path')
const uuid = require('uuid')
const { sendEventToClients } = require('./SSE');
const fs = require('fs').promises;
const sliceNotesArray = require('../helpers/sliceNotesArray')
const { FILE_NAMES, PATHS, USER_FILE_TYPES } = require('../data/VARIABLE.js');


class Note {
	static #PATHS = PATHS;
	static #FILE_NAMES = FILE_NAMES;
	static #USER_FILE_TYPES =	USER_FILE_TYPES;
	static #USERS_DB_DIRECTORY = path.join(__dirname, `../${this.#PATHS.DB_DIRECTORY}/${this.#PATHS.STORAGE_USERS_DATA}`)

	static async getNotesFromServer(data) {
		const response = {
			success: false,
			error: null,
			notes: null,
		}

		try {
			const userNotesObj = await this.#loadUserNotes(data.user)
			
			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}	

			let targetNotesArray = userNotesObj.notes

			if(data.section === `tag`) {
				targetNotesArray = this.filterNotesByTag({
					notes: userNotesObj.notes,
					tag: data.tag.id
				})
			}

			if(data.category === `favorites`)	{
				targetNotesArray = this.filterFavoritesNotes(userNotesObj.notes);
			}
			response.notes = sliceNotesArray({
				start: data.start,
				end: data.end,
				count: data.count,
				notes: targetNotesArray,
			})

			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error = `Unknown error`;

			return response;
		}
	}

	static async saveCreatedNote(data) {	
		const response = {
			success: false,
			error: null,
			note: null,
		}
		try {	
			const note = {
				id: data.note.id,
				text: data.note.text,
				savedOnServer: true, 
				favorite: data.note.favorite,
				pinned: data.note.pinned,
				attachment: {
				},
				tags: [],
				geolocation: JSON.parse(data.note.geolocation),
				dates: JSON.parse(data.note.dates),
			}

			const createdTags = []
			const receivedTags = JSON.parse(data.note.tags)
			receivedTags.forEach(tag => {
				if(tag.new) {
					const newTag = {
						id: uuid.v4(),
						title: tag.title,
					}
					createdTags.push(newTag);
					note.tags.push(newTag);

					return;
				}
				note.tags.push(tag)
			})

			if(createdTags.length > 0) {
				const isSavedCreatedTags = await this.#saveNewUserTags(data.note.user, createdTags);
		
				if(!isSavedCreatedTags.success) {
					response.error = `Fail save tags`;
					return response;
				}
			}

			this.#USER_FILE_TYPES.forEach(item => {
				note.attachment[item.NAME] = []
			})

			data.filesLinks.forEach(item => {
				note.attachment[item.type].push(item.file);
			})

			const isSavedNote = await this.#saveNewUserNote(data.note.user, note)

			if(!isSavedNote.success) {
				response.error = `Fail save note`

				return response;
			}

			response.note = note;
			response.success = true;

			return response;

		} catch(err) {
			console.log(err);
			response.error = `Fail save note`

			return response;
		}
	}

	static async saveEditedNote(data) {
		const response = {
			success: false,
			error: null,
			data: null,
			noteSaved: false,
		}

		try {	
			const userNotesObj = await this.#loadUserNotes(data.user);

			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}

			const userNotes = userNotesObj.notes;
			const createdTags = []
			const noteTags = data.note.tags.map(tag => {
				if(tag.new) {
					const newTag = {
						id: uuid.v4(),
						title: tag.title,
					}
					createdTags.push(newTag);
					return newTag;
				
				} else {
					return tag
				}
			})
	
			data.note.tags = noteTags;

			if(createdTags.length > 0) {
				const isSavedCreatedTags = await this.#saveNewUserTags(data.note.user, createdTags);
		
				if(!isSavedCreatedTags.success) {
					response.error = `Fail save tags`;
					return response;
				}
			}

			const targetNote = userNotes.find(note => note.id === data.note.id)

			if(targetNote) {
				if(targetNote.dates.edited > data.note.dates.edited) {
					response.data = {
						editedNote: targetNote,
					}
					response.success = true;
					return response;
				}

				const indexTargetNote = userNotes.indexOf(targetNote);
				userNotes.splice(indexTargetNote, 1, data.note)
			
			} else {
				userNotes.push(data.note)
			}

		 	const isSavedNote = await this.#saveUserNotes(data.user, userNotes);

			if(!isSavedNote.success) {
				response.error = `Fail save note`

				return response;
			}

			response.data = {
				editedNote: data.note,
			}
			response.noteSaved = true,
			response.success = true;

			return response;

		} catch(err) {
			console.log(err);
			response.error = `Unknown error`

			return response;
		}
	}
	
	static async removeNote(data) {
		const response = {
			success: false,
			error: null,
			note: null,
		}

		try {
			const userNotesObj = await this.#loadUserNotes(data.user);
			
			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}

			const userNotes = userNotesObj.notes;

			const indexTargetNote = userNotes.findIndex(item => item.id === data.note.id);

			if(indexTargetNote > -1) {
				userNotes.splice(indexTargetNote, 1);
				const isSavedNotes = await this.#saveUserNotes(data.user, userNotes);
					
				if(!isSavedNotes.success) {
					response.error = `Fail save notes`
					return response;
				}
			}
			
			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error `Unknown error`;

			return response;
		}
	}

	static async removeAttachmnetFromNote(data) {
		const response = {
			success: false,
			error: null,
			note: null,
		}

		try {
			const userNotesObj = await this.#loadUserNotes(data.user);
			
			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}

			const targetNote = userNotesObj.notes.find(item => item.id === data.file.note.id);

			if(targetNote) {
				const targetAttachmentArray = targetNote.attachment[data.file.type];
				const indexTargetAttachment = targetAttachmentArray.findIndex(item => item.id === data.file.id)

				if(indexTargetAttachment > -1) {
					targetAttachmentArray.splice(indexTargetAttachment, 1)
					
					const isSavedNotes = await this.#saveUserNotes(data.user, userNotesObj.notes);
					
					if(!isSavedNotes.success) {
						response.error = `Fail save notes`
						return response;
					}
				}
			}
			
			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error `Unknown error`;

			return response;
		}
	}

	static async pinNote(data) {
		const response = {
			success: false,
			error: null,
			data: null
		}

		try {
			const userNotesObj = await this.#loadUserNotes(data.user);
			
			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}

			const newUserNotes = userNotesObj.notes.map(note => {
				note.pinned = note.id === data.note.id
					? true
					: false

				if(note.id === data.note.id) {
					response.data = {
						pinnedNote: note
					}
				}
				
				return note;
			})

			const isSavedNotes = await this.#saveUserNotes(data.user, newUserNotes);

			if(!isSavedNotes.success) {
				response.error = `Fail save notes`
				return response;
			}

			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error `Unknown error`;

			return response;
		}
	}

	static async unpinNote(data) {
		const response = {
			success: false,
			error: null,
			data: null
		}

		try {
			const userNotesObj = await this.#loadUserNotes(data.user);
			
			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}

			const newUserNotes = userNotesObj.notes.map(note => {
				if(note.id === data.note.id) {
					note.pinned = false;
					response.data = {
						unpinnedNote: {
							id: note.id,
						}
					}
				}
				return note;
			})

			const isSavedNotes = await this.#saveUserNotes(data.user, newUserNotes);

			if(!isSavedNotes.success) {
				response.error = `Fail save notes`
				return response;
			}

			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error `Unknown error`;

			return response;
		}
	}

	static async getPinnedNote(data) {
		const response = {
			success: false,
			error: null,
			data: null
		}

		try {
			const userNotesObj = await this.#loadUserNotes(data.user);
			
			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}

			const pinnedNoteFromList = userNotesObj.notes.find(note => note.pinned)

			const pinnedNote = pinnedNoteFromList 
				? pinnedNoteFromList
				: null
			response.data = {
				pinnedNote: pinnedNote
			}
			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error `Unknown error`;

			return response;
		}
	}

	static async addNoteToFavorites(data) {
		const response = {
			success: false,
			error: null,
			data: null
		}

		try {
			const userNotesObj = await this.#loadUserNotes(data.user);
			
			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}

			const userNotes = userNotesObj.notes;
			const targetNote = userNotes.find(note => note.id === data.note.id)
			targetNote.favorite = true;

			const isSavedNotes = await this.#saveUserNotes(data.user, userNotes);

			if(!isSavedNotes.success) {
				response.error = `Fail save notes`
				return response;
			}

			response.data = {
				addedToFavoritesNote: targetNote,
			}
			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error `Unknown error`;

			return response;
		}
	}

	static async removeNoteFromFavorites(data) {
		const response = {
			success: false,
			error: null,
			data: null
		}

		try {
			const userNotesObj = await this.#loadUserNotes(data.user);
			
			if(!userNotesObj.success) {
				response.error = `Fail load notes`;
				return response;
			}

			const userNotes = userNotesObj.notes;
			const targetNote = userNotes.find(note => note.id === data.note.id)
			targetNote.favorite = false;

			const isSavedNotes = await this.#saveUserNotes(data.user, userNotes);

			if(!isSavedNotes.success) {
				response.error = `Fail save notes`
				return response;
			}

			response.data = {
				removedFromFavoritesNote: targetNote,
			}
			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error `Unknown error`;

			return response;
		}
	}

	static async editeTag(data) {
		data.action = `edite`
		return this.#updateTag(data);
	}

	static async removeTag(data) {
		data.action = `remove`
		return this.#updateTag(data)
	}

	static async #updateTag(data) {
		const response = {
			success: false,
			error: null,
			editedTag: null,
			removedTag: null,
		}

		try {
			const userTagsObj = await this.#loadUserTags(data.user)

			if(!userTagsObj.success) {
				response.error = `Fail load tags`;
				return response;
			}

			const tags = userTagsObj.tags;
			const indexTag = tags.findIndex(tag => tag.id === data.tag.id)
	
			if(indexTag < 0) {
				response.error = `Tag not found`;
				return response;
			}

			const oldTags = JSON.parse(JSON.stringify(tags))

			data.action === `edite`
				?	tags.splice(indexTag, 1, data.tag)
				: tags.splice(indexTag, 1)

			const userNotesObj = await this.#loadUserNotes(data.user);

			if(!userNotesObj.success) {
				response.error = `Fail load notes`
			}

			const oldNotes = userNotesObj.notes;
			const notes = oldNotes.map(note => {
				const indexTargetTag = note.tags.findIndex(tag => tag.id === data.tag.id);
				if(indexTargetTag > -1) {
					data.action === `edite`
						? note.tags.splice(indexTargetTag, 1, data.tag)
						:	note.tags.splice(indexTargetTag, 1)
				}
				return note
			}) 

			const isSavedTags = await this.#saveUserTags(data.user, tags)

			if(!isSavedTags.success) {
				response.error = `Fail save tags`;
				return response;
			}

			const isSavedNotes = await this.#saveUserNotes(data.user, notes);

			if(!isSavedNotes.success) {
				await this.#saveUserTags(data.user, oldTags);
				response.error = `Fail save notes`;
				return response
			}

			data.action === `edite`
				?	response.editedTag = data.tag
				: response.removedTag = data.tag
			response.success = true;

			return response;

		} catch(err) {
			console.log(err);
			response.error = `Unknown error`
			
			return response;
		}
	}

	static async #saveNewUserNote(user, note) {
		const response = {
			success: false,
			error: null,
		}

		try {
			const userNotes = await this.#loadUserNotes(user)
			
			if(!userNotes.success) {
				response.error = `Fail load notes`;
				return response;
			}

			userNotes.notes.push(note);

			const isSavedNotes = await this.#saveUserNotes(user, userNotes.notes);

			if(!isSavedNotes.success) {
				response.error = `Fail save notes`;
				return response;
			}

			response.success = true;

			return response;

		} catch(err) {
			console.log(err);
			response.error = `Unknown error`;

			return response;
		}
	}

	static async #saveNewUserTags(user, createdTags) {
		const response = {
			success: false,
			error: null,
		}
		try {
			const userTags = await this.#loadUserTags(user)
			
			if(!userTags.success) {
				response.error = `Fail load tags`;
				return response;
			}

			userTags.tags.push(...createdTags);

			const isSavedTags = await this.#saveUserTags(user, userTags.tags);

			if(!isSavedTags.success) {
				response.error = `Fail save tags`;
				return response;
			}

			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error = `Unknown error`;

			return response;
		}
	}

	static async #loadUserNotes(user) {
		const response = {
			success: false,
			error: null,
			notes: null,
		}

		try {
			const linkToUserNotes = this.#createFullLinkToUserNotes(user);
			const userNotesJSON = await fs.readFile(linkToUserNotes, 'utf8');

			const userNotes = userNotesJSON
				? JSON.parse(userNotesJSON)
				: []

			response.notes = userNotes;
			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error = `Fail load notes`

			return response;
		}
	} 

	static async #saveUserNotes(user, notes) {
		const response = {
			success: false,
			error: null,
		}

		try {
			const linkToUserNotes = this.#createFullLinkToUserNotes(user);
			const notesJSON = JSON.stringify(notes)

			await fs.writeFile(linkToUserNotes, notesJSON)

			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error = `Fail save notes`;

			return response;
		}
	}

	static async getUserTags(user) {
		return this.#loadUserTags(user)
	}

	static async #loadUserTags(user) {
		const response = {
			success: false,
			error: null,
			tags: null,
		}

		try {
			const linkToUserTags = this.#createFullLinkToUserTags(user);
			const userTagsJSON = await fs.readFile(linkToUserTags, 'utf8');
			const userTags = userTagsJSON
				? JSON.parse(userTagsJSON)
				: [];

			response.tags = userTags;
			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error = `Fail load tags`;

			return response;
		}
	} 

	static async #saveUserTags(user, tags) {
		const response = {
			success: false,
			error: null,
		}

		try {
			const linkToUserTags = this.#createFullLinkToUserTags(user);
			const tagsJSON = JSON.stringify(tags)

			await fs.writeFile(linkToUserTags, tagsJSON)
			response.success = true;

			return response;

		} catch(err) {
			console.log(err)
			response.error = `Fail save tags`

			return response;
		}
	}

	static #createFullLinkToUserNotes(user) {
		return `${this.#USERS_DB_DIRECTORY}/${user}/${this.#FILE_NAMES.USER.NOTES}`
	}

	static #createFullLinkToUserTags(user) {
		return `${this.#USERS_DB_DIRECTORY}/${user}/${this.#FILE_NAMES.USER.TAGS}`
	}

	static filterNotesByTag(data) {
		return data.notes.filter(note => {
			const index = note.tags.findIndex(noteTag => noteTag.id === data.tag);
			return index > -1
		})
	}

	static filterFavoritesNotes(notes) {
		return notes.filter(note => note.favorite)
	}


}

module.exports = Note;