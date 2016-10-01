import Ember from 'ember';

export default Ember.Route.extend({
  model (params) {
    const {id: questionId} = params;

    return this.get('ajax').request('/questions/' + questionId).then(data => {
      return data.question;
    });
  },

  setupController (controller, model) {
    controller.set('model', model);
  },

  actions: {
    cancel () {
      this.transitionTo('questions');
    },
    save (model) {
      console.log(`[save]`, model);
      const {_id: questionId} = model;

      if (!this.controllerFor('questions.edit').validate(model)) {
        console.warn(`[save] Cannot save`);
        return;
      }

      this.get('ajax').request(
        '/questions/' + questionId,
        {
          method: 'POST',
          data: JSON.stringify({ question: model })
        }
      );
    }
  },

  activate () {
    this.controllerFor('questions').set('showingMenu', true);
  },

  deactivate () {
    this.controllerFor('questions').set('showingMenu', false);
  },

  ajax: Ember.inject.service()
});
