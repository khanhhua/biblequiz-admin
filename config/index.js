var configs = {};

if (process.env.NODE_ENV === 'production') {
  configs = require('./config.prod');
}
else {
  configs.CLOUDANT_ACCOUNT = 'fatmandesigner-blog';
  configs.CLOUDANT_API_KEY = 'ssadrywhisangetwookindsh';
  configs.CLOUDANT_API_PASSWORD = '636bb8db8195206e06ef8239c0d43a43777da638';
  configs.CLOUDANT_DB = 'biblequiz-dev';

  configs.STATIC_ROOT = 'frontend/dist';
}

configs.db = function (Cloudant) {
  const cloudant = Cloudant(
    {
      account: configs.CLOUDANT_ACCOUNT,
      key: configs.CLOUDANT_API_KEY,
      password: configs.CLOUDANT_API_PASSWORD
    });

  return cloudant.use(configs.CLOUDANT_DB);
};

module.exports = configs;