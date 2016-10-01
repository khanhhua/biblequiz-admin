import Ember from 'ember';

export default Ember.Route.extend({
  model () {
    return this.get('ajax').request('/questions').then((data) => data.questions);
  },
  ajax: Ember.inject.service()
});
