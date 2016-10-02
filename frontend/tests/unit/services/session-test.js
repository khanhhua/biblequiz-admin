import { moduleFor, test } from 'ember-qunit';

moduleFor('service:session', 'Unit | Service | session', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
  unit: true,
  beforeEach () {
    window.sessionStorage.clear();
  },
  afterEach () {
    window.sessionStorage.clear();
  }
});

test('it init() with no credentials', function(assert) {
  let service = this.subject();
  // service.init() is invoked automatically

  // post-condition
  assert.equal(service.get('username'), undefined, 'Username must be undefined');
  assert.deepEqual(service.get('roles'), [], 'Roles must be empty');
  assert.equal(service.get('accessToken'), undefined, 'Access token must be undefined');

  assert.equal(service.get('isLoggedIn'), false, 'Is logged in must be false');
});

test('it authorize() with the given user and access token', function (assert) {
  let service = this.subject();
  const user = {username: 'tom', roles: ['admin']};
  const acccessToken = '123abc';

  // method being tested
  service.authorize(user, acccessToken);

  // post-condition
  assert.equal(service.get('username'), 'tom', 'Username must be tom');
  assert.deepEqual(service.get('roles'), ['admin'], 'Roles must be [admin]');
  assert.equal(service.get('accessToken'), acccessToken, 'Access token must be set');

  assert.equal(service.get('isLoggedIn'), true, 'Is logged in must be true');
});

test('it invalidate() with the current user', function (assert) {
  let service = this.subject();
  const user = {username: 'tom', roles: ['admin']};
  const acccessToken = '123abc';
  // pre-condition
  service.authorize(user, acccessToken);
  // method being tested
  service.invalidate().then(() => {
    // post-condition
    assert.equal(service.get('username'), undefined, 'Username must be undefined');
    assert.deepEqual(service.get('roles'), [], 'Roles must be empty');
    assert.equal(service.get('accessToken'), undefined, 'Access token must be undefined');

    assert.equal(service.get('isLoggedIn'), false, 'Is logged in must be false');
  });

});
