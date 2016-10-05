/**
 * JSON-RPC
 */

const thunkify = require('thunkify');

const config = require('../config');
const db = config.db(require('cloudant'));

exports.mount = function (routable, mountPoint) {
  routable.get(mountPoint + '/:method', getProcedureInfoHandler);
  routable.post(mountPoint + '/:method', procedureHandler);
};

const rpc = {
  getQuestionSet: getQuestionSet
};

function *getProcedureInfoHandler () {
  const methodName = this.params.method;

  this.body = {
    ok: true,
    method: methodName,
    parameters: []
  };
}

function *procedureHandler () {
  const methodName = this.params.method;
  const handler = rpc[methodName];

  try {
    const userId = 'a';
    const result = yield handler.call(this, this.request.body);

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

/**
 * Get a set of questions for a specific
 *
 * @param this
 * @param params
 * @return {{id, category, content, choices}}
 */
function *getQuestionSet (params) {
  console.log('[getQuestionSet] Params: %j', params)

  const category = params.category;
  const data = yield thunkify(db.view)('question', 'question-public',
    {
      key: [category, 'public'],
      reduce: false
    });

  return data[0].rows.map(item => {
    const {_id:id, category, content, choices} = item.value;

    return {id, category, content, choices};
  });
}