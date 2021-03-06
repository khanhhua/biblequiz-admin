var koa = require('koa');
var logger = require('koa-logger');
var router = require('koa-router');
var serve = require('koa-static');
var bodyParser = require('koa-bodyparser');
var app = koa();

//logger
app.use(logger());
app.use(bodyParser());

var apiAuth = require('./api.auth');
var apiQuestion = require('./api.question');
var apiUser = require('./api.user');
var apiClient = require('./api.client');

var staticRoute = router();
var rootRoute = router();
var protectedRoute = router();
var publicRoute = router();

apiClient.mount(publicRoute, '');

protectedRoute.get('/questions', apiQuestion.query);
protectedRoute.get('/questions/:id', apiQuestion.get);
protectedRoute.post('/questions', apiQuestion.post);
protectedRoute.post('/questions/:id', apiQuestion.update);

protectedRoute.get('/users', apiUser.query);
protectedRoute.get('/users/me', apiUser.profile);
protectedRoute.get('/users/:id', apiUser.get);
protectedRoute.post('/users', apiUser.post);
protectedRoute.post('/users/:id', apiUser.update);

protectedRoute.post('/authenticate', apiAuth.authenticate);

rootRoute.use('/api/client', apiAuth.middlewares.deserializer, publicRoute.routes());
rootRoute.use('/api', apiAuth.middlewares.deserializer, protectedRoute.routes());
app.use(rootRoute.routes());

var staticRoot;
if (process.env.NODE_ENV === 'production') {
  staticRoot = 'dist';
}
else {
  staticRoot = 'frontend/dist';
}
staticRoute.get(/(assets|fonts)/, serve(staticRoot));
staticRoute.get('/help', function *(){
  this.set('Content-Type', 'text/html');
  this.body = '<pre>For help: curl biblequiz-admin.khanhhua.com/help</pre>';
});
staticRoute.get('/', serve(staticRoot));

app.use(staticRoute.routes());

module.exports = app;