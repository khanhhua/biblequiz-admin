import { moduleFor, test } from 'ember-qunit';

moduleFor('service:ajax', 'Unit | Service | ajax', {
  // Specify the other units that are required for this test.
  needs: ['service:session']
});

test('it inits with proper headers', function(assert) {
  let service = this.subject();
  // post-condition
  assert.equal(service.headers['Authorization'], undefined, 'Authorization header must not exist');
});

test('it reflects session logged in state', function(assert) {
  let service = this.subject();
  const user = {username: 'tom', roles: ['admin']};
  const acccessToken = '123abc';
  // pre-condition
  service.get('session').authorize(user, acccessToken);

  // post-condition
  assert.equal(service.get('headers')['Authentication'], 'jwt 123abc', '`Authentication` header must be `jwt 123abc`');
});
