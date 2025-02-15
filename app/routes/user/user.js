const koaRouter = require('koa-router');
const getHeadersHash = require('../../helpers/getHeadersHash')
const authorizeUser = require('../../utils/account/authorizeUser')

const userValidateRouter = new koaRouter();

userValidateRouter.all(/^\/user.*/, async (ctx, next) => {
	const responseAuthorization = await authorizeUser(ctx.request.header);

	if(!responseAuthorization.success) {
		ctx.response.body = JSON.stringify(responseAuthorization)
	}

	if(responseAuthorization.success) {
		ctx.request.body.user = responseAuthorization.user;
		await next();
	}
})

module.exports = userValidateRouter;