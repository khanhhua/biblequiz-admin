import Ember from 'ember';

export default Ember.Service.extend({
  username: undefined,
  roles: undefined,
  accessToken: undefined,
  init() {
    this._super(...arguments);

    const storage = window.sessionStorage;

    const username = storage.getItem('session.username');
    const roles = Ember.makeArray(storage.getItem('session.roles'));
    const accessToken = storage.getItem('session.accessToken');

    this.setProperties({
      username,
      roles,
      accessToken
    });
  },
  isLoggedIn: function () { return !!this.get('accessToken'); }.property('accessToken'),
  authorize (user, accessToken) {
    const storage = window.sessionStorage;
    const {username, roles} = user;

    console.log(`[session.authorize] User ${username} with roles ${JSON.stringify(roles)}`);

    storage.setItem('session.username', username);
    storage.setItem('session.roles', roles);
    storage.setItem('session.accessToken', accessToken);

    this.setProperties({
      username,
      roles,
      accessToken
    });
  },
  invalidate () {
    const storage = window.sessionStorage;

    storage.removeItem('session.username');
    storage.removeItem('session.roles');
    storage.removeItem('session.accessToken');

    this.setProperties({
      username: undefined,
      roles: [],
      accessToken: undefined
    });

    return Ember.RSVP.Promise.resolve();
  }
});
