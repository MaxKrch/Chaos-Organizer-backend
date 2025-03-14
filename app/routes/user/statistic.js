const koaRouter = require('koa-router');
const synchStatistic = new koaRouter();

const getStatistic = require('../../utils/account/getStatistic');

synchStatistic.post('/user/statistic', async ctx => {
	const response = await getStatistic(ctx.request.body.user)
	ctx.response.body = JSON.stringify(response)		
})

module.exports = synchStatistic;