const koaRouter = require('koa-router');
const accountValidateRouter = new koaRouter();
const chekAvailableEmail = require('../../utils/account/chekAvailableEmail')

accountValidateRouter.post('/account/validateemail', async ctx => {
	const responseChekAvailableEmail = await chekAvailableEmail(ctx.request.body) 
	
	ctx.response.body = JSON.stringify(responseChekAvailableEmail);
})

module.exports = accountValidateRouter;