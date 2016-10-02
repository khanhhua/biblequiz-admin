import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),
  session: Ember.inject.service(),
  actions: {
    login (username, password) {
      console.log(`[login] Logging in ${username}:${password}`);

      this.get('ajax').request('/authenticate', {
        method: 'POST',
        data: JSON.stringify({
          username,
          password
        })
      }).then(data => {
        const {username, roles, jwt} = data;

        this.get('session').authorize({username, roles}, jwt);

        this.transitionTo('questions');
      });
    }
  }
});
