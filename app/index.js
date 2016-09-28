'use strict';

var koa = require('koa');
var logger = require('koa-logger');
var router = require('koa-router')();
var app = koa();

//logger
app.use(logger());

var apiQuestion = require('./api.question');
router.get('/api/questions', apiQuestion.query);
router.get('/api/questions/:id', apiQuestion.get);
router.post('/api/questions', apiQuestion.post);

app.use(router.routes());

app.use(function *(){
  this.set('Content-Type', 'text/html');
  this.body = '<pre>For help: curl biblequiz-admin.khanhhua.com/help</pre>';
});

module.exports = app;