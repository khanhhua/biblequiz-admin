import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    logout () {
      console.log(`[application.logout]`);
      this.get('session').invalidate().then(() => {
        this.transitionTo('index');
      });
    }
  }
});
