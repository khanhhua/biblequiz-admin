if (process.env.NODE_ENV === 'production') {
  module.exports = require('./config.prod');
}
else {
  exports.CLOUDANT_ACCOUNT = 'fatmandesigner-blog';
  exports.CLOUDANT_API_KEY = 'ssadrywhisangetwookindsh';
  exports.CLOUDANT_API_PASSWORD = '636bb8db8195206e06ef8239c0d43a43777da638';
  exports.CLOUDANT_DB = 'biblequiz-dev';
}

exports.db = function (Cloudant) {
  const cloudant = Cloudant(
    {
      account: exports.CLOUDANT_ACCOUNT,
      key: exports.CLOUDANT_API_KEY,
      password: exports.CLOUDANT_API_PASSWORD
    });

  return cloudant.use(exports.CLOUDANT_DB);
};