const koaRouter = require('koa-router');
const accountValidateRouter = new koaRouter();
const chekingAvailableEmail = require('../../utils/account/chekingAvailableEmail')

accountValidateRouter.post('/account/validateemail', async ctx => {
	const responseChekingAvailableEmail = await chekingAvailableEmail(ctx.request.body) 
	
	ctx.response.body = JSON.stringify(responseChekingAvailableEmail);
})

module.exports = accountValidateRouter;