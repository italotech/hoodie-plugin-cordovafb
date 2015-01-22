/**
 * Dependencies
 */
var utils = require('hoodie-utils-plugins')('profile:profile');
var log = utils.debug();
var async = require('async');

module.exports = function (hoodie, pluginDb, pluginProfileDb) {
  var CordovaFB = this;

  var _validAttrs = function (task, attr, cb) {
    log('_validAttrs', task);
    if (!attr || !task[attr]) {
      return cb('Pls, fill the param: ' + attr);
    }
    cb();
  };

  var _getProfileByFacebookId = function (task, cb) {
    log('_getProfileByFacebookId', task);
    pluginProfileDb.query('by_facebook_id', { include_docs: true, key: task.fbAuth.authResponse.userID }, function (err, rows) {
      if (err) return cb(err);
      if (!!rows.length)
        task.profile = rows[0].doc;
      cb(null, task);
    });
  };

  CordovaFB.getProfileByFacebookId = function (db, task, cb) {
    log('getProfileByFacebookId', task);

    async.series([

        async.apply(_validAttrs, task, 'fbAuth'),
        async.apply(_validAttrs, task.fbAuth, 'authResponse'),
        async.apply(_validAttrs, task.fbAuth.authResponse, 'userID'),
        async.apply(_getProfileByFacebookId, task),
      ],
      utils.handleTask(hoodie, 'removeReplication', db, task, cb)
    );
  };

  return CordovaFB;
};
