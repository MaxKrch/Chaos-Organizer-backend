const koaRouter = require('koa-router');
const tagValidateRouter = new koaRouter()

tagValidateRouter.post('/user/tag/validate', async ctx => {
	console.log('tag validate router');
	const resp = JSON.stringify({
		success: true,
		error: null,
		data: {
			tag: {
				id: `154`,
				title:`545`,
				available: true,
			}
		}
	})
	ctx.response.body = resp;
})

module.exports = tagValidateRouter;