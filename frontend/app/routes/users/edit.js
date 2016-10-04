import Ember from 'ember';

export default Ember.Route.extend({
  model (params) {
    const {id: userId} = params;

    return this.get('ajax').request('/users/' + userId).then(data => {
      return data.user;
    });
  },

  setupController (controller, model) {
    controller.set('model', model);

    const {roles} = model;
    controller.get('roles').forEach(item => {
      if (roles.indexOf(item.id) !== -1) {
        Ember.set(item, 'checked', true);
      }
    });
  },

  actions: {
    cancel () {
      this.transitionTo('users');
    },
    save (model) {
      console.log(`[save]`, model);
      const {_id: userId} = model;

      if (!this.controllerFor('users.edit').validate(model)) {
        console.warn(`[save] Cannot save`);
        return;
      }

      this.get('ajax').request(
        '/users/' + userId,
        {
          method: 'POST',
          data: JSON.stringify({ user: model })
        }
      ).then(() => this.refresh());
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
