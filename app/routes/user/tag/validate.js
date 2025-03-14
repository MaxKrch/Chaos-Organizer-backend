const koaRouter = require('koa-router');
const tagValidateRouter = new koaRouter()
const chekAvailableTag = require('../../../utils/tags/chekAvailableTag')

tagValidateRouter.post('/user/tag/validate', async ctx => {
	const response = await chekAvailableTag(ctx.request.body);
	ctx.response.body = JSON.stringify(response)
})

module.exports = tagValidateRouter;