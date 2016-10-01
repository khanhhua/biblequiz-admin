const crypto = require('crypto');
const thunkify = require('thunkify');
const Cloudant = require('cloudant');

const jsonwebtoken = require('jsonwebtoken');
const SECRET = 's3cr3t';

const config = require('../config');
var cloudant = Cloudant(
  {
    account: config.CLOUDANT_ACCOUNT,
    key: config.CLOUDANT_API_KEY,
    password: config.CLOUDANT_API_PASSWORD
  });
const db = cloudant.use('biblequiz-dev');

exports.link = function *() {

};

exports.authenticate = function *() {
  const credential = this.request.body; // {username,password}
  if (!credential.username || !credential.password) {
    this.status = 400;
    this.status = 'Missing credential';
    return;
  }

  const data = yield thunkify(db.find)({selector: {doctype:'user', _id: credential.username}});
  if (data.length !== 2) {
    this.status = 403;
    this.status = 'Invalid username or password';
    return;
  }

  const sha1 = crypto.createHash('sha1');
  const hashedPass = sha1.update(credential.password).digest('hex');

  const user = data[0].docs[0];
  if (user.password !== hashedPass) {
    this.status = 403;
    this.body = 'Invalid username or password';
    return;
  }

  const token = jsonwebtoken.sign({sub:user.username,exp:new Date().getTime() + 3600000}, SECRET);

  this.status = 200;
  this.body = {
    jwt: token
  };
};