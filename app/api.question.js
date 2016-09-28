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

  const data = yield thunkify(db.find)({selector: {doctype:'question', _id: id}});
  this.body = data[0].docs[0];
};

exports.query = function *() {
  const limit = this.query.limit || 20;
  const skip = this.query.skip || 0;

  const query = this.query.q || null;

  this.body = yield exec;

  function exec (done) {
    db.view('question', 'question-admin', {descending:true,limit:limit,skip:skip}, function (err, result) {
      if (err) {
        return done(err);
      }

      done(null, result.rows.map(item => item.value));
    });
  };
};

exports.post = function *() {
  const data = this.body;

  return thunkify(db.insert)(data);
};

exports.del = function *() {

};
