const crypto = require('crypto');
const thunkify = require('thunkify');

const jsonwebtoken = require('jsonwebtoken');
const SECRET = 's3cr3t';

const config = require('../config');
const db = config.db(require('cloudant'));

exports.link = function *() {

};

exports.authenticate = function *() {
  const credential = this.request.body; // {username,password}
  if (!credential.username || !credential.password) {
    this.status = 400;
    this.status = 'Missing credential';
    return;
  }

  const sha1 = crypto.createHash('sha1');
  const hashedPass = sha1.update(credential.password).digest('hex');

  const data = yield thunkify(db.view)('user', 'user-credential', {key: [credential.username, hashedPass]});
  if (data.length !== 2) {
    this.status = 403;
    this.status = 'Invalid username or password';
    return;
  }

  if (data[0].rows.length !== 1) {
    this.status = 403;
    this.body = 'Invalid username or password';
    return;
  }

  const roles = data[0].rows[0].value;
  const token = jsonwebtoken.sign(
    {
      sub: credential.username,
      exp: new Date().getTime() + 3600000
    }, SECRET);

  this.status = 200;
  this.body = {
    jwt: token,
    username: credential.username,
    roles: roles
  };
};

exports.middlewares = {
  deserializer: function *(next) {
    const authentication = this.headers['authorization'];
    if (!authentication) {
      return yield next;
    }

    if (!authentication.startsWith('jwt ')) {
      return yield next;
    }

    const jwt = authentication.substring(4);
    try {
      const payload = jsonwebtoken.verify(jwt, SECRET);

      this.request.currentUser = {
        id: payload.sub,
        roles: payload.roles
      };

      console.log(`[deserializer] Current user: %j`, this.request.currentUser);
      return yield next;
    }
    catch (e) {
      return yield next;
    }
  }
};