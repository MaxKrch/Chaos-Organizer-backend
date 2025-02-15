const koaCombineRouters = require('koa-combine-routers');

const accountLoginRouter = require('./account/login.js');
const accountRegisterRouter = require('./account/register.js');
const accountValidateEmailRouter = require('./account/validateEmail.js');
const accountLogoutRouter = require('./account/logout.js');
const accountRefreshTokensRouter = require('./account/refreshTokens.js');

const userValidateRouter = require('./user/user.js');

const sseRouter = require('./user/sse.js');

const feedFilesRouter = require('./user/feed/files.js');
const feedNotesRouter = require('./user/feed/notes.js'); 
const feedTagRouter = require('./user/feed/tag.js');

const tagValidateRouter = require('./user/tag/validate.js');
const tagCreateRouter = require('./user/tag/create.js');
const tagEditRouter = require('./user/tag/edit.js');
const tagRemoveRouter = require('./user/tag/remove.js');

const noteCreateRouter = require('./user/note/create.js');
const noteEditRouter = require('./user/note/edit.js');
const noteRemoveRouter = require('./user/note/remove.js');

const fileRemoveRouter = require('./user/file/remove.js');

const router = koaCombineRouters(
	userValidateRouter,
	sseRouter,
	accountLoginRouter,
	accountRegisterRouter,
	accountValidateEmailRouter,
	accountLogoutRouter,
	accountRefreshTokensRouter,
	feedFilesRouter,
	feedNotesRouter,
	feedTagRouter,
	tagValidateRouter,
	tagCreateRouter,
	tagEditRouter,
	tagRemoveRouter,
	noteCreateRouter,
	noteEditRouter,
	noteRemoveRouter,
	fileRemoveRouter,
)

module.exports = router;