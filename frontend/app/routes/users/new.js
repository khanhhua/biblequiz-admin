import Ember from 'ember';

export default Ember.Route.extend({
  model () {
    return {
      roles: []
    };
  },

  actions: {
    save (model) {
      console.log(`[save]`, model);

      if (!this.controllerFor('users.new').validate(model)) {
        console.warn('[save] Could not validate');
        return;
      }

      this.get('ajax').request(
        '/users',
        {
          method: 'POST',
          data: JSON.stringify({ user: model })
        })
        .then(data => {
          const {id, meta} = data;
          console.debug('Password: %s', meta.password);
          this.transitionTo('users.edit', id);
        });
    },

    cancel () {
      this.transitionTo('users');
    }
  },

  activate () {
    this.controllerFor('users').set('showingMenu', true);
  },

  deactivate () {
    this.controllerFor('users').set('showingMenu', false);
  },

  ajax: Ember.inject.service()
});
