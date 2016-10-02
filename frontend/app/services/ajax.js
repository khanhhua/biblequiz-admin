import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  namespace: '/api',
  contentType: 'application/json',
  headers: function () {
    if (this.get('session.isLoggedIn')) {
      const accessToken = this.get('session.accessToken');

      return {
        'Authentication': `jwt ${accessToken}`
      };
    }
    else {
      return {};
    }
  }.property('session.isLoggedIn'),
  session: Ember.inject.service()
});
