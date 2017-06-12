/**
 * JSON-RPC
 */

const thunkify = require('thunkify');

const config = require('../config');
const db = config.db(require('cloudant'));

const clientQueries = require('./client-queries');

exports.mount = function (routable, mountPoint) {
  routable.options(mountPoint + '/:method', corsHandler);
  routable.get(mountPoint + '/:method', getProcedureInfoHandler);
  routable.post(mountPoint + '/:method', procedureHandler);
};

// const rpc = {
//   getQuestionSet: getQuestionSet
// };

function *corsHandler () {
  this.status = 200;
  this.set('Access-Control-Allow-Origin', '*');
  this.set('Access-Control-Allow-Credentials', true);
  this.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  this.set('Access-Control-Allow-Headers', 'Content-Type');
}

function *getProcedureInfoHandler () {
  const methodName = this.params.method;
  this.set('Access-Control-Allow-Origin', '*');

  this.body = {
    ok: true,
    method: methodName,
    parameters: []
  };
}

function *procedureHandler () {
  const methodName = this.params.method;
  const handler = clientQueries[methodName];

  if (!handler) {
    this.body = {
      ok: false,
      error: 'Method undefined "' + methodName + '"'
    };

    return;
  }

  try {
    // TODO Personalize query with request jwt info
    const result = yield handler.call(this, {db}, this.request.body);

    this.set('Access-Control-Allow-Origin', '*');
    this.body = {
      ok: true,
      result: result
    };
  }
  catch (e) {
    this.body = {
      ok: false,
      error: e.message
    };
  }
}
