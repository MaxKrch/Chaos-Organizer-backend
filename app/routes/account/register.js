const koaRouter = require('koa-router');
const accountRegisterRouter = new koaRouter();
const registerUser = require('../../utils/account/registerUser');
const getHeadersHash = require('../../helpers/getHeadersHash');

accountRegisterRouter.post('/account/register', async ctx => {
	const hash = getHeadersHash(ctx.request.header)
	const responseRegistrationUser = await registerUser({
		...ctx.request.body,
		hash
	});

	ctx.response.body = JSON.stringify(responseRegistrationUser);
})

module.exports = accountRegisterRouter;