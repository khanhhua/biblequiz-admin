const http = require('http');
const app = require('./app');
const server = http.createServer(app.callback());

server.listen(process.env.PORT || 8080, '0.0.0.0', () => {
    console.log("Server listening on: http://localhost:%s", process.env.PORT || 8080);
});
