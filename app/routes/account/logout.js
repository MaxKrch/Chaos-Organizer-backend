const koaRouter = require('koa-router');
const accountLogoutRouter = new koaRouter()
const logoutUser = require('../../utils/account/logoutUser');

accountLogoutRouter.post('/user/logout', async ctx => {
	const logoutResponse = await logoutUser(ctx.request.body)
	ctx.response.body = JSON.stringify(logoutResponse);
})

module.exports = accountLogoutRouter;