const crypto = require('crypto');
const thunkify = require('thunkify');

const config = require('../config');
const db = config.db(require('cloudant'));

exports.get = function *() {
  const id = this.params.id;

  const data = yield thunkify(db.find)({selector: {doctype:'user', _id: id}});
  const user = data[0].docs[0];
  delete user.password;

  this.body = {
    user: user
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

  const random = yield thunkify(crypto.randomBytes)(8);
  const password = random.toString('hex');
  const sha1 = crypto.createHash('sha1');
  user.password = sha1.update(password).digest('hex');

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
    this.body = Object.assign({}, result[0],
      {
        meta: {
          password: password
        }
      });
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

  var existingData = yield thunkify(db.find)({selector: {doctype:'user', _id: user._id}});
  const existingUser = existingData[0].docs[0];

  var result = yield thunkify(db.insert)(Object.assign(existingUser, data.user));
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
