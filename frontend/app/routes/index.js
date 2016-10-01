import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),
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
        const {jwt} = data;
        const ajax = this.get('ajax');
        ajax.headers['Authentication'] = `jwt ${jwt}`;

        sessionStorage.setItem('jwt', jwt);

        this.transitionTo('questions');
      });
    }
  }
});
