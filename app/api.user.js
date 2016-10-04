const thunkify = require('thunkify');

const Cloudant = require('cloudant');

const config = require('../config');
var cloudant = Cloudant(
  {
    account: config.CLOUDANT_ACCOUNT,
    key: config.CLOUDANT_API_KEY,
    password: config.CLOUDANT_API_PASSWORD
  });
const db = cloudant.use('biblequiz-dev');

exports.get = function *() {
  const id = this.params.id;

  const data = yield thunkify(db.find)({selector: {doctype:'user', _id: id}});
  this.body = {
    user: data[0].docs[0]
  };
};

exports.query = function *() {
  const limit = this.query.limit || 20;
  const skip = this.query.skip || 0;

  const query = this.query.q || null;
  const users = yield exec;

  this.body = {
    users: users
  };
  return;

  function exec (done) {
    db.view('user', 'user-admin', {descending:true,limit:limit,skip:skip}, function (err, result) {
      if (err) {
        return done(err);
      }

      done(null, result.rows.map(item => item.value));
    });
  }
};

exports.post = function *() {
  const data = this.request.body;
  const user = data.user;
  if (!user) {
    this.status = 400;
    this.body = 'Invalid request';

    return;
  }

  user._id = user.username;
  user.doctype = 'user';
  user['@version'] = '1.0.0';

  user.status = 'active';
  user.createdAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();

  console.log('User: %j', user);

  var result = yield thunkify(db.insert)(data.user);
  if (result.length !== 2) {
    this.status = 500;
    this.body = {
      ok: false,
      error: 'Invalid Request'
    };

    return;
  }

  if (result[0].ok === true) {
    this.status = result[1].statusCode;
    this.body = result[0];
  }
  else {
    this.status = 400;
    this.body = {
      ok: false,
      error: 'Invalid Request'
    };
  }
};

exports.update = function *() {
  const data = this.request.body;
  const user = data.user;
  if (!user) {
    this.status = 400;
    this.body = 'Invalid request';

    return;
  }

  user.updatedAt = new Date().toISOString();

  console.log('User: %j', user);

  var result = yield thunkify(db.insert)(data.user);
  if (result.length !== 2) {
    this.status = 500;
    this.body = {
      ok: false,
      error: 'Invalid Request'
    };

    return;
  }

  if (result[0].ok === true) {
    this.status = result[1].statusCode;
    this.body = result[0];
  }
  else {
    this.status = 400;
    this.body = {
      ok: false,
      error: 'Invalid Request'
    };
  }
};

exports.profile = function *() {
  const id = this.params.id;

  const data = yield thunkify(db.find)({selector: {doctype: 'user', _id: id}});
  this.body = {
    user: data[0].docs[0]
  };
};

exports.del = function *() {

};
