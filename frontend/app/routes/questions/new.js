import Ember from 'ember';

export default Ember.Route.extend({
  model () {
    return {
      contentType: "text",
      category: "",
      content: "",
      choices: [{
        text: '',
        correct: false
      }]
    };
  },

  ajax: Ember.inject.service(),

  actions: {
    save (model) {
      console.log(`[save]`, model);

      if (!this.controllerFor('questions.new').validate(model)) {
        console.warn(`[save] Cannot save`);
        return;
      }

      this.get('ajax').request(
        '/questions',
        {
          method: 'POST',
          data: JSON.stringify({ question: model })
        }
      ).then((data) => {
        const {id} = data;
        this.transitionTo('questions.edit', id);
      });
    }
  },

  activate () {
    this.controllerFor('questions').set('showingMenu', true);
  },

  deactivate () {
    this.controllerFor('questions').set('showingMenu', false);
  }
});
