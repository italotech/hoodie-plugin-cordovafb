/**
 * Hoodie plugin cordovafb
 * Lightweight and easy cordovafb
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  if (window.cordova && window.cordova.platformId === 'browser') {
    var elemDiv = document.createElement('div');
    elemDiv.setAttribute('id', 'fb-root');
    document.body.appendChild(elemDiv);
    window.facebookConnectPlugin.browserInit('340016426177780');
    // version is optional. It refers to the version of API you may want to use.
  }

  var guid = (function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return function () {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
             s4() + '-' + s4() + s4() + s4();
    };
  })();

  hoodie.cordovafb = {

    logout: function () {
      var defer = window.jQuery.Deferred();
      defer.notify('logout', arguments, false);
      window.facebookConnectPlugin.logout(
        defer.resolve,
        defer.reject
      );
      return defer.promise();
    },

    login: function () {
      var task = {};
      return hoodie.cordovafb.fblogin(task)
        .then(hoodie.cordovafb.flow)
        .then(hoodie.cordovafb.signinHoodie)
        .then(hoodie.cordovafb.setProfile);
    },

    setProfile: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('setProfile', arguments, false);
      task.profile.facebook.fbAuth = task.fbAuth;
      hoodie.profile.set(task.profile)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    signinHoodie: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('signinHoodie', arguments, false);
      if (!task.signUp) {
        hoodie.account.signIn(task.profile.userName, task.profile.facebook.password)
          .then(function () {
            defer.resolve(task);
          })
          .fail(defer.reject);
      } else {
        defer.resolve(task);
      }
      return defer.promise();
    },

    flow: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('flow', arguments, false);
      if (task.fbAuth.status === 'connected') {
        hoodie.cordovafb.getProfile(task)
          .then(function (task) {
            if (task.profile) {
              if (task.profile.facebook)
                hoodie.cordovafb.getMe(task)
                  .then(defer.resolve)
                  .fail(defer.reject);
              else
                defer.reject('user not found');
            } else {
              hoodie.cordovafb.signUp(task)
                .then(defer.resolve)
                .fail(defer.reject);
            }
          });
      } else {
        defer.reject('Facebook not connected!');
      }
      return defer.promise();
    },

    signUp: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('signUp', arguments, false);
      task.profile = {
        facebook: {}
      };
      hoodie.cordovafb.generatePassword(task)
        .then(hoodie.cordovafb.getMe)
        .then(hoodie.cordovafb.hoodieSignUp)
        .then(hoodie.cordovafb.setAnonymousProfileToHoodieUserProfile)
        .then(hoodie.cordovafb.flow)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    setAnonymousProfileToHoodieUserProfile: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('setProfile', arguments, false);
      task.profile.facebook.fbAuth = task.fbAuth;
      hoodie.profile.get()
        .then(function (_task) {
          _task.profile.facebook = task.profile.facebook;
          hoodie.profile.set(_task.profile)
            .then(function () {
              defer.resolve(task);
            })
            .fail(defer.reject);
        })
        .fail(defer.reject);
      return defer.promise();
    },

    generatePassword: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('generatePassword', arguments, false);
      try {
        task.profile.facebook.password = guid();
        defer.resolve(task);
      } catch (err) {
        defer.fail(defer.reject);
      }
      return defer.promise();
    },

    getMe: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('getMe', arguments, false);

      window.facebookConnectPlugin.api(
        'me',
        ['public_profile', 'email'],
        function (me) {
          task.profile.facebook.me = me;
          defer.resolve(task);
        },
        function (err) {
          defer.reject(err);
        }
      );
      return defer.promise();
    },

    hoodieSignUp: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('hoodieSignUp', arguments, false);
      hoodie.account.signUp(task.profile.facebook.me.email, task.profile.facebook.password)
        .then(function () {
          task.signUp = true;
          hoodie.account.signIn(task.profile.facebook.me.email, task.profile.facebook.password, { moveData : true })
            .then(function () {
              defer.resolve(task);
            })
            .fail(defer.reject);
        })
        .fail(defer.reject);
      return defer.promise();
    },

    getProfile: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('getProfile', arguments, false);
      hoodie.profile.get()
        .then(function (_task) {
          task.profile = _task.profile;
          defer.resolve(task);
        })
        .fail(function () {
          defer.resolve(task);
        });
      return defer.promise();
    },

    isProfileExists: function (task) {
      var defer = window.jQuery.Deferred();
      if (task.profile) {
        defer.resolve(task);
      } else {
        defer.reject('Facebook not connected!');
      }
      return defer.promise();
    },

    fblogin: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('fblogin', arguments, false);
      window.facebookConnectPlugin.login(
        ['user_friends', 'email', 'public_profile'],
        function (fbAuth) {
          task.fbAuth = fbAuth;
          defer.resolve(task);
        },
        defer.reject
      );
      return defer.promise();
    },

  };

  function out(name, obj, task) {
    if (window.debug === 'cordovafb') {
      var group = (task) ? 'task: ' + task + '(' + name + ')': 'method: ' + name;

      console.groupCollapsed(group);
      if (!!obj)
        console.table(obj);
      console.groupEnd();
    }
  }

  if (window.debug === 'cordovafb') {
    hoodie.task.on('start', function () {
      out('start', arguments[0], arguments[0].type);
    });

    // task aborted
    hoodie.task.on('abort', function () {
      out('abort', arguments[0], arguments[0].type);
    });

    // task could not be completed
    hoodie.task.on('error', function () {
      out('error', arguments[1], arguments[1].type);
    });

    // task completed successfully
    hoodie.task.on('success', function () {
      out('success', arguments[0], arguments[0].type);
    });
  }

});