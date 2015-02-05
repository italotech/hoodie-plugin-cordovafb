/**
 * Dependencies
 */
var utils = require('hoodie-utils-plugins')('profile:profile');
var log = utils.debug();
var async = require('async');
var _ = require('lodash');

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
    var search = {
      include_docs: true
    };
    var isArray = _.isArray(task.fbAuth.authResponse.userID);
    search[(isArray) ? 'keys': 'key'] = task.fbAuth.authResponse.userID;
    pluginProfileDb.query('by_facebook_id', search, function (err, rows) {
      if (err) return cb(err);
      if (!!rows.length)
        if (isArray) {
          task.profile = rows.map(function (v) {
            return v.doc;
          });
        } else {
          task.profile = rows[0].doc;
        }
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
