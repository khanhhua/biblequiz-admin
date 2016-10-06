const thunkify = require('thunkify');

const config = require('../config');
const db = config.db(require('cloudant'));

exports.get = function *() {
  const id = this.params.id;

  const data = yield thunkify(db.find)({selector: {doctype:'question', _id: id}});
  this.body = {
    question: data[0].docs[0]
  };
};

exports.query = function *() {
  const limit = this.query.limit || 20;
  const skip = this.query.skip || 0;

  const query = this.query.q || null;
  const questions = yield exec;

  this.body = {
    questions: questions
  };
  return;

  function exec (done) {
    db.view('question', 'question-admin', {descending:true,limit:limit,skip:skip}, function (err, result) {
      if (err) {
        return done(err);
      }

      done(null, result.rows.map(item => item.value));
    });
  }
};

exports.post = function *() {
  const data = this.request.body;
  const question = data.question;
  if (!question) {
    this.status = 400;
    this.body = 'Invalid request';

    return;
  }

  question.doctype = 'question';
  question['@version'] = '1.0.0';
  question.author = this.request.currentUser.id;
  question.status = 'draft';
  question.createdAt = new Date().toISOString();
  question.updatedAt = new Date().toISOString();

  // generate rFactor for randomize retrieval
  question.rFactor = [Math.random(), Math.random(), Math.random()];
  console.log('Question: %j', question);

  var result = yield thunkify(db.insert)(data.question);
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
  const question = data.question;
  if (!question) {
    this.status = 400;
    this.body = 'Invalid request';

    return;
  }

  question.updatedAt = new Date().toISOString();
  question.rFactor = [Math.random(), Math.random(), Math.random()];

  console.log('Question: %j', question);

  var result = yield thunkify(db.insert)(data.question);
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

exports.del = function *() {

};
