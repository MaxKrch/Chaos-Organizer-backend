const Koa = require('koa');
const koaCors = require('@koa/cors');
const { koaBody } = require('koa-body');
const koaStatic = require('koa-static');
const path = require('path');

const public = path.join(__dirname, '/public')
const router = require('./routes/index.js')
const app = new Koa();

app.use(koaCors());
app.use(koaStatic(public));
app.use(koaBody({
	text: true,
  urlencoded: true,
	multipart: true,
  json: true,
}));
app.use(router())

const port = process.env.PORT || 7070;
app.listen(port)