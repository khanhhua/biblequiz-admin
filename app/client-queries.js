const thunkify = require('thunkify');

/**
 * Get a set of questions for a specific
 *
 * @param this
 * @param context
 * @param params
 * @return {{id, category, content, choices}}
 */
export function *getQuestionSet ({db}, params) {
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

export function *getCategories ({db}, params) {
  const data = yield thunkify(db.view)('question', 'public-categories', {limit:1, reduce: true});

  if (!(data[0] && data[0].rows[0])){
    throw new Error('Could not get public categories');
  }

  const items = data[0].rows[0].value;
  console.log(`[getCategories] Found categories`, items);

  return items;
}