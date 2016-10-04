import Ember from 'ember';

export default Ember.Controller.extend({
  errors: {},

  roles: [
    {
      id: 'admin',
      label: 'Admin',
      checked: false
    },
    {
      id: 'moderator',
      label: 'Moderator',
      checked: false
    },
    {
      id: 'editor',
      label: 'Editor',
      checked: false
    }
  ],

  onRoleSelected: function () {
    // const user = this.get('content');
    const selectedRoles = this.get('roles').filter(item => item.checked).map(item => item.id);
    this.set('content.roles', selectedRoles);
  }.observes('roles.@each.checked'),

  validate (model) {
    const {username, email, roles} = model;
    this.set('errors', {});

    if (Ember.isEmpty(username)) {
      this.set('errors.username', 'Username is required');
    }

    if (Ember.isEmpty(email)) {
      this.set('errors.email', 'User email is required');
    }

    if (roles.length === 0) {
      this.set('errors.roles', 'User should have roles. Public user must register themselves.');
    }

    return Object.keys(this.errors).length === 0;
  }
});
