var utils = require('hoodie-utils-plugins')('cordovafb:db'),
    ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI,
    async = require('async');

module.exports = function (hoodie, dbPluginProfile, dbname) {

  /**
   * Profile _dbname
   */

  var db = new ExtendedDatabaseAPI(hoodie, hoodie.database(dbname));


  var addLookupByFbId = function (callback) {

    var index = {
      map: function (doc) {
        if (doc.type === 'profile' && !!doc.facebook && !!doc.facebook.me && !!doc.facebook.me.id)
          emit(doc.facebook.me.id, doc._id);
      }
    };

    dbPluginProfile.addIndex('by_facebook_id', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };



  async.series([
    async.apply(addLookupByFbId),
  ],
  function (err) {
    if (err) {
      console.error(
        'setup db error() error:\n' + (err.stack || err.message || err.toString())
      );
    }
  });


  return db;
};
