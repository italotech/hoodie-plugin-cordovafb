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
    permitions: ['user_friends', 'email', 'public_profile', 'user_birthday', 'user_location'],

    logout: function () {
      var defer = window.jQuery.Deferred();
      defer.notify('logout', arguments, false);
      hoodie.account.signOut()
        .always(function () {
          window.facebookConnectPlugin.logout(
            defer.resolve,
            defer.reject
          );
        });
      return defer.promise();
    },

    login: function () {
      var defer = window.jQuery.Deferred();
      defer.notify('setProfile', arguments, false);
      var task = {};
      hoodie.cordovafb.fblogin(task)
        .then(hoodie.cordovafb.flow)
        .then(hoodie.cordovafb.signinHoodie)
        .then(hoodie.cordovafb.setProfile)
        .then(defer.resolve)
        .fail(function (err) {
          if (err.name === 'HoodieUnauthorizedError') {
            hoodie.account.destroy()
              .always(function () {
                defer.reject(err);
              });
          } else {
            defer.reject(err);
          }
        });
      return defer.promise();
    },

    setProfile: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('setProfile', arguments, false);
      hoodie.profile.get()
        .then(function (_task) {
          _task.profile.facebook.fbAuth = task.fbAuth;
          hoodie.profile.set(task.profile)
            .then(defer.resolve)
            .fail(defer.reject);
        })
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

    api: function (url, permition) {
      var defer = window.jQuery.Deferred();
      defer.notify('api', arguments, false);
      window.facebookConnectPlugin.api(url, permition || hoodie.cordovafb.permitions, defer.resolve, defer.reject);
      return defer.promise();
    },

    friends: function () {
      var defer = window.jQuery.Deferred();
      defer.notify('friends', arguments, false);

      hoodie.cordovafb.api('me/friends', hoodie.cordovafb.permitions)
        .then(defer.resolve)
        .fail(defer.reject);

      return defer.promise();
    },

    getMe: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('getMe', arguments, false);

      hoodie.cordovafb.api('me', hoodie.cordovafb.permitions)
        .then(function (me) {
          task.profile.facebook.me = me;
          defer.resolve(task);
        })
        .fail(defer.reject);

      return defer.promise();
    },

    hoodieSignUp: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('hoodieSignUp', arguments, false);
      hoodie.account.signUp(task.profile.facebook.me.email, task.profile.facebook.password)
        .then(function () {
          task.signUp = true;
          hoodie.account.signIn(task.profile.facebook.me.email, task.profile.facebook.password)
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
      function handleAnonymous() {
        if (hoodie.account.hasAnonymousAccount()) {
          hoodie.account.destroy()
            .then(function () {
              defer.resolve(task);
            });
        } else {
          defer.resolve(task);
        }
      }

      hoodie.profile.get()
        .then(function (_task) {
          task.profile = _task.profile;
          defer.resolve(task);
        })
        .fail(function () {

          hoodie.task('cordovafbgetprofilebyfacebookid').start(task)
            .then(function (_task) {
              task.profile = _task.profile;
              handleAnonymous();
            })
            .fail(handleAnonymous);
          hoodie.remote.push();

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

    fbconnected: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('fbtest', arguments, false);
      window.facebookConnectPlugin.getLoginStatus(
        function (fbAuth) {
          if (fbAuth.status === 'connected') {
            task.fbAuth = fbAuth;
            defer.resolve(task);
          } else {
            defer.reject();
          }
        },
        defer.reject
      );
      return defer.promise();
    },

    fblogin: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('fblogin', arguments, false);
      hoodie.cordovafb.fbconnected(task)
        .then(defer.resolve)
        .fail(function () {
          window.facebookConnectPlugin.login(
            hoodie.cordovafb.permitions,
            function (fbAuth) {
              task.fbAuth = fbAuth;
              defer.resolve(task);
            },
            defer.reject
          );
        });
      return defer.promise();
    },

    lookupByFbId: function (fbId) {
      var defer = window.jQuery.Deferred();
      defer.notify('lookupByFbId', arguments, false);
      var task = {
        fbAuth: {
          authResponse: {
            userID: fbId
          }
        }
      };
      hoodie.task('cordovafbgetprofilebyfacebookid').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      hoodie.remote.push();

      return defer.promise();
    }

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
