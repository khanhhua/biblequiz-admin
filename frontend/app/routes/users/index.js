import Ember from 'ember';

export default Ember.Route.extend({
  model () {
    return this.get('ajax').request('/users').then((data) => data.users);
  },
  renderTemplate () {
    this.render('users.index', {
      controller: 'users.index',
      into: 'users'
    });
  },
  ajax: Ember.inject.service()
});
