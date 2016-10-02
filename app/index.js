var koa = require('koa');
var logger = require('koa-logger');
var router = require('koa-router')();
var bodyParser = require('koa-bodyparser');
var app = koa();

//logger
app.use(logger());
app.use(bodyParser());

var apiAuth = require('./api.auth');
var apiQuestion = require('./api.question');

router.get('/api/questions', apiAuth.middlewares.deserializer, apiQuestion.query);
router.get('/api/questions/:id', apiQuestion.get);
router.post('/api/questions', apiQuestion.post);
router.post('/api/questions/:id', apiQuestion.update);

router.post('/api/authenticate', apiAuth.authenticate);

app.use(router.routes());

app.use(function *(){
  this.set('Content-Type', 'text/html');
  this.body = '<pre>For help: curl biblequiz-admin.khanhhua.com/help</pre>';
});

module.exports = app;