/**
 * JSON-RPC
 */

const thunkify = require('thunkify');

const config = require('../config');
const db = config.db(require('cloudant'));

exports.mount = function (routable, mountPoint) {
  routable.options(mountPoint + '/:method', corsHandler);
  routable.get(mountPoint + '/:method', getProcedureInfoHandler);
  routable.post(mountPoint + '/:method', procedureHandler);
};

const rpc = {
  getQuestionSet: getQuestionSet
};

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
  const handler = rpc[methodName];

  try {
    // TODO Personalize query with request jwt info
    const result = yield handler.call(this, this.request.body);

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

/**
 * Get a set of questions for a specific
 *
 * @param this
 * @param params
 * @return {{id, category, content, choices}}
 */
function *getQuestionSet (params) {
  const {category} = params;
  const size = this.query.size;
  const r = Math.random();

  console.log('[getQuestionSet] Params: %j, size: %d, rFactor: %s', params, size, r);

  let data, items;
  data = yield thunkify(db.view)('question', 'question-random-r1',
    {
      startkey: [category, r],
      endkey: [category, 1],
      descending: false,
      limit: size,
      reduce: false
    });

  items = data[0].rows.map(item => {
    const {_id:id, category, content, choices} = item.value;

    return {id, category, content, choices};
  });

  if (items.length === size) {
    return items;
  }

  console.log(`[getQuestionSet] Question set insufficient. Proceeding to get more...`);
  data = yield thunkify(db.view)('question', 'question-random-r1',
    {
      startkey: [category, r],
      endkey: [category, 0],
      descending: true,
      limit: size,
      reduce: false
    });

  items = items.concat(data[0].rows.map(item => {
    const {_id:id, category, content, choices} = item.value;

    return {id, category, content, choices};
  }));

  return items;
}
