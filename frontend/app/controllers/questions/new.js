import Ember from 'ember';
// Read this: https://spin.atomicobject.com/2016/02/08/ember-validations/

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  errors: {},

  validate (model) {
    const {category, content, choices} = model;
    this.set('errors', {});

    if (!category || category.length===0) {
      this.set('errors.category', 'Category is required');
    }

    if (!content || content.length===0) {
      this.set('errors.content', 'Content is required');
    }

    const correctCount = choices.filter(item => item.correct).length;
    const emptyAnswerCount = choices.filter(item => !item.text || item.text.length === 0).length;

    if (correctCount === 0 || correctCount > 1) {
      this.set('errors.choices', 'There must be one correct answer only');
    }
    else if (emptyAnswerCount !== 0) {
      this.set('errors.choices', 'All answers must not be blank');
    }

    return Object.keys(this.errors).length === 0;
  },

  actions: {
    addChoice () {
      this.model.choices.pushObject({
        text: '',
        correct: false
      });
    }
  },
});
