suite('Profile', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);
  suite('Profile test', function () {

    test('signIn hommer', function (done) {
      this.timeout(10000);
      hoodie.account.signIn('Hommer', '123')
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
        })
        .done(function () {
          assert.equal(
            hoodie.account.username,
            'hommer',
            'should be logged in after signup'
          );
          done();
        });
    });

    test('hommer should get own profile', function (done) {
      this.timeout(10000);
      hoodie.profile.get()
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
        })
        .then(function (task) {
          assert.ok((task.profile.userName ==='hommer'), 'getProfile');
          done();
        })
    });

    test('hommer should get by userName lisa', function (done) {
      this.timeout(10000);
      hoodie.profile.getByUserName('lisa')
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
        })
        .then(function (task) {
          assert.ok((task.profile.userName ==='lisa'), 'getProfile');
          done();
        });
    });


    test('hommer should update own profile', function (done) {
      this.timeout(10000);
      hoodie.profile.get()
        .fail(function (err) {
          assert.ok(false, err.message);
          done();
        })
        .then(function (_task) {
          var profile = _task.profile;
          profile.First_Name = 'Hommer';
          profile.Last_Name = 'Simpson';
          hoodie.profile.set(profile)
            .fail(function (err) {
              assert.ok(false, err.message);
              done();
            })
            .then(function () { return hoodie.profile.get(); })
            .then(function (task) {
              assert.ok((task.profile.Last_Name ==='Simpson'), 'getProfile');
              done();
            });
        })
    });

  });

});
