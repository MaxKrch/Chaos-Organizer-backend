const koaCombineRouters = require('koa-combine-routers');

const pingRouter = require('./ping');
const synchStatistic = require('./user/statistic')

const accountLoginRouter = require('./account/login.js');
const accountRegisterRouter = require('./account/register.js');
const accountValidateEmailRouter = require('./account/validateEmail.js');
const accountLogoutRouter = require('./account/logout.js');
const accountRefreshTokensRouter = require('./account/refreshTokens.js');

const userValidateRouter = require('./user/user.js');

const sseRouter = require('./user/sse.js');

const feedPinnedNoteRouter = require('./user/feed/pinnedNote.js');
const feedNotesRouter = require('./user/feed/notes.js'); 

const tagValidateRouter = require('./user/tag/validate.js');
const tagEditRouter = require('./user/tag/edit.js');
const tagRemoveRouter = require('./user/tag/remove.js');

const notePinRouter = require('./user/note/pin.js');
const noteUnpinRouter = require('./user/note/unpin.js');
const noteAddToFavoritesRouter = require('./user/note/addToFavorites.js');
const noteRemoveFromFavoritesRouter = require('./user/note/removeFromFavorites.js');

const noteCreateRouter = require('./user/note/create.js');
const noteEditRouter = require('./user/note/edit.js');
const noteRemoveRouter = require('./user/note/remove.js');

const fileRemoveRouter = require('./user/file/remove.js');

const router = koaCombineRouters(
	pingRouter,
	userValidateRouter,
	sseRouter,
	synchStatistic,
	accountLoginRouter,
	accountRegisterRouter,
	accountValidateEmailRouter,
	accountLogoutRouter,
	accountRefreshTokensRouter,
	feedPinnedNoteRouter,
	feedNotesRouter,
	tagValidateRouter,
	tagEditRouter,
	tagRemoveRouter,
	notePinRouter,
	noteUnpinRouter,
	noteAddToFavoritesRouter,
	noteRemoveFromFavoritesRouter,
	noteCreateRouter,
	noteEditRouter,
	noteRemoveRouter,
	fileRemoveRouter,
)

module.exports = router;