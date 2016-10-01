import NewQuestionController from './new';

export default NewQuestionController.extend({
  actions: {
    addChoice () {
      this.model.choices.pushObject({
        text: '',
        correct: false
      });
    },
    removeChoice (i) {
      this.model.choices.removeAt(i);
    }
  }
});
