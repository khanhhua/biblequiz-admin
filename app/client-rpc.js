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

export function *startQuizSession({db, user}, params) {
  const {questions} = params;
  const {id: username} = user;

  var query = yield thunkify(db.find)({selector: {doctype:'user', _id: username}});

  if (!query[0] || !query[0].docs[0]) {
    throw new Error('Cannot start quiz session');
  }

  var userDocument = query[0].docs[0];
  if (userDocument.activeQuiz) {
    console.warn('[startQuizSession] Overriding current active quiz...');
  }

  userDocument.activeQuiz = {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions
  };

  console.log(`[startQuizSession] Updating ${userDocument.username}...`);
  const result = yield thunkify(db.insert)(userDocument);
  if (result[0].ok === true) {
    return result[0];
  } else {
    throw new Error('[startQuizSession] Could not start quiz session.');
  }
}
startQuizSession.$inject = ['db', 'user'];
/**
 *
 * @param db
 * @param params
 */
export function *getCategories ({db}, params) {
  const data = yield thunkify(db.view)('question', 'public-categories', {limit:1, reduce: true});

  if (!(data[0] && data[0].rows[0])){
    throw new Error('Could not get public categories');
  }

  const items = data[0].rows[0].value;
  console.log(`[getCategories] Found categories`, items);

  return items;
}

/**
 * Generate a shareable url should ensure that upon open a shareable URI
 * The name questions are retrieved
 *
 * @param context
 * @param params
 * @return {{shareableUrl: *}}
 */
export function *createShareableUri(context, params) {
  const {userId} = params;

  // Using the userId, system must retrieved the corresponding questions

  const shareableUri = '';

  return {
    shareableUri
  };
}

export function *resolveShareableUrl(context, params) {
  const {uri} = params;

  const questions = [];

  return {
    questions
  };
}