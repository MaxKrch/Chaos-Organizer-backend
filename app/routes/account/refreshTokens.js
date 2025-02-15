const koaRouter = require('koa-router');
const accountRefreshRouter = new koaRouter();
const refreshUserTokens = require('../../utils/account/refreshUserTokens');
const getHeadersHash = require('../../helpers/getHeadersHash');

accountRefreshRouter.post('/account/refreshtokens', async ctx => {
	const hash = getHeadersHash(ctx.request.header)
	const responseRefreshingToken = await refreshUserTokens({
		...ctx.request.body,
		hash
	});
	
	ctx.response.body = JSON.stringify(responseRefreshingToken)
})

module.exports = accountRefreshRouter;