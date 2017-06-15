const thunkify = require('thunkify');
const Hashids = require('hashids');
const uuid = require('uuid/v1');

const hasher = new Hashids('THIS IS MY SALT');
const BASE_URL = process.env['BASE_URL'];
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
export function *createShareableUri({db, user}, params) {
  const {id: username} = user; // We always use user login as the identifier (hence id, username means the same)

  // Using the username, system must retrieved the corresponding questions
  var query = yield thunkify(db.find)({selector: {doctype:'user', _id: username}});

  if (!query[0] || !query[0].docs[0]) {
    throw new Error('Create shareable URL');
  }

  const userDocument = query[0].docs[0];
  let quiz;
  let shareableUri;
  if (!userDocument.activeQuiz) {
    throw new Error('User has no quiz');
  }

  const publicIdentifier = generatePublicIdentifier();
  const uri = `q/${publicIdentifier}`;
  const updatedAt = new Date().toISOString();
  // Extract the quiz object from user into a separate document
  quiz = Object.assign(
    {
      doctype: 'quiz',
      version: '1.0.0',
      archived: true,
      ownerId: username,
      uri,
      updatedAt
    },
    userDocument.activeQuiz);

  const [{ok}] = yield thunkify(db.insert)(quiz);

  if (ok !== true) {
    throw new Error(`Could not insert quiz`);
  }

  shareableUri = `${BASE_URL}/${uri}`;

  return {
    updatedAt,
    shareableUri
  };
}
createShareableUri.$inject = ['db', 'user'];

export function *resolveShareableUri({db}, params) {
  const {uri} = params;
  const [existingData] = yield thunkify(db.view)('quiz','quiz-archived',
    {
      startkey: uri,
      endkey: uri,
      descending: true,
      limit: 1,
      reduce: false
    });

  if (!(existingData.rows && existingData.rows.length)) {
    console.warn(`Cannot find quiz at URI: ${uri}`);
    throw new Error('Quiz not found');
  }

  const quiz = existingData.rows[0].value;

  const {
    updatedAt,
    questions
  } = quiz;

  return {
    updatedAt,
    questions
  };
}

function generatePublicIdentifier() {
  const idString = uuid().replace(/-/g, ''); // strip dashes away from UUID V1
  const charCodeArray = idString.split('').map(function (item) { return item.charCodeAt(0); });

  return hasher.encode(charCodeArray);
}