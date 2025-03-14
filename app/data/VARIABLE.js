const VARIABLE = {
	USER_FILE_TYPES: [
		{
			NAME: 'video',
			MAX_SIZE: 10,
			MAX_COUNT: 5,
			PREVIEW: {
				MAX_SIZE: 1,
			},
		},
		// {
		// 	NAME: 'poster',
		// 	MAX_SIZE: 1,
		// 	MAX_COUNT: 5,
		// },
		{
			NAME: 'audio',
			MAX_SIZE: 7,
			MAX_COUNT: 10,
		},
		{
			NAME: 'other',
			MAX_SIZE: 5,
			MAX_COUNT: 16,
		},		
		{
			NAME: 'image',
			MAX_SIZE: 4,
			MAX_COUNT: 25,
		}		
	],
	PATHS: {
		DB_DIRECTORY: 'db',
		STATIC_DIRECTORY: 'public',
		STORAGE_USERS_DATA: 'users',
		STORAGE_USERS_FILES: 'storage',
	},
	FILE_NAMES: {
		USERS: {
			LIST: 'users.json',
		},
		USER: {
			NOTES:	'notes.json',
			FILES: 'files.json',
			TOKENS: 'tokens.json',
			TAGS: 'tags.json'
		}
	},
	TOKEN_SECRET_KEY: `banana`,
	CTYPTO_KEY: 'tomato'
}

module.exports = VARIABLE

	
