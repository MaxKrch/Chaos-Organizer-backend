const koaRouter = require('koa-router');
const getHeadersHash = require('../../helpers/getHeadersHash');
const loginUser = require('../../utils/account/loginUser');

const accountLoginRouter = new koaRouter();

accountLoginRouter.post('/account/login', async ctx => {
	const hash = getHeadersHash(ctx.request.header)
	const responseAuthetication = await loginUser({
		...ctx.request.body,
		hash
	});

	ctx.response.body = JSON.stringify(responseAuthetication)
})

module.exports = accountLoginRouter; 