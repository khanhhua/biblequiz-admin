import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    login () {
      console.log('[login] Logging in');
    }
  }
});
